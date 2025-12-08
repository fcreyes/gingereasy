import enum
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationship to listings
    listings: Mapped[list["Listing"]] = relationship("Listing", back_populates="owner")


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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    neighborhood: Mapped[str | None] = mapped_column(String(200))

    # Gingerbread house specific fields
    square_feet: Mapped[int | None] = mapped_column(Integer)
    num_rooms: Mapped[int | None] = mapped_column(Integer)
    num_candy_canes: Mapped[int | None] = mapped_column(Integer)
    has_gumdrop_garden: Mapped[int] = mapped_column(Integer, default=0)
    frosting_type: Mapped[str | None] = mapped_column(String(500))

    listing_type: Mapped[str] = mapped_column(String(50), default=ListingType.COTTAGE.value)
    status: Mapped[str] = mapped_column(String(50), default=ListingStatus.AVAILABLE.value)

    image_url: Mapped[str | None] = mapped_column(String(500))

    # Owner relationship
    owner_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    owner: Mapped["User | None"] = relationship("User", back_populates="listings")

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )
