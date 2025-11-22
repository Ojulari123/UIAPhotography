from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Boolean, Numeric, Date, TIMESTAMP, func, DECIMAL, Enum, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from schemas import ProductType, StatusType, DimensionType, PortfolioType
import os
from dotenv import load_dotenv

load_dotenv()

PG_USER=os.getenv("PGUSER")
PG_PASSWORD=os.getenv("PGPASSWORD")
PG_DB=os.getenv("PGDB")
PG_HOST=os.getenv("PGHOST")
PG_PORT = os.getenv("PGPORT")

db_url = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}"

engine = create_engine(db_url)
Local_Session = sessionmaker(bind=engine)
Base = declarative_base()

class Products(Base):
    __tablename__ = "Photos"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    image_url = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    price = Column(Numeric(6, 2), nullable=False)
    is_for_sale = Column(Boolean, default=True)
    dimensions = Column(Enum(DimensionType, name="dimension_enum"), nullable=True)
    resolution = Column(String(100),nullable=True)
    file_format = Column(String(30),nullable=True)
    file_size_mb = Column(DECIMAL(5, 2),nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("OrderItem", back_populates="product")

class CheckoutInfo(Base):
    __tablename__ = "Checkout_Info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("Orders.id"), nullable=False, unique=True)  
    customer_name = Column(String(255), nullable=False)                     
    email = Column(String(255), nullable=False)  
    amount_to_be_paid = Column(Numeric(6, 2), nullable=False)                  
    amount_paid = Column(Numeric(6, 2), nullable=False)                     
    currency = Column(String(10), nullable=False, default="GBP")        
    payment_status = Column(Enum(StatusType, name="order_status_enum"),default=StatusType.pending)
    transaction_id = Column(String(255), unique=True, nullable=False)             
    shipping_fee = Column(Numeric(6, 2), nullable=False, default=0.00)
    tax_amount = Column(Numeric(6, 2), nullable=False, default=0.00)            
    collected_at = Column(TIMESTAMP(timezone=True), server_default=func.now()) 

    order = relationship("Orders", back_populates="checkout_info")
    items = relationship("OrderItem", back_populates="checkout_info")

class Orders(Base):
    __tablename__ = "Orders"

    id = Column(Integer, primary_key=True)
    customer_name = Column(String(255), nullable=False) 
    customer_email = Column(String(255), nullable=False)
    status = Column(Enum(StatusType, name="order_status_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    order_total = Column(Numeric(6, 2), nullable=False, default=0.00)
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete", passive_deletes=True)
    shipping = relationship("Shipping", uselist=False, back_populates="order", cascade="all, delete", passive_deletes=True)
    checkout_info = relationship("CheckoutInfo", uselist=False, back_populates="order")
    shipping_info = relationship("ShippingInfo", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "OrderItems"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("Orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("Photos.id"), nullable=False)
    product_type = Column(Enum(ProductType, name="product_type_enum"), nullable=False)
    price_at_purchase = Column(Numeric(6, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    checkout_info_id = Column(Integer, ForeignKey("Checkout_Info.id")) 

    order = relationship("Orders", back_populates="items", foreign_keys=[order_id])
    product = relationship("Products", foreign_keys=[product_id])
    checkout_info = relationship("CheckoutInfo", back_populates="items")

class Shipping(Base):
    __tablename__ = "Shipping"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("Orders.id", ondelete="CASCADE"), nullable=False)
    country_code = Column(String(10), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    shipping_fee = Column(Numeric(6, 2), nullable=False, default=0.00)
    tax = Column(Numeric(6, 2), nullable=False, default=0.00)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    order = relationship("Orders", back_populates="shipping")

class ShippingInfo(Base):
    __tablename__ = "Shipping_info"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("Orders.id"), nullable=False)
    carrier = Column(String, nullable=False)
    tracking_number = Column(String, nullable=False)
    tracking_url = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    order = relationship("Orders", back_populates="shipping_info")

class Portfolio(Base):
    __tablename__ = "Portfolio"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)
    category = Column(Enum(PortfolioType, name="portfolio_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    images = relationship("PortfolioImages", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioImages(Base):
    __tablename__ = "Portfolio_images"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("Portfolio.id"), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    portfolio = relationship("Portfolio", back_populates="images")

class PicOfTheWeek(Base):
    __tablename__ = "Pic_of_the_week"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    poem = Column(Text, nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

Base.metadata.create_all(engine)

def get_db():
    db = Local_Session()
    try:
        yield db
    finally:
        db.close()