import re
import os
from fastapi import UploadFile
import uuid
from PIL import Image
import requests
import io
from decimal import Decimal
from datetime import datetime
import resend
import uuid
import logging
import cloudinary
import cloudinary.uploader
import time
from fastapi import HTTPException
from sqlalchemy.orm import Session
from tables import Orders, OrderItem, Shipping, CheckoutInfo, ShippingInfo, Products, Portfolio, PortfolioImages
from schemas import DimensionType, DIMENSION_DETAILS, ProductType
from dotenv import load_dotenv
from sqlalchemy import text
from passlib.context import CryptContext

load_dotenv()
                   
resend.api_key = os.getenv("RESEND_API")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)



def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug

UPLOAD_DIR = "uploads"
THUMBNAIL_DIR = "thumbnails"
POEM_DIR = "pics_of_the_week"

cloudinary.config(
    cloud_name="uiaphotography",
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

def save_upload_file(upload_file: UploadFile) -> str:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    ext = os.path.splitext(upload_file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as out_file:
        content = upload_file.file.read()
        out_file.write(content)

    upload_result = cloudinary.uploader.upload(
        file_path,
        folder="uploads",
        public_id=unique_filename.split(".")[0],
        resource_type="image",
        overwrite=True,
    )

    return {
        "local_path": file_path,
        "cloudinary_url": upload_result["secure_url"],
    }

def create_thumbnail(image_path: str = None, image_url: str = None, size=(150, 150), folder: str = "thumbnails") -> dict:
    if not os.path.exists(THUMBNAIL_DIR):
        os.makedirs(THUMBNAIL_DIR)

    if image_path:
        img = Image.open(image_path)
    elif image_url:
        import requests, io
        response = requests.get(str(image_url))
        img = Image.open(io.BytesIO(response.content))
    else:
        raise ValueError("Provide either image_path or image_url")
    
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    img.thumbnail(size)
    thumb_filename = f"{uuid.uuid4().hex}.jpg"
    thumb_path = os.path.join(THUMBNAIL_DIR, thumb_filename)
    img.save(thumb_path, format="JPEG")

    upload_thumb = cloudinary.uploader.upload(
        thumb_path,
        folder=folder,
        public_id=thumb_filename.split(".")[0],
        resource_type="image",
        overwrite=True,
    )

    return {
        "local_thumbnail": thumb_path,
        "cloudinary_thumbnail_url": upload_thumb["secure_url"],
    }

def handle_image_upload(upload_file: UploadFile) -> dict:
    image_info = save_upload_file(upload_file)
    thumbnail_info = create_thumbnail(image_info["local_path"])

    return {
        "image_url": image_info["cloudinary_url"],
        "thumbnail_url": thumbnail_info["cloudinary_thumbnail_url"],
    }

async def save_pic_of_week(upload_file: UploadFile) -> dict:
    if not os.path.exists(POEM_DIR):
        os.makedirs(POEM_DIR)
    
    ext = os.path.splitext(upload_file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(POEM_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(await upload_file.read())
    
    return {"local_path": file_path}

def upload_pic_of_week(image_path: str = None, image_url: str = None) -> str:
    if image_path:
        upload_result = cloudinary.uploader.upload(
            image_path,
            folder="picOfWeek",
            resource_type="image",
            overwrite=True,
        )
    elif image_url:
        response = requests.get(image_url)
        upload_result = cloudinary.uploader.upload(
            io.BytesIO(response.content),
            folder="picOfWeek",
            resource_type="image",
            overwrite=True,
        )
    else:
        raise ValueError("Provide either image_path or image_url")
    
    return upload_result["secure_url"]


def send_order_confirmation_email(order: Orders, db: Session):
    download_links = []
    
    has_physical_items = any(
        getattr(item.product_type, "value", item.product_type) == ProductType.physical.value 
        for item in order.items
    )

    for item in order.items:
        if getattr(item.product_type, "value", item.product_type) == ProductType.digital.value:
            product = db.query(Products).filter(Products.id == item.product_id).first()
            if product and product.image_url:
                download_links.append({
                    "title": product.title,
                    "url": product.image_url
                })

    if len(order.items) == 1:
        product_title = order.items[0].product.title
    else:
        product_title = ", ".join([item.product.title for item in order.items[:-1]]) + f" and {order.items[-1].product.title}"

    items_html = ""
    for item in order.items:
        item_type = getattr(item.product_type, "value", item.product_type)
        items_html += f'<li style="margin-bottom: 8px; color: #333333; font-size: 15px;">{item.quantity}x {item.product.title} ({item_type})</li>'

    if download_links:
        links_html = "".join(
            f'<li style="margin-bottom: 8px;"><a href="{link["url"]}" target="_blank" style="color: #171F22; text-decoration: underline;">{link["title"]}</a></li>'
            for link in download_links
        )

        # download_section = f"""
        #     <p>Kindly find your downloadable file(s) below:</p>
        #     <ul>
        #         {links_html}
        #     </ul>
        # """
        download_section = f"""
            <h3 style="margin: 24px 0 12px 0; font-size: 16px; font-weight: 600; color: #171F22;">
                Your Digital Downloads:
            </h3>
            <ul>
                {links_html}
            </ul>
        """
    else:
        download_section = "<p> No digital downloads associated with this order.</p>"
    

    if has_physical_items:
        physical_notice = """
            <div style="background-color: #f8f9fa; border-left: 4px solid #171F22; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                    📦 <strong>Physical Items:</strong> You'll receive a separate email with shipping details and tracking information once your order has been dispatched.
                </p>
            </div>
        """
    else:
        physical_notice = ""

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
                <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #171F22; padding: 40px 40px; text-align: center;">
                                <h1 style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: 400; color: #ffffff; letter-spacing: 8px;">
                                    U.I.A PHOTOGRAPHY
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Divider Line -->
                        <tr>
                            <td style="background-color: #2a3439; height: 4px;"></td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="background-color: #ffffff; padding: 48px 40px;">
                                <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #171F22;">
                                    Hi {order.customer_name},
                                </h2>
                                
                                <p style="margin: 0 0 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Thank you for your order!
                                </p>
                                <p style="margin: 0 0 32px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    It's always a pleasure to have you as a customer. Enjoy your photos!
                                </p>
                                
                                <!-- Order Summary -->
                                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #171F22;">
                                    Order Summary (#{order.id}):
                                </h3>
                                <ul style="margin: 0 0 24px 0; padding-left: 20px;">
                                    {items_html}
                                </ul>
                                
                                {download_section}
                                
                                {physical_notice}
                                
                                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Best regards,<br/>
                                    <strong>UIAPhotography.</strong>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #171F22; padding: 32px 40px; text-align: center;">
                                <!-- Social Links -->
                                <p style="margin: 0 0 16px 0;">
                                    <a href="https://instagram.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Instagram</a>
                                    <span style="color: #ffffff;">|</span>
                                    <a href="https://twitter.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Twitter</a>
                                    <span style="color: #ffffff;">|</span>
                                    <a href="mailto:contact@uiaphotography.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Email</a>
                                </p>
                                
                                <!-- Copyright -->
                                <p style="margin: 0; color: #ffffff; font-size: 13px;">
                                    ©️ 2025 UIAPhotography. All rights reserved.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    try:
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": order.customer_email,
            "bcc": "no-reply@uiaphotography.com",
            "subject": f"Order Confirmation for {product_title}",
            "html": html_content
        })
        logger.info(f"Order confirmation email sent to {order.customer_email} for order_id {order.id}")
        return response
    except Exception as e:
        logger.error(f"Failed to send order confirmation email: {e}")
        raise

def send_order_status_email(order: Orders, db):
    product_titles = ", ".join(f"{item.quantity} {item.product.title} ({item.product_type.value})"for item in order.items) if order.items else "your products"

    shipping_info = db.query(ShippingInfo).filter(ShippingInfo.order_id == order.id).first()
    if shipping_info:
        shipping_carrier = shipping_info.carrier
        tracking_number = shipping_info.tracking_number
        tracking_url = shipping_info.tracking_url or "#"
        estimated_delivery = getattr(shipping_info, "ç", "N/A")
    else:
        shipping_carrier = tracking_number = tracking_url = estimated_delivery = "N/A"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
                <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #171F22; padding: 40px 40px; text-align: center;">
                                <h1 style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: 400; color: #ffffff; letter-spacing: 8px;">
                                    U.I.A PHOTOGRAPHY
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Divider Line -->
                        <tr>
                            <td style="background-color: #2a3439; height: 4px;"></td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="background-color: #ffffff; padding: 48px 40px;">
                                <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #171F22;">
                                    Hi {order.customer_name},
                                </h2>
                                
                                <p style="margin: 0 0 28px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Great news! Your order <strong>#{order.id}</strong> has been shipped and is on its way.
                                </p>
                                
                                <!-- Order Summary -->
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #171F22;">
                                    Order Summary:
                                </h3>
                                <p style="margin: 0 0 24px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    {product_titles}
                                </p>
                                
                                <!-- Shipping Details -->
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #171F22;">
                                    Shipping Details:
                                </h3>
                                <p style="margin: 0 0 4px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Carrier: {shipping_carrier}
                                </p>
                                <p style="margin: 0 0 24px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Tracking Number: {tracking_number}
                                </p>
                                
                                <!-- Track Order Link -->
                                <p style="margin: 0 0 32px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    You can track your package here: <a href="{tracking_url}" style="color: #171F22; text-decoration: underline; font-weight: 500;">Track My Order</a>
                                </p>
                                
                                <p style="margin: 0 0 24px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Thank you for shopping with us!
                                </p>
                                
                                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                    Best regards,<br/>
                                    <strong>UIAPhotography.</strong>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #171F22; padding: 32px 40px; text-align: center;">
                                <!-- Social Links -->
                                <p style="margin: 0 0 16px 0;">
                                    <a href="https://instagram.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Instagram</a>
                                    <span style="color: #ffffff;">|</span>
                                    <a href="https://twitter.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Twitter</a>
                                    <span style="color: #ffffff;">|</span>
                                    <a href="mailto:contact@uiaphotography.com" style="color: #ffffff; text-decoration: none; font-size: 14px; margin: 0 12px;">Email</a>
                                </p>
                                
                                <!-- Copyright -->
                                <p style="margin: 0; color: #ffffff; font-size: 13px;">
                                    ©️ 2025 UIAPhotography. All rights reserved.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    try:
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": order.customer_email,
            "bcc": "no-reply@uiaphotography.com",
            "subject": f"Your Order #{order.id} Has Shipped!",
            "html": html_content
        })
        logger.info(f"Order shipped email sent to {order.customer_email} for order_id {order.id}")
        return response
    except Exception as e:
        logger.error(f"Failed to send order status email: {e}")
        raise

def calculate_order_weight(order_or_items, db: Session, gsm: float = 300):
    items = getattr(order_or_items, "items", order_or_items)
    total_weight_g = 0

    for item in items:
        product_type = getattr(item, "product_type", None)
        if product_type is None:
            continue

        type_value = getattr(product_type, "value", product_type) if hasattr(product_type, "value") else product_type
        if str(type_value).lower() != "physical":
            continue
        
        product = getattr(item, "product", None)
        if not product:
            continue

        dimensions = getattr(product, "dimensions", None)
        if not dimensions:
            continue

        key = getattr(dimensions, "value", str(dimensions)).strip().upper()
        dimension_str = DIMENSION_DETAILS.get(key)
        if not dimension_str:
            continue

        match = re.search(r"([\d.]+)\s*x\s*([\d.]+)\s*cm", dimension_str)
        if not match:
            continue

        width_cm = float(match.group(1))
        length_cm = float(match.group(2))

        single_weight_g = (length_cm * width_cm * gsm / 10000)
        quantity = getattr(item, "quantity", 1)
        item_total_weight = single_weight_g * quantity
        total_weight_g += item_total_weight

    return total_weight_g

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


ROYAL_MAIL_PRICES = {
    "<=100": {
        "UK": {"standard": Decimal("4.29"), "tracked": Decimal("3.45")},
        "CA": {"standard": Decimal("7.80"), "tracked": Decimal("13.75")},
        "US": {"standard": Decimal("11.75"), "tracked": Decimal("16.15")},
        "FR": {"standard": Decimal("5.80"), "tracked": Decimal("9.70")},
        "NG": {"standard": Decimal("7.80")},
        "AU": {"standard": Decimal("8.90"), "tracked": Decimal("13.95")},
        "IE": {"standard": Decimal("5.80"), "tracked": Decimal("8.65")},
        "BR": {"standard": Decimal("7.80"), "tracked": Decimal("12.30")},
        "DK": {"standard": Decimal("5.80"), "tracked": Decimal("8.75")},
        "JP": {"standard": Decimal("7.80"), "tracked": Decimal("11.30")},
        "NL": {"standard": Decimal("6.30"), "tracked": Decimal("9.00")},
        "DE": {"standard": Decimal("5.80"), "tracked": Decimal("8.00")},
        "IT": {"standard": Decimal("6.30"), "tracked": Decimal("9.65")},
        "ES": {"standard": Decimal("6.30"), "tracked": Decimal("9.65")},
        "ZA": {"standard": Decimal("7.80"), "tracked": Decimal("12.50")},
        "OTHER": {"standard": Decimal("11.50"), "tracked": Decimal("17.00")},
    },
    "100-250": {
        "UK": {"standard": Decimal("4.29"), "tracked": Decimal("3.45")},
        "CA": {"standard": Decimal("9.40"), "tracked": Decimal("13.75")},
        "US": {"standard": Decimal("11.75"), "tracked": Decimal("16.55")},
        "FR": {"standard": Decimal("5.80"), "tracked": Decimal("9.70")},
        "NG": {"standard": Decimal("9.40")},
        "AU": {"standard": Decimal("10.05"), "tracked": Decimal("12.35")},
        "IE": {"standard": Decimal("5.80"), "tracked": Decimal("8.65")},
        "BR": {"standard": Decimal("9.40"), "tracked": Decimal("12.30")},
        "DK": {"standard": Decimal("5.80"), "tracked": Decimal("8.75")},
        "JP": {"standard": Decimal("9.40"), "tracked": Decimal("11.30")},
        "NL": {"standard": Decimal("6.30"), "tracked": Decimal("9.00")},
        "DE": {"standard": Decimal("5.80"), "tracked": Decimal("8.00")},
        "IT": {"standard": Decimal("6.30"), "tracked": Decimal("9.45")},
        "ES": {"standard": Decimal("6.30"), "tracked": Decimal("9.65")},
        "ZA": {"standard": Decimal("9.40"), "tracked": Decimal("12.50")},
        "OTHER": {"standard": Decimal("13.00"), "tracked": Decimal("19.00")},
    },
}

COUNTRY_NAME_TO_CODE = {
    "united kingdom": "UK",
    "canada": "CA",
    "united states": "US",
    "usa": "US",
    "france": "FR",
    "nigeria": "NG",
    "australia": "AU",
    "ireland": "IE",
    "brazil": "BR",
    "denmark": "DK",
    "japan": "JP",
    "netherlands": "NL",
    "germany": "DE",
    "italy": "IT",
    "spain": "ES",
    "south africa": "ZA",
}

def normalize_country(country_input: str) -> str:
    country_input = country_input.strip().lower()

    if country_input in COUNTRY_NAME_TO_CODE:
        return COUNTRY_NAME_TO_CODE[country_input]

    return country_input.upper()

def get_shipping_price(country_input: str, weight_g: float, shipping_type="standard") -> Decimal:
    country_code = normalize_country(country_input)

    # Pick weight tier
    if weight_g <= 100:
        tier = "<=100"
    elif weight_g <= 250:
        tier = "100-250"
    else:
        tier = "100-250" 

    country_prices = ROYAL_MAIL_PRICES[tier].get(country_code, ROYAL_MAIL_PRICES[tier]["OTHER"])
    
    if shipping_type not in country_prices:
        shipping_type = "standard"

    return country_prices[shipping_type]

def calculate_order_shipping_and_tax(order_or_items, country_input, shipping_type="standard"):
   
    if hasattr(order_or_items, "items"):
            items_to_process = order_or_items.items
    else:
        items_to_process = order_or_items

    country_code = normalize_country(country_input)
    total_weight_g = calculate_order_weight(items_to_process, db=None)
    shipping_cost = get_shipping_price(country_code, total_weight_g, shipping_type)

    supported_countries = {
        "US": Decimal("0.15"), "CA": Decimal("0.15"), "UK": Decimal("0.15"),
        "FR": Decimal("0.15"), "DK": Decimal("0.15"), "AU": Decimal("0.15"),
        "JP": Decimal("0.15"), "IE": Decimal("0.15"), "BR": Decimal("0.15"),
        "NG": Decimal("0.15"), "IT": Decimal("0.15"), "DE": Decimal("0.15"),
        "ES": Decimal("0.15"),
    }
    tax_rate = supported_countries.get(country_code, Decimal("0.15"))

    subtotal = Decimal("0")
    for item in items_to_process:
        if isinstance(item, dict):
            price = Decimal(str(item.get("price_at_purchase") or item.get("price")))
            quantity = item.get("quantity")
        else:
            # Normal object
            price = Decimal(getattr(item, "price_at_purchase", item.price))
            quantity = item.quantity

        subtotal += price * quantity

    total_tax = subtotal * tax_rate

    return shipping_cost, total_tax

def extract_public_id_from_url(url: str) -> str:
    try:
        path = url.split("/upload/")[1]  # get "v1760238039/uploads/..."
        path = path.split(".")[0]        # remove extension
        parts = path.split("/")          # ['v1760238039', 'uploads', 'fileid']
        public_id = "/".join(parts[1:])  # skip version number
        return public_id
    except Exception:
        return None
    
def generate_signed_cloudinary_url(original_url: str, expiry_seconds: int = 3600):
    public_id = extract_public_id_from_url(original_url)
    if not public_id:
        return original_url 
    
    signed_url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type="image",
        sign_url=False,
    )
    return signed_url

# def reset_primary_key_sequence():
#     db = Orders()  # create an active DB session
#     try:
#         db.execute(text('ALTER SEQUENCE "Photos_id_seq" RESTART WITH 1'))
#         db.commit()
#         print("✅ Sequence reset successfully")
#     except Exception as e:
#         db.rollback()
#         print("❌ Error resetting sequence:", e)
#     finally:
#         db.close()