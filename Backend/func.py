import re
import os
from fastapi import UploadFile
import uuid
from PIL import Image
import requests
import io
from decimal import Decimal
from datetime import datetime
import uuid
import logging
import smtplib
from fastapi import HTTPException
from sqlalchemy.orm import Session
from tables import Orders, OrderItem, Shipping, CheckoutInfo, ShippingInfo, Products
from email.mime.multipart import MIMEMultipart
from schemas import DimensionType, DIMENSION_DETAILS
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.zoho.eu"
SMTP_PORT = 587                          
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

logger = logging.getLogger(__name__)

def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug

UPLOAD_DIR = "uploads"
THUMBNAIL_DIR = "thumbnails"

def save_upload_file(upload_file: UploadFile) -> str:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as out_file:
        content = upload_file.file.read()
        out_file.write(content)

    return file_path

def create_thumbnail(image_file: UploadFile = None, image_url: str = None, size=(150, 150)) -> str:
    if not os.path.exists(THUMBNAIL_DIR):
        os.makedirs(THUMBNAIL_DIR)

    if image_file:
        img = Image.open(image_file.file)
        ext = os.path.splitext(str(image_url).split("?")[0])[1] or ".png"

    elif image_url:
        response = requests.get(str(image_url))
        img = Image.open(io.BytesIO(response.content))
        ext = os.path.splitext(str(image_url).split("?")[0])[1] or ".png"

    else:
        raise ValueError("Provide either image_file or image_url")

    img.thumbnail(size)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(THUMBNAIL_DIR, unique_filename)

    img.save(file_path)

    return file_path

def test(order, db: Session, gsm: float = 300):
    total_weight_g = 0

    for item in order.items:
        if item.product_type.value != "physical":
            continue

        product = item.product
        if not product:
            continue

        if not product.dimensions:
            continue

        key = product.dimensions.value.strip().upper()
        dimension_str = DIMENSION_DETAILS.get(key)
        if not dimension_str:
            continue

        match = re.search(r"([\d.]+)\s*x\s*([\d.]+)\s*cm", dimension_str)
        if not match:
            continue

        width_cm = float(match.group(1))
        length_cm = float(match.group(2))

        single_weight_g = (length_cm * width_cm * gsm / 10000)
        item_total_weight = single_weight_g * item.quantity
        product.weight = item_total_weight
        total_weight_g += item_total_weight

    return total_weight_g

def calculate_shipping_and_tax(items, country_code):
    supported_countries = {
        "US": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "CA": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "UK": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "FR": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "DK": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "AU": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "JP": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "IR": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "BR": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "NG": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "IT": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "DE": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
        "ES": {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")},
    }

    country_rules = supported_countries.get(
        country_code.upper(), {"shipping": Decimal("5.00"), "tax_rate": Decimal("0.05")}
    )

    total_shipping = Decimal("0.00")
    total_tax = Decimal("0.00")

    for item in items:
        if item.product_type == "physical":
            total_shipping += country_rules["shipping"] * item.quantity
            total_tax += Decimal(item.price_at_purchase) * country_rules["tax_rate"]

    return total_shipping, total_tax

def calculate_checkout_total_for_order(order: Orders, db: Session):
    if not order.items:
        raise HTTPException(status_code=404, detail="Order has no items")

    total_items = sum(item.price_at_purchase * item.quantity for item in order.items)

    shipping_fee = Decimal("0.0")
    tax = Decimal("0.0")
    if order.shipping:
        shipping_fee = Decimal(order.shipping.shipping_fee)
        tax = Decimal(order.shipping.tax)

    checkout_total = total_items + shipping_fee + tax

    checkout_info = db.query(CheckoutInfo).filter(CheckoutInfo.order_id == order.id).first()

    if not checkout_info:
        checkout_info = CheckoutInfo(
            order_id=order.id,
            customer_name=order.customer_name,
            email=order.customer_email,
            amount_to_be_paid=checkout_total,
            amount_paid=Decimal("0.0"),
            currency="GBP",
            payment_status="pending",
            transaction_id=str(uuid.uuid4()),
            collected_at=datetime.now()
        )
        db.add(checkout_info)
    else:
        checkout_info.amount_to_be_paid = checkout_total
        checkout_info.customer_name = order.customer_name
        checkout_info.email = order.customer_email
        checkout_info.collected_at = datetime.now()

    db.commit()
    db.refresh(checkout_info)
    return checkout_info

def send_order_confirmation_email(order: Orders):
    product_title = (order.items[0].product.title if order.items else "your product")

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USERNAME
    msg["To"] = order.customer_email
    msg["Subject"] = f"Order Confirmation for {product_title}"

    html_content = f"""
        <p>Hi {order.customer_name},</p>
        <p>Thank you for purchasing {product_title}.</p>
        <p>It’s always a pleasure to have you as a customer. Enjoy your photos!</p>
        <p>Best regards,<br/>UIAPhotography</p>
    """
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, order.customer_email, msg.as_string())

    logger.info(f"Order confirmation email sent to {order.customer_email} for order_id {order.id}")

def send_order_status_email(order: Orders, db):
    product_titles = ", ".join(f"{item.quantity} {item.product.title} ({item.product_type.value})"for item in order.items) if order.items else "your products"

    shipping_info = db.query(ShippingInfo).filter(ShippingInfo.order_id == order.id).first()
    if shipping_info:
        shipping_carrier = shipping_info.carrier
        tracking_number = shipping_info.tracking_number
        tracking_url = shipping_info.tracking_url or "#"
        estimated_delivery = getattr(shipping_info, "estimated_delivery", "N/A")
    else:
        shipping_carrier = tracking_number = tracking_url = estimated_delivery = "N/A"

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USERNAME
    msg["To"] = order.customer_email
    msg["Subject"] = f"Your Order #{order.id} Has Shipped!"

    html_content = f"""
        <p>Hi {order.customer_name},</p>
        <p>Great news! Your order <strong>#{order.id}</strong> has been shipped and is on its way.</p>
        <p><strong>Order Summary:</strong><br/>{product_titles}</p>
        <p><strong>Shipping Details:</strong><br/>
           Carrier: {shipping_carrier}<br/>
           Tracking Number: {tracking_number}<br/>
        <p>You can track your package here: <a href="{tracking_url}">Track My Order</a></p>
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br/>UIAPhotography</p>
    """
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, order.customer_email, msg.as_string())

    logger.info(f"Order shipped email sent to {order.customer_email} for order_id {order.id}")
