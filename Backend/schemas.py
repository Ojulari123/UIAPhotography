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
    pending = "pending"
    ordered = "ordered"
    succeeded = "succeeded"
    failed = "failed"
    shipped = "shipped"
    delivered = "delivered"

class DimensionType(str, enum.Enum):
    A3 = "A3"
    A4 = "A4"
    A5 = "A5"

class PortfolioType(str, enum.Enum):
    DIGITAL = "digital"
    NATURE = "nature"
    WILDLIFE = "wildlife"
    LANDSCAPE = "landscape"

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

    model_config = {
        "from_attributes": True
    }

class CartItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    product_type: ProductType 


class CreateOrder(BaseModel):
    customer_name: str
    customer_email: EmailStr
    phone_number: str
    items: List[CartItem]

class OrderItemResponse(BaseModel):
    product_id: int
    name: str                
    price: float            
    quantity: int
    product_type: ProductType

    class Config:
        orm_mode = True 

class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    phone_number: str | None = None
    status: StatusType
    items: List[OrderItemResponse]
    order_total: float

    model_config = {
        "from_attributes": True
    }

class CheckoutInfoResponse(BaseModel):
    order_id: int
    customer_name: str
    email: str
    phone_number: str
    amount_to_be_paid: float
    amount_paid: float
    currency: str
    payment_status: str
    transaction_id: str
    collected_at: datetime

    model_config = {
        "from_attributes": True
    }

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
    order_status: StatusType

class ShippingInfoResponse(BaseModel):
    id: int
    order_id: int
    carrier: str
    tracking_number: str
    tracking_url: str

    model_config = {
        "from_attributes": True
    }

class CustomerData(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class ShippingData(BaseModel):
    country_code: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str

class PaymentIntentRequest(BaseModel):
    currency: str = "GBP"
    items: List[CartItem]
    customer: CustomerData
    shipping: Optional[ShippingData] = None

class PaymentIntentResponse(BaseModel):
    client_secret: str
    amount: float
    currency: str

class PaymentVerificationRequest(BaseModel):
    transaction_id: str  
    status: str          

class PortfolioCreate(BaseModel):
    title: str
    category: PortfolioType

class PortfolioImageResponse(BaseModel):
    id: int
    image_url: str
    thumbnail_url: str | None = None

    class Config:
        orm_mode = True

class PortfolioResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: PortfolioType
    images: list[PortfolioImageResponse]

    class Config:
        orm_mode = True

class PicOfTheWeekResponse(BaseModel):
    id: int
    image_url: str
    poem: str

    class Config:
        orm_mode = True

class AdminCreate(BaseModel):
    username: str
    password: str