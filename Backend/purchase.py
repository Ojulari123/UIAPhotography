from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Query
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import logging
import uuid
from tables import Products, CheckoutInfo
from schemas import CreateOrder, OrderResponse, OrderItemCreate, OrderItemResponse, CheckoutInfoResponse
from tables import get_db, Orders, OrderItem, Products
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional, List

orders_router = APIRouter()
payment_router = APIRouter()
email_router = APIRouter()
checkout_router = APIRouter()

load_dotenv()
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("SENDER_EMAIL")

logger = logging.getLogger(__name__)


from fastapi import HTTPException
from datetime import datetime

@orders_router.post("/order", response_model=OrderResponse)
async def create_order(order: CreateOrder, db: Session = Depends(get_db)):
    product_ids = [item.product_id for item in order.items]

    products = db.query(Products).filter(Products.id.in_(product_ids)).all()
    if len(products) != len(product_ids):
        raise HTTPException(status_code=404, detail="One or more products not found")

    new_order = Orders(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        created_at=datetime.now()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            price_at_purchase=product.price
        )
        db.add(order_item)
        db.commit()
        db.refresh(new_order)

    return new_order


@orders_router.get("/view-orders",response_model=List[OrderResponse])
async def view_orders_table(db: Session = Depends(get_db)):
    order_table_query = db.query(Orders).all()
    return order_table_query

@email_router.post("/send-order-confirmation/{order_id}")
async def order_confirmation_via_email(order_id:int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    product_title = order.product.title if hasattr(order, "product") else "your product"
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=order.customer_email,
        subject=f"Order Confirmation for {product_title}",
        html_content=f"""
            <p>Hi {order.customer_name},</p>
            <p>Thank you for purchasing {product_title}.</p>
            <p>We have received your order and it is being processed.</p>
            <p>Best regards,<br/>Your Company</p>
        """
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)
        logger.info(f"SendGrid response status: {response.status_code} for order_id {order_id}")
    except Exception as e:
        logger.error(f"Failed to send email for order_id {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "Order confirmation email sent successfully"}
    
@checkout_router.post("/calculate-checkout-total", response_model=CheckoutInfoResponse)
async def calculate_checkout_total(order_id: Optional[int] = None, customer_name: Optional[str] = None, db: Session = Depends(get_db)):
    if order_id:
        total = db.query(func.sum(OrderItem.price_at_purchase)).filter(OrderItem.order_id == order_id).scalar()
        order = db.query(Orders).filter(Orders.id == order_id).first()
        product_item = db.query(OrderItem).filter(OrderItem.order_id == order_id).first()

    elif customer_name:
        order = db.query(Orders).filter(Orders.customer_name == customer_name).first()
        if not order:
            raise HTTPException(status_code=404, detail="Customer name not found")
        total = db.query(func.sum(OrderItem.price_at_purchase)).filter(OrderItem.order_id == order.id).scalar()
        product_item = db.query(OrderItem).filter(OrderItem.order_id == order.id).first()
        order_id = order.id

    else:
        raise HTTPException(status_code=400, detail="Kindly enter either an Order ID or a Customer name")

    if total is None:
        raise HTTPException(status_code=404, detail="Order ID not found or has no items")

    checkoutTotal = CheckoutInfo(
        product_id=product_item.product_id if product_item else 0,
        customer_name=order.customer_name,
        email=order.customer_email,
        amnount_to_be_paid=total,
        amount_paid=0,
        currency="GBP",
        payment_status="pending",
        transaction_id=str(uuid.uuid4()),
        collected_at=datetime.now()
    )
    db.add(checkoutTotal)    
    db.commit()           
    db.refresh(checkoutTotal)
    return checkoutTotal