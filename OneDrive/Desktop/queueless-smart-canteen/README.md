# 🍛 CampusBite — Skip the Queue. Order Smart. Eat on Time.

> A complete full-stack smart canteen ordering and billing system for college campuses.

---

## 📋 Problem Statement

Students in college waste a large part of their lunch break standing in long queues to order food and complete billing at the canteen. Manual order-taking causes crowding, payment delays, billing errors, confusion during pickup, and difficulty managing food demand.

## 💡 Solution

CampusBite is a mobile-friendly web application where students can:
- View the live canteen menu
- Add food items to a cart
- Place an order and make a simulated online payment (or pay at counter)
- Receive a unique order number and QR code
- Track the live order status in real time
- Collect food from a separate pickup counter without waiting in any billing line

Canteen staff receive orders through a dashboard, prepare them, update status, and scan the QR during pickup.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| Student ordering | Browse, filter, cart, checkout with simulated UPI/Card/Counter payment |
| Live order tracking | Real-time status via polling: Placed → Accepted → Preparing → Ready → Completed |
| QR Code pickup | Unique QR + 4-digit token per order for secure collection |
| Staff kitchen board | Kanban-style order board with sound alerts |
| Menu management | Add/edit/delete items, toggle availability, stock management |
| Admin dashboard | Recharts analytics, user management, CSV reports |
| Smart queue estimation | Wait time based on active orders + prep time |
| Role-based access | Student / Staff / Admin with protected routes |
| JWT authentication | Secure login, session persistence, logout |
| Responsive design | Mobile-first with bottom nav for students, sidebar for staff/admin |

---

## 🛠️ Technology Stack

### Frontend
- React 18 + Vite 5
- Tailwind CSS 3
- React Router v6
- Axios
- Lucide React icons
- Recharts (analytics charts)
- qrcode.react (QR code generation)
- react-hot-toast (notifications)

### Backend
- Python 3.10+
- FastAPI 0.111
- SQLAlchemy 2.0 (ORM)
- Pydantic v2 (validation)
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- SQLite (local dev) — PostgreSQL-ready

---

## 📁 Project Structure

```
queueless-smart-canteen/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/          ← AuthContext, CartContext
│   │   ├── layouts/          ← StudentLayout, StaffLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/       ← Landing, Login, Register
│   │   │   ├── student/      ← Dashboard, Menu, Cart, Checkout, Tracking
│   │   │   ├── staff/        ← Dashboard, KitchenBoard, Menu, QR Verify
│   │   │   └── admin/        ← Dashboard, Analytics, Users, Reports
│   │   ├── services/         ← api.js (Axios wrappers)
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── main.py           ← FastAPI app entry point
│   │   ├── models/           ← SQLAlchemy models (User, MenuItem, Order, ...)
│   │   ├── schemas/          ← Pydantic schemas
│   │   ├── routes/           ← API routers (auth, menu, orders, analytics...)
│   │   ├── database/         ← DB engine, session, Base
│   │   ├── auth/             ← JWT, password hashing, role guards
│   │   └── utils/            ← helpers (QR gen, queue estimation, token gen)
│   ├── seed.py               ← Demo data seeder
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
│
├── .github/
│   └── workflows/
│       └── build.yml         ← CI: backend syntax + frontend build checks
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

| Table | Key Fields |
|---|---|
| users | id, full_name, register_number, email, role, password_hash, is_active |
| categories | id, name, description, sort_order |
| menu_items | id, name, category_id, price, preparation_time, food_type, stock_quantity |
| orders | id, order_number, pickup_token, user_id, total_amount, order_status, payment_status |
| order_items | id, order_id, menu_item_id, quantity, unit_price, subtotal |
| payments | id, order_id, payment_reference, amount, status |
| order_status_history | id, order_id, old_status, new_status, updated_by |
| settings | id, setting_key, setting_value |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Student registration |
| POST | /api/auth/login | Login (email or register number) |
| GET | /api/auth/me | Get current user |
| GET | /api/menu | Get all menu items (filters: category, food_type, search) |
| POST | /api/menu | Create menu item (staff+) |
| GET | /api/categories | Get all categories |
| POST | /api/orders | Place an order |
| GET | /api/orders/my-orders | Student's order history |
| GET | /api/orders/{id} | Order details |
| PATCH | /api/orders/{id}/status | Update order status (staff+) |
| POST | /api/orders/{id}/verify-pickup | QR pickup verification (staff+) |
| GET | /api/analytics/dashboard | Dashboard stats (staff+) |
| GET | /api/analytics/sales | Sales by day |
| GET | /api/admin/users | All users (admin only) |
| GET | /api/settings | App settings |
| GET | /api/reports/daily-sales | CSV export |

Full interactive API docs available at: `http://localhost:8000/docs`

