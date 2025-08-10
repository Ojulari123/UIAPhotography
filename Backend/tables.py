from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Boolean, Numeric, Date, TIMESTAMP, func, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
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
    image_file = Column(Text, nullable=True)
    thumbnail_file = Column(Text, nullable=True)
    price = Column(Numeric(6, 2), nullable=False)
    is_for_sale = Column(Boolean, default=True)
    resolution = Column(String(100),nullable=True)
    file_format = Column(String(30),nullable=True)
    file_size_mb = Column(DECIMAL(5, 2),nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    productid_relationship = relationship("CheckoutInfo", primaryjoin="Products.id == CheckoutInfo.product_id", back_populates="productid_rel")

class CheckoutInfo(Base):
    __tablename__ = "Checkout_Info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("Photos.id"), nullable=False)  
    customer_name = Column(String(255), nullable=False)                     
    email = Column(String(255), nullable=False)  
    amnount_to_be_paid = Column(Numeric(6, 2), nullable=False)                  
    amount_paid = Column(Numeric(6, 2), nullable=False)                     
    currency = Column(String(10), nullable=False, default="GBP")        
    payment_status = Column(String(50), nullable=False, default="pending")    
    transaction_id = Column(String(255), unique=True, nullable=False)                         
    collected_at = Column(TIMESTAMP(timezone=True), server_default=func.now()) 

    productid_rel = relationship("Products", foreign_keys=[product_id], back_populates="productid_relationship")

class Orders(Base):
    __tablename__ = "Orders"

    id = Column(Integer, primary_key=True)
    customer_name = Column(String(255), nullable=False) 
    customer_email = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete", passive_deletes=True)

class OrderItem(Base):
    __tablename__ = "OrderItems"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("Orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("Photos.id"), nullable=False)
    price_at_purchase = Column(Numeric(6, 2), nullable=False)
    
    order = relationship("Orders", back_populates="items", foreign_keys=[order_id])
    product = relationship("Products", foreign_keys=[product_id])

Base.metadata.create_all(engine)

def get_db():
    db = Local_Session()
    try:
        yield db
    finally:
        db.close()