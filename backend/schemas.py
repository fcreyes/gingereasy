from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ListingStatus(str, Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"


class ListingType(str, Enum):
    COTTAGE = "cottage"
    MANSION = "mansion"
    CABIN = "cabin"
    CASTLE = "castle"
    TOWNHOUSE = "townhouse"


class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    address: str
    neighborhood: Optional[str] = None
    square_feet: Optional[int] = None
    num_rooms: Optional[int] = None
    num_candy_canes: Optional[int] = None
    has_gumdrop_garden: Optional[bool] = False
    frosting_type: Optional[str] = None
    listing_type: Optional[ListingType] = ListingType.COTTAGE
    status: Optional[ListingStatus] = ListingStatus.AVAILABLE
    image_url: Optional[str] = None


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    square_feet: Optional[int] = None
    num_rooms: Optional[int] = None
    num_candy_canes: Optional[int] = None
    has_gumdrop_garden: Optional[bool] = None
    frosting_type: Optional[str] = None
    listing_type: Optional[ListingType] = None
    status: Optional[ListingStatus] = None
    image_url: Optional[str] = None


class ListingResponse(ListingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    email: str
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
