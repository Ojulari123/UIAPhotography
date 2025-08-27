from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Query, Request
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import smtplib
from dotenv import load_dotenv
import uuid
import logging
import stripe
from tables import Products, CheckoutInfo, Shipping, ShippingInfo
from schemas import CreateOrder, OrderResponse, OrderItemCreate, OrderItemResponse, CheckoutInfoResponse, ShippingData, CreateShippingInfo, ShippingInfoResponse, StatusType
from func import calculate_shipping_and_tax, calculate_checkout_total_for_order, send_order_confirmation_email, send_order_status_email
from tables import get_db, Orders, OrderItem, Products
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional, List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from decimal import Decimal

logger = logging.getLogger(__name__)

orders_router = APIRouter()
payment_router = APIRouter()
email_router = APIRouter()
checkout_router = APIRouter()

load_dotenv()
STRIPE_API_KEY = os.getenv("STRIPE_PUBLIC_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@orders_router.post("/order", response_model=OrderResponse)
async def create_order(order: CreateOrder, db: Session = Depends(get_db)):
    product_ids = [item.product_id for item in order.items]
    unique_ids = set(product_ids)

    products = db.query(Products).filter(Products.id.in_(unique_ids)).all()
    if len(products) != len(unique_ids):
        raise HTTPException(status_code=404, detail="One or more products not found")
    
    new_order = Orders(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        status="ordered",
        created_at=datetime.now()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    merged_items = {}
    for item in order.items:
        key = (item.product_id, item.product_type)
        if key in merged_items:
            merged_items[key]["quantity"] += item.quantity
        else:
            merged_items[key] = {
                "product_id": item.product_id,
                "product_type": item.product_type,
                "quantity": item.quantity,
            }

    for item in merged_items.values():
        product = None
        for p in products:
            if p.id == item["product_id"]:
                product = p
                break

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product_id"],
            product_type=item["product_type"],
            price_at_purchase=product.price * item["quantity"],
            quantity=item["quantity"]
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    return new_order

@orders_router.post("/input-shipping-info/{order_id}", response_model=ShippingInfoResponse)
async def input_shipping_info(order_id: int, text: CreateShippingInfo, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    shipping_info = ShippingInfo(
        order_id=order.id,
        carrier=text.carrier,
        tracking_number=text.tracking_number,
        tracking_url=text.tracking_url
    )
    db.add(shipping_info)
    db.commit()
    db.refresh(shipping_info)

    return shipping_info

@orders_router.get("/view-orders",response_model=List[OrderResponse])
async def view_orders_table(db: Session = Depends(get_db)):
    order_table_query = db.query(Orders).all()
    return order_table_query

@email_router.post("/send-order-confirmation/{order_id}")
async def order_confirmation_via_email(order_id:int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        send_order_confirmation_email(order)
    except Exception as e:
        logger.error(f"Failed to send email for order_id {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    
    return {"message": "Order confirmation email sent successfully"}

@email_router.post("/send-order-update/{order_id}")
async def send_order_status_via_email(order_id:int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        send_order_status_email(order, db)

        Orders.status = "shipped"
        db.commit()
        db.refresh(order)

    except Exception as e:
        logger.error(f"Failed to send email for order_id {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    
    return {"message": "Order Status email sent successfully"}
    
@checkout_router.get("/calculate-total", response_model=CheckoutInfoResponse)
async def calculate_checkout_endpoint(order_id: Optional[int] = None, customer_name: Optional[str] = None, db: Session = Depends(get_db)):
    if order_id:
        order = db.query(Orders).filter(Orders.id == order_id).first()
    elif customer_name:
        order = db.query(Orders).filter(Orders.customer_name == customer_name).first()
    else:
        raise HTTPException(status_code=400, detail="Provide order_id or customer_name")

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    checkout_info = calculate_checkout_total_for_order(order, db)
    return checkout_info

@payment_router.post("/payment/{order_id}", response_model=dict)
async def paying_for_order(order_id: int, shipping: Optional[ShippingData], db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    has_physical = any(item.product_type == "physical" for item in order.items)

    shipping_fee = Decimal("0.0")
    tax = Decimal("0.0")

    if has_physical:
        if not shipping:
            raise HTTPException(status_code=400, detail="Shipping info required for physical items")
        
        shipping_fee, tax = calculate_shipping_and_tax(order.items, shipping.country_code)
        shipping_record = Shipping(
            order_id=order.id,
            country_code=shipping.country_code,
            address_line1=shipping.address_line1,
            address_line2=shipping.address_line2,
            city=shipping.city,
            state=shipping.state,
            postal_code=shipping.postal_code,
            shipping_fee=shipping_fee,
            tax=tax
        )
        db.add(shipping_record)

    db.commit()

    checkout_info = calculate_checkout_total_for_order(order, db)

    stripe.api_key = STRIPE_API_KEY
    payment_intent = stripe.PaymentIntent.create(
        amount=int(checkout_info.amount_to_be_paid * 100), 
        currency=checkout_info.currency.lower(),
        metadata={"order_id": order.id, "customer_name": order.customer_name}
    )

    checkout_info.transaction_id = payment_intent.id
    db.commit()
    db.refresh(checkout_info)

    checkout_info_data = CheckoutInfoResponse.model_validate(checkout_info, from_attributes=True)

    return {"checkout_info": checkout_info_data.model_dump(), "client_secret": payment_intent.client_secret}

# @payment_router.post("/payment/webhook")
# async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
#     payload = await request.body()
#     sig_header = request.headers.get("stripe-signature")

#     try:
#         event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
#     except stripe.error.SignatureVerificationError:
#         raise HTTPException(status_code=400, detail="Invalid Stripe signature")
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

#     if event["type"] == "payment_intent.succeeded":
#         intent = event["data"]["object"]
#         transaction_id = intent["id"]

#         checkout_info = (db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id).first())

#         if checkout_info:
#             checkout_info.payment_status = "succeeded"
#             checkout_info.amount_paid = checkout_info.amount_to_be_paid
#             db.commit()
#             db.refresh(checkout_info)

#             order = db.query(Orders).filter(Orders.id == checkout_info.order_id).first()
#             if order:
                # order.status = "paid"
                # db.commit()
                # db.refresh(order)

#                 has_physical = any(item.product.product_type == "physical" for item in order.items)
#                 if has_physical:
#                     shipping_info = intent.get("shipping")
#                     if shipping_info and shipping_info.get("address"):
#                         country_code = shipping_info["address"].get("country")
#                         if country_code:
#                             shipping_entry = (
#                                 db.query(Shipping)
#                                 .filter(Shipping.order_id == order.id)
#                                 .first()
#                             )
#                             if not shipping_entry:
#                                 raise HTTPException(status_code=404, detail="Shipping entry not found for order")
#                             shipping_entry.country_code = country_code
#                             db.commit()
#                             db.refresh(shipping_entry)

#                 try:
#                     send_order_confirmation_email(order)
#                 except Exception as e:
#                     logger.error(f"Failed to send confirmation email: {e}")

#     elif event["type"] == "payment_intent.payment_failed":
#         intent = event["data"]["object"]
#         transaction_id = intent["id"]

#         checkout_info = (db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id).first())

#         if checkout_info:
#             checkout_info.payment_status = "failed"
#             db.commit()

#     return {"status": "success"}

@payment_router.post("/payment/webhook-test/{order_id}")
async def stripe_webhook_test(order_id: int, request: Request, db: Session = Depends(get_db)):
    payload = await request.json()

    event_type = payload.get("type")
    intent = payload.get("data", {}).get("object", {})
    transaction_id = intent.get("id")

    checkout_info = db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id, CheckoutInfo.order_id == order_id).first()
    if not checkout_info:
        raise HTTPException(status_code=404, detail="Either Order / Transcation ID is Incorrect")

    if checkout_info:
        checkout_info.payment_status = "succeeded"
        checkout_info.amount_paid = checkout_info.amount_to_be_paid
        db.commit()
        db.refresh(checkout_info)

    order = db.query(Orders).filter(Orders.id == order_id).first()
    if order:
            order.status = StatusType.paid 
            db.commit()
            db.refresh(order)

    return {"status": "success"}

@orders_router.delete("/delete-an-order")
async def delete_an_order(order_id: Optional[int]= None, customer_name: Optional[str]= None, db: Session = Depends(get_db)):
    if order_id:
        delete_order_query = db.query(Orders).filter(Orders.id == order_id).first()
    elif customer_name:
        delete_order_query = db.query(Orders).filter(Orders.title == customer_name).first()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not delete_order_query:
        raise HTTPException(status_code=404, detail="This artwork cannot be found in the Products table")
    
    db.delete(delete_order_query)
    db.commit()
    return {"detail": f"Order ID {order_id or ''} / Customer {customer_name or ''} has been deleted"}
    
@orders_router.delete("/delete-all-orders")
async def delete_all_orders(db: Session = Depends(get_db)):
    delete_orders = db.query(Orders).delete()
    db.commit()
    return {"detail": f"Deleted {delete_orders} orders from the Orders table"}
