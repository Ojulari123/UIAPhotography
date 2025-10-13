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
from tables import get_db, Products, CheckoutInfo, Shipping, ShippingInfo, Orders, OrderItem
from schemas import CreateOrder, OrderResponse, OrderItemResponse, CheckoutInfoResponse, ProductType, ShippingData, CreateShippingInfo, ShippingInfoResponse, StatusType, PaymentIntentRequest, PaymentIntentResponse, PaymentVerificationRequest, ShippingData, CartItem
from func import calculate_order_shipping_and_tax, calculate_checkout_total_for_order, send_order_confirmation_email, send_order_status_email, calculate_order_weight, generate_signed_cloudinary_url, reset_primary_key_sequence
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional, List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from decimal import Decimal
from sqlalchemy import text

logger = logging.getLogger(__name__)

orders_router = APIRouter()
payment_router = APIRouter()
email_router = APIRouter()
checkout_router = APIRouter()

load_dotenv()

@orders_router.post("/order", response_model=OrderResponse)
async def create_order( order_data: CreateOrder, shipping_type: str = "standard", shipping: Optional[ShippingData] = None, db: Session = Depends(get_db)):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="No items provided for order")

    new_order = Orders(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        status=StatusType.ordered.value,
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    merged_items = {}
    for item in order_data.items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        key = (item.product_id, item.product_type.value.lower())
        if key in merged_items:
            merged_items[key]["quantity"] += item.quantity
        else:
            merged_items[key] = {
                "product_id": item.product_id,
                "product_type": item.product_type.value.lower(),
                "quantity": item.quantity,
                "price": Decimal(item.price),
                "name": product.title 
            }

    subtotal = sum(item["price"] * item["quantity"] for item in merged_items.values())
    has_physical = any(item["product_type"] == ProductType.physical for item in merged_items.values())

    shipping_fee = Decimal("0.0")
    tax_amount = Decimal("0.0")
    shipping_entry = None
    if has_physical:
        if not shipping:
            raise HTTPException(status_code=400, detail="Shipping info required for physical items")
        shipping_fee, tax_amount = calculate_order_shipping_and_tax(list(merged_items.values()), shipping.country_code, shipping_type)
        shipping_entry = Shipping(
            order_id=None, 
            country_code=shipping.country_code,
            address_line1=shipping.address_line1,
            address_line2=shipping.address_line2,
            city=shipping.city,
            state=shipping.state,
            postal_code=shipping.postal_code,
            shipping_fee=float(shipping_fee),
            tax=float(tax_amount)
        )

    order_total = subtotal + shipping_fee + tax_amount

    new_order = Orders(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        status=StatusType.ordered.value,
        order_total=float(order_total),
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    new_checkout = CheckoutInfo(
        order_id=new_order.id,
        customer_name=order_data.customer_name,
        email=order_data.customer_email,
        amount_to_be_paid=order_total,
        amount_paid=order_total,
        currency="GBP",
        shipping_fee=float(shipping_fee),
        tax_amount=float(tax_amount),
        payment_status=StatusType.ordered.value,
        transaction_id=str(uuid.uuid4()),
    )
    db.add(new_checkout)
    db.commit()
    db.refresh(new_checkout)

    if shipping_entry:
        shipping_entry.order_id = new_order.id
        db.add(shipping_entry)
        db.commit()
        db.refresh(shipping_entry)

    for item in merged_items.values():
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product_id"],
            product_type=item["product_type"],
            quantity=item["quantity"],
            price_at_purchase=float(item["price"] * item["quantity"])
        )
        db.add(order_item)
    db.commit()
    db.refresh(new_order)

    return OrderResponse(
        id=new_order.id,
        customer_name=new_order.customer_name,
        customer_email=new_order.customer_email,
        status=new_order.status,
        created_at=new_order.created_at,
        items=[
            OrderItemResponse(
                product_id=item["product_id"],
                name=item["name"],
                price=float(item["price"]),
                quantity=item["quantity"],
                product_type=item["product_type"]
            )
            for item in merged_items.values()
        ],
        order_total=float(order_total) 
    )
@orders_router.post("/reset-number")
async def reset_primary_key_sequence():
    reset_primary_key_sequence()
    return{"detail":"noicee"}

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
    orders = db.query(Orders).all()
    order_responses = []
    for order in orders:
        items = [
            OrderItemResponse(
                product_id=item.product_id,
                name=item.product.title, 
                price=float(item.price_at_purchase),  
                quantity=item.quantity,
                product_type=item.product_type
            )
            for item in order.items
        ]

        order_responses.append(OrderResponse(
            id=order.id,
            customer_name=order.customer_name,
            status=order.status,
            items=items,
            order_total=float(order.order_total)            
        ))

    return order_responses

@email_router.post("/send-order-confirmation/{order_id}")
async def order_confirmation_via_email(order_id:int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        send_order_confirmation_email(order, db)
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
        order.status = "shipped"
        db.commit()
        db.refresh(order)

        send_order_status_email(order, db)

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

@checkout_router.delete("/delete-all-checkout")
async def delete_all_checkout(db: Session = Depends(get_db)):
    delete_checkout = db.query(CheckoutInfo).delete()

    db.commit()
    return {"detail": f"Deleted all the checkout info from the CheckoutInfo table"}

@payment_router.post("/payment/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(data: PaymentIntentRequest, db: Session = Depends(get_db)):
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    subtotal = sum(item.price * item.quantity for item in data.items)

    has_physical = any(getattr(item.product_type, "value", item.product_type) == ProductType.physical.value for item in data.items )
    shipping_fee = Decimal("0.0")
    tax = Decimal("0.0")

    shipping_payload = None
    if has_physical:
        if not data.shipping:
            raise HTTPException(status_code=400, detail="Shipping info required for physical items")
        
        shipping_fee, tax = calculate_order_shipping_and_tax(data.items, data.shipping.country_code)

        shipping_payload = {
            "name": data.customer.name,
            "address": {
                "line1": data.shipping.address_line1,
                "line2": data.shipping.address_line2 or "",
                "city": data.shipping.city,
                "state": data.shipping.state,
                "postal_code": data.shipping.postal_code,
                "country": data.shipping.country_code,
            }
        }

    order_total = subtotal + float(shipping_fee) + float(tax)

    try:
        stripe.api_key = stripe.api_key
        intent = stripe.PaymentIntent.create(
            amount=int(order_total * 100),
            currency="GBP",
            metadata={
                "customer_name": data.customer.name,
                "customer_email": data.customer.email,
            },
            shipping=shipping_payload 
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

    order_items_list = []
    for item in data.items:
        product = db.query(Products).filter_by(id=item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        order_items_list.append(
            OrderItem(
                product_id=product.id,
                product_type=item.product_type,
                price_at_purchase=float(item.price),
                quantity=item.quantity
            )
        )

    order = Orders(
        customer_name=data.customer.name,
        customer_email=data.customer.email,
        status=StatusType.pending,
        order_total=order_total,
        items=order_items_list
    )

    checkout_info = CheckoutInfo(
        order=order,
        customer_name=data.customer.name,
        email=data.customer.email,
        transaction_id=intent.id,
        amount_to_be_paid=order_total,
        amount_paid=0.0,
        currency="GBP",
        payment_status=StatusType.pending,
        shipping_fee=float(shipping_fee),
        tax_amount=float(tax),
        items=order_items_list
    )

    db.add(checkout_info)
    db.commit()
    db.refresh(checkout_info)

    return PaymentIntentResponse(
        client_secret=intent.client_secret,
        amount=order_total,
        currency="GBP"
    )

@payment_router.post("/payment/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        transaction_id = intent["id"]

        checkout_info = db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id).first()
        if not checkout_info:
            raise HTTPException(status_code=404, detail="Checkout Info not found")

        try:
            checkout_info.payment_status = StatusType.succeeded.value
            checkout_info.amount_paid = checkout_info.amount_to_be_paid
            db.flush()

            if not checkout_info.order_id:
                new_order = Orders(
                    customer_name=checkout_info.customer_name,
                    customer_email=checkout_info.email,
                    status=StatusType.ordered.value,
                    created_at=datetime.utcnow(),
                    order_total=checkout_info.amount_to_be_paid,
                )
                db.add(new_order)
                db.flush()

                checkout_info.order_id = new_order.id

                for item in checkout_info.items:
                    order_item = OrderItem(
                        order_id=new_order.id,
                        product_id=item["product_id"],
                        product_type=item["product_type"],
                        quantity=item["quantity"],
                        price_at_purchase=float(item["price"] * item["quantity"]),
                        checkout_info_id=checkout_info.id
                    )
                    db.add(order_item)
                db.flush()
            else:
                new_order = db.query(Orders).filter(Orders.id == checkout_info.order_id).first()

            has_physical = any(getattr(item.product_type, "value", str(item.product_type)).lower() == "physical" for item in new_order.items)
            if has_physical:
                shipping_info = intent.get("shipping")
                if shipping_info:
                    address = shipping_info.get("address", {})
                    shipping_record = Shipping(
                        order_id=new_order.id,
                        address_line1=address.get("line1", ""),
                        address_line2=address.get("line2", ""),
                        city=address.get("city", ""),
                        state=address.get("state", ""),
                        postal_code=address.get("postal_code", ""),
                        country_code=address.get("country", ""),
                        shipping_fee=checkout_info.shipping_fee,
                        tax=checkout_info.tax_amount
                    )
                    db.add(shipping_record)
                    db.flush()

            send_order_confirmation_email(new_order,db)

        except Exception as e:
            db.rollback() 
            raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        transaction_id = intent["id"]
        checkout_info = db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id).first()
        if checkout_info:
            checkout_info.payment_status = StatusType.failed.value
            db.commit()

    return {"status": "success"}

# @payment_router.post("/payment/webhook-test/{order_id}")
# async def stripe_webhook_test(order_id: int, request: Request, db: Session = Depends(get_db)):
#     payload = await request.json()

#     event_type = payload.get("type")
#     intent = payload.get("data", {}).get("object", {})
#     transaction_id = intent.get("id")

#     checkout_info = db.query(CheckoutInfo).filter(CheckoutInfo.transaction_id == transaction_id, CheckoutInfo.order_id == order_id).first()
#     if not checkout_info:
#         raise HTTPException(status_code=404, detail="Either Order / Transcation ID is Incorrect")

#     if checkout_info:
#         checkout_info.payment_status = StatusType.succeeded.value
#         checkout_info.amount_paid = checkout_info.amount_to_be_paid
#         db.commit()
#         db.refresh(checkout_info)

#     order = db.query(Orders).filter(Orders.id == order_id).first()
#     if order:
#             order.status = StatusType.paid 
#             db.commit()
#             db.refresh(order)

#     return {"status": "success"}

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

@orders_router.delete("/delete-all-orderitems")
async def delete_all_orderitems(db: Session = Depends(get_db)):
    delete = db.query(OrderItem).delete()
    db.commit()
    return{"detail": "deleted all order items from the OrderItems table"}

@orders_router.delete("/delete-all-orders")
async def delete_all_orders(db: Session = Depends(get_db)):
    delete_orders = db.query(Orders).delete()
    db.commit()
    return {"detail": f"Deleted {delete_orders} orders from the Orders table"}

@orders_router.post("/weight")
async def weight(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="No order found")
    
    total_weight_g = calculate_order_weight(order, db, gsm=300)

    db.commit()

    return {"order_id": order.id, "total_weight_g": total_weight_g}
