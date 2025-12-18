# 🛒 UIAPhotography [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Ojulari123/UIAPhotography)

A full-stack photography portfolio and e-commerce platform that combines visual art and words. Features captivating photography, thought-provoking poetry, and one-of-a-kind artworks that you can enjoy and own

---

## ✨ Features
**Backend**
- 📦 **Products API** – Add, edit, list, and delete products (digital & physical).  
- 🖼 **File Handling** – Upload images, auto-generate thumbnails, and serve them.  
- 🛒 **Orders API** – Create and manage customer orders.  
- 🚚 **Shipping & Tax** – Collect shipping info, calculate fees & taxes.  
- 💳 **Payments** – Stripe integration for checkout, payment intents, and webhooks.  
- ✉️ **Emails** – Send customer order confirmations and shipping updates.  
- 🗄 **PostgreSQL Database** – Managed with SQLAlchemy ORM.
  
**Frontend**
- 🎯 Modern React App – Built with Vite for lightning-fast development
- 🎨 Responsive Design – Tailwind CSS for beautiful, mobile-first UI
- 🛍️ E-commerce Features – Product browsing, cart management, checkout flow
- 📸 Portfolio Showcase – Dynamic galleries organized by photography categories
- 📝 Admin Dashboard – Manage products, orders, and portfolio content
- 🔐 Authentication – Secure admin access
- 🌐 State Management – Zustand for efficient global state
- 🎭 Smooth Animations – Framer Motion for engaging user experience
  
---

## 🛠️ Tech Stack
**Backend**
- FastAPI – Web framework  
- SQLAlchemy – ORM for PostgreSQL  
- Pydantic – Data validation  
- Uvicorn – ASGI server  
- Stripe – Payment processing  
- Pillow – Image handling  
- Requests – HTTP requests  
- python-dotenv – Env variable management

**Frontend**
- React 18 – UI library
- Vite – Build tool and dev server
- React Router – Client-side routing
- Tailwind CSS – Utility-first CSS framework
- Zustand – Lightweight state management
- Axios – HTTP client
- React Select – Customizable select components
- Framer Motion – Animation library
- React Hook Form – Form validation
  
---

## 📂 Project Structure
UIAPhotography/
├── Backend/
│   ├── main.py                 # FastAPI entrypoint
│   ├── func.py                 # Utility functions
│   ├── products.py             # Products API routes
│   ├── purchase.py             # Orders & payments API
│   ├── portfolio.py            # Portfolio management API
│   ├── schemas.py              # Pydantic schemas
│   ├── tables.py               # SQLAlchemy models
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── Frontend/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   └── user/           # Public-facing pages
│   │   ├── stores/             # Zustand state stores
│   │   ├── services/           # API service functions
│   │   ├── assets/             # Images, fonts, static files
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # React entry point
│   ├── public/                 # Static assets
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── .env                    # Environment variables
│
├── .gitignore
└── README.md

---

## ⚙️ Installation & Setup
**Backend Setup**
1. **Clone the repository**
   
   git clone https://github.com/Ojulari123/UIAPhotography.git
   cd backend

- **Create Virtual Environment(Not always neccessary)**
    
    python3 -m venv venv

    source venv/bin/activate
     
    venv\Scripts\activate     

2. **Install dependencies**

   pip install -r requirements.txt

3. **Set up environment variables**
  
    Create a .env file in the backend folder:

   # Database
   PGUSER=your_postgres_user
   PGPASSWORD=your_postgres_password
   PGDB=your_database_name
   PGHOST=your_postgres_host
   PGPORT=5432
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
   
   # Email
   SMTP_HOST=smtp.yourmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_email_password
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

- **Run database migrations**

    Tables are automatically created when you run the app (via Base.metadata.create_all() in tables.py). If you want migrations: integrate Alembic.
  
    # Incase you integrate alembic 
       alembic init alembic
       alembic revision --autogenerate -m "Initial migration"
       alembic upgrade head

4. **Start Server**

    uvicorn main:app --reload
   
**Frontend Setup**
1. **Navigate to Frontend directory**
   
   cd ../Frontend

2. **Install Dependencies**

   npm install

3. **Set up environment variables**
  
    Create a .env file in the frontend folder:
   
   VITE_API_URL=your_vite_api_url
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

4. **Start the development server**

   npm run dev

5. **Build for production**

   npm run build
   
---

## Deployment
**Backend (Render)**

   Create a new Web Service on Render
   Connect your GitHub repository
   Set build command: pip install -r requirements.txt
   Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Add all environment variables from your .env file
   Deploy!

**Frontend (Render)**

   Import your GitHub repository
   Set build command: npm run build
   Set output directory: dist
   Add environment variables
   Deploy!

**Database (Neon)**

   Sign up at neon.tech
   Create a new project
   Choose the AWS region closest to your backend
   Copy the connection string
   Add to your backend environment variables

---

## 📌 Notes

    Environment variables are required

    Database defaults to PostgreSQL – adjust in tables.py if using another DB.

    Thumbnails & uploads – Both are generated and stored locally (consider S3 for production).

    Stripe webhooks – must be publicly accessible (use ngrok for local dev).

## Developers:

- Ojulari Tobi
- Ojulari Adeoluwa
- Ebire Damilare

## 📄 License
This project is private and proprietary.

## 🔗 Links
- uiaphotography.com (Live Site)
- uiaphotography.onrender.com/docs (Backend API)

Made with ❤️ by the UIAPhotography Team
