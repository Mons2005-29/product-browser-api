from fastapi import FastAPI, Query
from app.database import engine, SessionLocal
from app.models import Base, Product

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def home():
    return {"message": "API is working"}


@app.get("/products")
def get_products(
    limit: int = Query(default=20, le=100),
    category: str = None,
    cursor: int | None = None
):
    db = SessionLocal()

    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if cursor is not None:
        query = query.filter(Product.id < cursor)

    products = (
        query
        .order_by(Product.id.desc())
        .limit(limit)
        .all()
    )

    next_cursor = None

    if products:
        next_cursor = products[-1].id

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