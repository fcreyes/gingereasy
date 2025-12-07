from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
import enum
from database import Base


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

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
