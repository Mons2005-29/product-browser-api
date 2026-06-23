from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# Serve frontend homepage
@app.get("/")
def home():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


# Products API with pagination + filtering
@app.get("/products")
def get_products(
    limit: int = Query(20, le=100),
    category: str = None,
    cursor: int = None
):
    db = SessionLocal()

    try:
        query = db.query(Product)

        # Category filter
        if category:
            query = query.filter(Product.category == category)

        # Cursor pagination
        if cursor:
            query = query.filter(Product.id < cursor)

        products = (
            query
            .order_by(Product.id.desc())
            .limit(limit)
            .all()
        )

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


# Serve static files (CSS + JS)
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)