# 🛒 UIAPhotography (Backend)

This is a **full-featured e-commerce backend** built with **FastAPI**, **Neon PostgreSQL (SQLAlchemy ORM)**, **Stripe**, **SMTP**.  
It supports **product management, orders, checkout, shipping, payments, and email notifications**, making it a solid foundation for any online shop.

(Frontend still in on the way)
---

## ✨ Features

- 📦 **Products API** – Add, edit, list, and delete products (digital & physical).  
- 🖼 **File Handling** – Upload images, auto-generate thumbnails, and serve them.  
- 🛒 **Orders API** – Create and manage customer orders.  
- 🚚 **Shipping & Tax** – Collect shipping info, calculate fees & taxes.  
- 💳 **Payments** – Stripe integration for checkout, payment intents, and webhooks.  
- ✉️ **Emails** – Send customer order confirmations and shipping updates.  
- 🗄 **PostgreSQL Database** – Managed with SQLAlchemy ORM.  

---

## 📂 Project Structure

/Backend

- main.py # ----> FastAPI entrypoint (mounts routers)
- func.py # ----> Utility functions (slugs, images, emails, shipping, totals)
- products.py # ----> Products API routes
- purchase.py # ----> Orders, checkout, payments, and email API routes
- schemas.py # ----> Pydantic schemas for request/response validation
- tables.py # ----> SQLAlchemy models & database session management
- requirements.txt # ----> ython dependencies
- .env # ----> Environment variables (ignored in Git)
- uploads/ # ----> Uploaded product images (runtime-generated)
- thumbnails/ # ----> Auto-generated thumbnails (runtime-generated)
- README.md # ----> Documentation

## 🛠️ Tech Stack

- [FastAPI](https://fastapi.tiangolo.com/) – Web framework  
- [SQLAlchemy](https://www.sqlalchemy.org/) – ORM for PostgreSQL  
- [Pydantic](https://docs.pydantic.dev/) – Data validation  
- [Uvicorn](https://www.uvicorn.org/) – ASGI server  
- [Stripe](https://stripe.com/docs/api) – Payment processing  
- [Pillow](https://python-pillow.org/) – Image handling  
- [Requests](https://docs.python-requests.org/) – HTTP requests  
- [python-dotenv](https://pypi.org/project/python-dotenv/) – Env variable management  

---
## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ojulari123/UIAPhotography.git
   cd backend

- **Create Virtual Environment(Not always neccessary)**
    
    python3 -m venv venv
    source venv/bin/activate 
    venv\Scripts\activate     

2. **Install dependencies**

   pip install -r requirements.txt

3. **Set up environment variables**
  
    Create a .env file in the root folder:

      PGUSER=your_postgres_user

      PGPASSWORD=your_postgres_password

      PGDB=your_database_name

      PGHOST=localhost

      PGPORT=5432

      STRIPE_SECRET_KEY=your_stripe_secret

      STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

      SMTP_HOST=smtp.yourmail.com

      SMTP_PORT=587

      SMTP_USER=your_email@example.com

      SMTP_PASSWORD=your_email_password

- **Run database migrations**

    Tables are automatically created when you run the app (via Base.metadata.create_all() in tables.py). If you want migrations: integrate Alembic.

4. **Start Server**

    uvicorn main:app --reload

## Endpoints

  -  Products

    POST /products/url → Add product via image URL
    POST /products/upload → Add product via file upload
    GET /products → List all products
    PUT /products/{id} → Edit a product
    DELETE /products/{id} → Delete a product

  -  Orders & Checkout

    POST /orders → Create an order
    GET /orders/{id} → Get order details
    POST /checkout/{order_id} → Start checkout with Stripe
    POST /payment/webhook → Stripe webhook for payment updates

  -  Shipping

    POST /shipping/{order_id} → Add shipping info
    GET /shipping/{order_id} → Get shipping details

  -  Emails

    Automatic email notifications on: 
    Order confirmation
    Shipping updates

## 🗄️ Database Models

    Products – Digital/physical products with price, dimensions, metadata

    Orders – Customer order info with status (ordered, paid, shipped, delivered)

    OrderItems – Products linked to an order

    CheckoutInfo – Stripe payment & transaction data

    Shipping – Customer shipping address, fee, tax

    ShippingInfo – Tracking details (carrier, tracking number, URL)

## 📌 Notes

    Environment variables are required

    Database defaults to PostgreSQL – adjust in tables.py if using another DB.

    Thumbnails & uploads – Both are generated and stored locally (consider S3 for production).

    Stripe webhooks – must be publicly accessible (use ngrok for local dev).

## Developed By:

- Ojulari Tobi
- Ojulari Adeoluwa
- Ariyibi Iseoluwa