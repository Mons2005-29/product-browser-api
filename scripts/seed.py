from faker import Faker
from datetime import datetime
from app.database import SessionLocal
from app.models import Product
import random

fake = Faker()

db = SessionLocal()

categories = [
    "electronics",
    "fashion",
    "books",
    "sports",
    "home"
]

products = []

for i in range(200000):

    product = Product(
        name=fake.word(),
        category=random.choice(categories),
        price=round(random.uniform(10, 1000), 2),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    products.append(product)

    if len(products) == 5000:
        db.bulk_save_objects(products)
        db.commit()

        print(f"Inserted {i+1} products")

        products = []

if products:
    db.bulk_save_objects(products)
    db.commit()

print("Done!")