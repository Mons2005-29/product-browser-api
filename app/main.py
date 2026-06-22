from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.database import SessionLocal
from app.models import Product

app = FastAPI()

# ✅ Allow frontend to call backend (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/")
def home():
    return {"message": "API is working"}


# Products API with pagination + filtering
@app.get("/products")
def get_products(
    limit: int = Query(20, le=100),
    category: str = None,
    cursor: int = None
):
    db = SessionLocal()

    try:
        # Base query
        query = db.query(Product)

        # ✅ FILTER BY CATEGORY (FIX YOU NEEDED)
        if category:
            query = query.filter(Product.category == category)

        # Cursor pagination (no duplicates / no missing items)
        if cursor:
            query = query.filter(Product.id < cursor)

        # Sorting + limit
        products = (
            query
            .order_by(Product.id.desc())
            .limit(limit)
            .all()
        )

        # Next cursor for pagination
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