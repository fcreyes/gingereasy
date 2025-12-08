import enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Integer, default=1)  # boolean as int for consistency
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to listings
    listings = relationship("Listing", back_populates="owner")


class ListingStatus(str, enum.Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"


class ListingType(str, enum.Enum):
    COTTAGE = "cottage"
    MANSION = "mansion"
    CABIN = "cabin"
    CASTLE = "castle"
    TOWNHOUSE = "townhouse"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    neighborhood = Column(String(100))

    # Gingerbread house specific fields
    square_feet = Column(Integer)
    num_rooms = Column(Integer)
    num_candy_canes = Column(Integer)
    has_gumdrop_garden = Column(Integer, default=0)  # boolean as int
    frosting_type = Column(String(100))

    listing_type = Column(String(50), default=ListingType.COTTAGE.value)
    status = Column(String(50), default=ListingStatus.AVAILABLE.value)

    image_url = Column(String(500))

    # Owner relationship
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="listings")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