---

## 🚀 Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Windows PowerShell (or any terminal)

---

### 1. Clone the repository

```powershell
git clone https://github.com/your-username/campusbite.git
cd campusbite
```

---

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Seed the database with demo data
python seed.py

# Start the backend server
uvicorn app.main:app --reload
```

Backend will run at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 3. Frontend Setup

Open a new terminal:

```powershell
cd frontend

# Create .env file
Copy-Item .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🔐 Demo Credentials

| Role | Email | Password | Portal |
|---|---|---|---|
| **Admin** | admin@campusbite.com | Admin@123 | /admin/login |
| **Staff** | staff@campusbite.com | Staff@123 | /staff/login |
| **Staff 2** | staff2@campusbite.com | Staff@123 | /staff/login |
| **Student** | student@campusbite.com | Student@123 | /login |
| **Student 2** | divya@campusbite.com | Student@123 | /login |
| **Student 3** | karthik@campusbite.com | Student@123 | /login |

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./campusbite.db
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=CampusBite
```

---

## 📦 GitHub Upload

```powershell
# In the project root
git init
git add .
git commit -m "Initial commit: CampusBite full-stack smart canteen system"

# Create a new repo on GitHub first, then:
git remote add origin https://github.com/your-username/campusbite.git
git branch -M main
git push -u origin main
```

> ⚠️ Make sure `.env` files are in `.gitignore` (already configured). Never commit real secret keys.

---

## ☁️ Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variables:
   - `SECRET_KEY` → generate a strong random value
   - `DATABASE_URL` → `sqlite:///./campusbite.db` (or PostgreSQL URL from Render)
   - `FRONTEND_URL` → your Vercel frontend URL
8. Click **Deploy**
9. After deploy, run seed: connect to Render shell and run `python seed.py`

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://campusbite-api.onrender.com`)
5. Click **Deploy**

> Update `FRONTEND_URL` on Render to match your Vercel URL for CORS to work.

---

## ✅ Test Checklist

- [ ] Landing page loads with popular items from database
- [ ] Student registration creates account and redirects to dashboard
- [ ] Student login works with email and register number
- [ ] Menu loads all 20+ items with categories and filters
- [ ] Search works by item name
- [ ] Add to cart, update quantity, remove item
- [ ] Cart persists after page refresh
- [ ] Checkout with UPI simulation → payment screen → order placed
- [ ] Checkout with pay at counter → order placed directly
- [ ] Order confirmation shows QR code and pickup token
- [ ] Order tracking polls status every 8 seconds
- [ ] Staff login redirects to staff dashboard
- [ ] Kitchen board shows active orders in Kanban columns
- [ ] Staff can move orders through status stages
- [ ] QR verify page finds order by token
- [ ] Admin login redirects to admin dashboard
- [ ] Analytics charts render with data
- [ ] User management table shows all users
- [ ] CSV report downloads correctly
- [ ] Settings save and persist

---

## 🔮 Future Enhancements

1. **Real payment gateway** — Integrate Razorpay or Stripe
2. **WebSocket live updates** — Replace polling with WebSocket push
3. **Native QR scanner** — Camera-based QR code reading on staff devices
4. **Push notifications** — PWA push when order status changes
5. **Meal plans** — Weekly subscription meal plans for students
6. **Nutritional info** — Calories, allergens per item
7. **Canteen wallet** — Pre-loaded student wallet for faster checkout
8. **Multi-canteen support** — Multiple campus canteens under one system
9. **Kitchen display system** — Dedicated large-screen KDS for kitchen
10. **Inventory forecasting** — AI-based demand prediction for stock management

---

## 👨‍💻 Contributors

| Role | Contributor |
|---|---|
| Full-Stack Development | CampusBite Team |
| UI/UX Design | CampusBite Team |
| Database Architecture | CampusBite Team |

---

*Built with ❤️ for college students who deserve a better lunch break.*
