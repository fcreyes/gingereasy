from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


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
    title: str = Field(..., max_length=255)
    description: str | None = None
    price: float
    address: str = Field(..., max_length=255)
    neighborhood: str | None = Field(None, max_length=200)
    square_feet: int | None = None
    num_rooms: int | None = None
    num_candy_canes: int | None = None
    has_gumdrop_garden: bool | None = False
    frosting_type: str | None = Field(None, max_length=500)
    listing_type: ListingType | None = ListingType.COTTAGE
    status: ListingStatus | None = ListingStatus.AVAILABLE
    image_url: str | None = Field(None, max_length=500)


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    description: str | None = None
    price: float | None = None
    address: str | None = Field(None, max_length=255)
    neighborhood: str | None = Field(None, max_length=200)
    square_feet: int | None = None
    num_rooms: int | None = None
    num_candy_canes: int | None = None
    has_gumdrop_garden: bool | None = None
    frosting_type: str | None = Field(None, max_length=500)
    listing_type: ListingType | None = None
    status: ListingStatus | None = None
    image_url: str | None = Field(None, max_length=500)


class ListingResponse(ListingBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    owner_id: int | None = None

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
    username: str | None = None
