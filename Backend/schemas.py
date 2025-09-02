from datetime import date, datetime
import enum
from fastapi import UploadFile, File
from typing import List
from enum import Enum
from pydantic import BaseModel, HttpUrl, condecimal, EmailStr
from typing import Annotated, Optional, Literal

PriceType = condecimal(max_digits=6, decimal_places=2)
FileSizeType = condecimal(max_digits=5, decimal_places=2)

class ProductType(enum.Enum):
    digital = "digital"
    physical = "physical"

class StatusType(enum.Enum):
    ordered = "ordered"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"

class DimensionType(str, enum.Enum):
    A3 = "A3"
    A4 = "A4"
    A5 = "A5"

DIMENSION_DETAILS = {
    "A3": "14.8 x 21.0 cm (11.7 x 16.5 in)",
    "A4": "21.0 x 29.7 cm (8.3 x 11.7 in)",
    "A5": "14.8 x 21.0 cm (5.8 x 8.3 in)",
}

class AddProductsbyUrlInfo (BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = "https://picsum.photos/200/300"
    price: Annotated[float,PriceType] = None
    is_for_sale: Optional[bool] = True
    dimensions: Optional[DimensionType] = DimensionType.A3
    resolution: Optional[str] = None  
    file_size_mb: Optional[Annotated[float, FileSizeType]] = None
    file_format: Optional[str] = None 

class AddProductMetafield(BaseModel):
    dimensions: DimensionType
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
    dimensions: Optional[DimensionType] = DimensionType.A3
    resolution: Optional[str] = None  
    file_size_mb: Optional[Annotated[float, FileSizeType]] = None
    file_format: Optional[str] = None 

class EditProductsData(BaseModel):
    title: str
    description: str
    price: int
    is_for_sale: bool
    dimensions: DimensionType
    resolution: Optional[str] = None  
    file_size_mb: Optional[Annotated[float, FileSizeType]] = None
    file_format: Optional[str] = None 

class OrderItemCreate(BaseModel):
    product_id: int
    product_type: ProductType
    quantity: int
    price_at_purchase: float

class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float

    class Config:
        orm_mode = True

class ShippingData(BaseModel):
    country_code: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: Optional[str] = None
    postal_code: str
    shipping_fee: Optional[float] = 0.0
    tax: Optional[float] = 0.0

class ShippingCreate(ShippingData):
    pass

class ShippingResponse(ShippingData):
    id: int
    created_at: datetime
    updated_at: datetime

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
    status: StatusType
    created_at: datetime
    items: List[OrderItemCreate]

    class Config:
        orm_mode = True

class CheckoutInfoResponse(BaseModel):
    id: int
    order_id: int
    customer_name: str
    email: str
    amount_to_be_paid: float
    amount_paid: float
    currency: str
    payment_status: str
    transaction_id: str
    collected_at: datetime

    class Config:
        orm_mode = True

class CheckoutInfo(BaseModel):
    order_id: int
    customer_name: str
    email: str
    amount_to_be_paid: float
    amount_paid: float
    currency: str
    payment_status: str
    transaction_id: str

class CreateShippingInfo(BaseModel):
    carrier: str
    tracking_number: str
    tracking_url: str

class ShippingInfoResponse(BaseModel):
    id: int
    order_id: int
    carrier: str
    tracking_number: str
    tracking_url: str

    class Config:
        orm_mode = True