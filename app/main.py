from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from sqlalchemy import asc, desc

from app.database import SessionLocal
from app.models import Product

import os

app = FastAPI()

# Frontend folder path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve homepage
@app.get("/")
def home():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


# Products API
@app.get("/products")
def get_products(
    limit: int = Query(20, le=100),
    category: str = None,
    cursor: int = None,
    search: str = None,
    sort: str = "newest"
):
    db = SessionLocal()

    try:
        query = db.query(Product)

        # Category filter
        if category:
            query = query.filter(Product.category == category)

        # Search by product name
        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%")
            )

        # Cursor pagination
        if cursor:
            query = query.filter(Product.id < cursor)

        # Sorting
        if sort == "price_asc":
            query = query.order_by(asc(Product.price))

        elif sort == "price_desc":
            query = query.order_by(desc(Product.price))

        else:
            query = query.order_by(desc(Product.id))

        products = query.limit(limit).all()

        next_cursor = products[-1].id if products else None

        return {
            "count": len(products),
            "next_cursor": next_cursor,
            "items": [
                {
                    "id": p.id,
                    "name": p.name,
                    "category": p.category,
                    "price": p.price,
                    "created_at": p.created_at,
                    "updated_at": p.updated_at
                }
                for p in products
            ]
        }

    finally:
        db.close()


# Product Detail Page API
@app.get("/products/{product_id}")
def get_product(product_id: int):

    db = SessionLocal()

    try:
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if not product:
            return {
                "message": "Product not found"
            }

        return {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "created_at": product.created_at,
            "updated_at": product.updated_at
        }

    finally:
        db.close()


# Statistics Dashboard API
@app.get("/stats")
def get_stats():

    db = SessionLocal()

    try:

        total_products = db.query(Product).count()

        electronics = (
            db.query(Product)
            .filter(Product.category == "electronics")
            .count()
        )

        books = (
            db.query(Product)
            .filter(Product.category == "books")
            .count()
        )

        fashion = (
            db.query(Product)
            .filter(Product.category == "fashion")
            .count()
        )

        sports = (
            db.query(Product)
            .filter(Product.category == "sports")
            .count()
        )

        home = (
            db.query(Product)
            .filter(Product.category == "home")
            .count()
        )

        return {
            "total_products": total_products,
            "electronics": electronics,
            "books": books,
            "fashion": fashion,
            "sports": sports,
            "home": home
        }

    finally:
        db.close()


# Serve CSS + JS
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)