# Product Browser API

Backend API built with FastAPI and PostgreSQL.

## Features

- Browse 200,000 products
- Newest-first ordering
- Category filtering
- Cursor-based pagination
- PostgreSQL database hosted on Neon

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Neon
- Faker

## Run Locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

### Get Products

```http
GET /products
```

Optional query params:

```http
/products?category=electronics
/products?limit=20
/products?cursor=199981
```

## Design Decisions

Used cursor-based pagination instead of offset pagination because:

- Better performance on large datasets
- Prevents duplicate/missing records when data changes
- Scales better than OFFSET queries