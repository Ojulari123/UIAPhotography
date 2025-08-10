from datetime import date, datetime
from fastapi import UploadFile, File
from typing import List
from enum import Enum
from pydantic import BaseModel, HttpUrl, condecimal, EmailStr
from typing import Annotated, Optional

PriceType = condecimal(max_digits=6, decimal_places=2)
FileSizeType = condecimal(max_digits=5, decimal_places=2)

class AddProductsbyUrlInfo (BaseModel):
    id: int 
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    thumbnail_url: Optional[HttpUrl] = None
    price: Annotated[float,PriceType] = None
    is_for_sale: Optional[bool] = True
    resolution: Optional[str] = None  
    file_size_mb: Optional[Annotated[float, FileSizeType]] = None
    file_format: Optional[str] = None 

class AddProductMetafield(BaseModel):
    resolution: str 
    file_size_mb: Annotated[float, FileSizeType]
    file_format: str

class ProductsData (BaseModel):
    id : int
    title: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    image_file: Optional[str] = None
    thumbnail_file: Optional[str] = None
    price: float
    is_for_sale: bool
    resolution: Optional[str] = None  
    file_size_mb: Optional[Annotated[float, FileSizeType]] = None
    file_format: Optional[str] = None 

class OrderItemCreate(BaseModel):
    product_id: int
    price_at_purchase: float

class OrderItemResponse(BaseModel):
    product_id: int
    price_at_purchase: float

    class Config:
        orm_mode = True

class CreateOrder(BaseModel):
    customer_name: str
    customer_email: EmailStr
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    created_at: datetime
    items: List[OrderItemCreate]

    class Config:
        orm_mode = True


class CheckoutInfoResponse(BaseModel):
    id: int
    product_id: int
    customer_name: str
    email: str
    amnount_to_be_paid: float
    amount_paid: float
    currency: str
    payment_status: str
    transaction_id: str
    collected_at: datetime

    class Config:
        orm_mode = True

class CheckoutInfo(BaseModel):
    product_id: int
    customer_name: str
    email: str
    amnount_to_be_paid: float
    amount_paid: float
    currency: str
    payment_status: str
    transaction_id: str