from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

from .database.database import engine, Base
from . import models  # noqa: F401 – ensures all models register with Base
from .routes import auth, menu, orders, analytics, settings, admin, reports

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusBite API",
    description="Smart canteen ordering system for college campuses",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Build allowed origins: always include localhost for dev + any production URL set via env
_origins = {"http://localhost:5173", "http://localhost:3000", frontend_url}
# Support comma-separated list of extra origins e.g. "https://app.vercel.app,https://custom.domain.com"
for _o in os.getenv("EXTRA_ORIGINS", "").split(","):
    if _o.strip():
        _origins.add(_o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(menu.cat_router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(admin.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "CampusBite API is running 🍛", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "CampusBite API"}
