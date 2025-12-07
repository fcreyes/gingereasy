import os
import uuid
import boto3
from botocore.client import Config
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from database import engine, get_db, Base
from models import Listing
from schemas import ListingCreate, ListingUpdate, ListingResponse, ListingStatus, ListingType

# Create tables
Base.metadata.create_all(bind=engine)

# S3/MinIO configuration
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_BUCKET = os.getenv("S3_BUCKET", "gingerbread")
S3_PUBLIC_URL = os.getenv("S3_PUBLIC_URL", "http://localhost:9000")

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    config=Config(signature_version="s3v4"),
)

app = FastAPI(title="Gingerbread Houses API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Gingerbread Houses API"}


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to S3/MinIO and return its URL"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"

    # Read file content
    content = await file.read()

    # Upload to S3/MinIO
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=filename,
            Body=content,
            ContentType=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

    # Return the public URL
    public_url = f"{S3_PUBLIC_URL}/{S3_BUCKET}/{filename}"
    return {"url": public_url, "filename": filename}


@app.get("/api/listings", response_model=List[ListingResponse])
def get_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    neighborhood: Optional[str] = None,
    listing_type: Optional[ListingType] = None,
    status: Optional[ListingStatus] = None,
    min_rooms: Optional[int] = None,
    has_gumdrop_garden: Optional[bool] = None,
):
    query = db.query(Listing)

    if search:
        query = query.filter(
            or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%"),
                Listing.address.ilike(f"%{search}%"),
                Listing.neighborhood.ilike(f"%{search}%"),
            )
        )

    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    if neighborhood:
        query = query.filter(Listing.neighborhood.ilike(f"%{neighborhood}%"))
    if listing_type:
        query = query.filter(Listing.listing_type == listing_type.value)
    if status:
        query = query.filter(Listing.status == status.value)
    if min_rooms is not None:
        query = query.filter(Listing.num_rooms >= min_rooms)
    if has_gumdrop_garden is not None:
        query = query.filter(Listing.has_gumdrop_garden == (1 if has_gumdrop_garden else 0))

    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

    # Convert has_gumdrop_garden from int to bool
    for listing in listings:
        listing.has_gumdrop_garden = bool(listing.has_gumdrop_garden)

    return listings


@app.get("/api/listings/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.has_gumdrop_garden = bool(listing.has_gumdrop_garden)
    return listing


@app.post("/api/listings", response_model=ListingResponse)
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    db_listing = Listing(
        title=listing.title,
        description=listing.description,
        price=listing.price,
        address=listing.address,
        neighborhood=listing.neighborhood,
        square_feet=listing.square_feet,
        num_rooms=listing.num_rooms,
        num_candy_canes=listing.num_candy_canes,
        has_gumdrop_garden=1 if listing.has_gumdrop_garden else 0,
        frosting_type=listing.frosting_type,
        listing_type=listing.listing_type.value if listing.listing_type else "cottage",
        status=listing.status.value if listing.status else "available",
        image_url=listing.image_url,
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    db_listing.has_gumdrop_garden = bool(db_listing.has_gumdrop_garden)
    return db_listing


@app.put("/api/listings/{listing_id}", response_model=ListingResponse)
def update_listing(listing_id: int, listing: ListingUpdate, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    update_data = listing.model_dump(exclude_unset=True)

    if "has_gumdrop_garden" in update_data:
        update_data["has_gumdrop_garden"] = 1 if update_data["has_gumdrop_garden"] else 0

    if "listing_type" in update_data and update_data["listing_type"]:
        update_data["listing_type"] = update_data["listing_type"].value

    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value

    for key, value in update_data.items():
        setattr(db_listing, key, value)

    db.commit()
    db.refresh(db_listing)
    db_listing.has_gumdrop_garden = bool(db_listing.has_gumdrop_garden)
    return db_listing


@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    db.delete(db_listing)
    db.commit()
    return {"message": "Listing deleted successfully"}


@app.get("/api/neighborhoods", response_model=List[str])
def get_neighborhoods(db: Session = Depends(get_db)):
    neighborhoods = db.query(Listing.neighborhood).distinct().filter(Listing.neighborhood.isnot(None)).all()
    return [n[0] for n in neighborhoods if n[0]]
