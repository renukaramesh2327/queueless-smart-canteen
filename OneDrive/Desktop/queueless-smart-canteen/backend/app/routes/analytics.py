from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from ..database.database import get_db
from ..models.order import Order, OrderItem, OrderStatus, PaymentStatus
from ..models.user import User, UserRole
from ..models.menu_item import MenuItem
from ..auth.auth import get_current_staff, get_current_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    today_orders = db.query(Order).filter(Order.created_at >= today_start, Order.created_at <= today_end).all()
    total_orders = db.query(Order).count()
    completed = db.query(Order).filter(Order.order_status == OrderStatus.completed).count()
    cancelled = db.query(Order).filter(Order.order_status == OrderStatus.cancelled).count()
    active = db.query(Order).filter(Order.order_status.in_([OrderStatus.placed, OrderStatus.accepted, OrderStatus.preparing])).count()

    today_revenue = sum(o.total_amount for o in today_orders if o.payment_status == PaymentStatus.paid)
    today_count = len(today_orders)

    students = db.query(User).filter(User.role == UserRole.student).count()
    staff_count = db.query(User).filter(User.role == UserRole.staff).count()

    # Orders by status today
    status_counts = {}
    for s in OrderStatus:
        status_counts[s.value] = db.query(Order).filter(
            Order.created_at >= today_start, Order.order_status == s
        ).count()

    return {
        "total_orders": total_orders,
        "today_orders": today_count,
        "today_revenue": round(today_revenue, 2),
        "completed_orders": completed,
        "cancelled_orders": cancelled,
        "active_orders": active,
        "total_students": students,
        "total_staff": staff_count,
        "status_counts_today": status_counts,
    }


@router.get("/sales")
def get_sales(days: int = 7, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    result = []
    for i in range(days - 1, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time())
        end = datetime.combine(day, datetime.max.time())
        orders = db.query(Order).filter(
            Order.created_at >= start,
            Order.created_at <= end,
            Order.payment_status == PaymentStatus.paid
        ).all()
        result.append({
            "date": day.strftime("%Y-%m-%d"),
            "label": day.strftime("%b %d"),
            "revenue": round(sum(o.total_amount for o in orders), 2),
            "order_count": len(orders),
        })
    return result


@router.get("/popular-items")
def get_popular_items(limit: int = 10, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    results = (
        db.query(
            OrderItem.item_name,
            func.sum(OrderItem.quantity).label("total_qty"),
            func.sum(OrderItem.subtotal).label("total_revenue"),
        )
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [{"name": r.item_name, "quantity": int(r.total_qty), "revenue": round(float(r.total_revenue), 2)} for r in results]


@router.get("/peak-hours")
def get_peak_hours(db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    results = (
        db.query(
            extract("hour", Order.created_at).label("hour"),
            func.count(Order.id).label("count"),
        )
        .group_by(extract("hour", Order.created_at))
        .order_by(extract("hour", Order.created_at))
        .all()
    )
    return [{"hour": int(r.hour), "label": f"{int(r.hour):02d}:00", "count": int(r.count)} for r in results]


@router.get("/monthly-revenue")
def get_monthly_revenue(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    results = (
        db.query(
            extract("month", Order.created_at).label("month"),
            extract("year", Order.created_at).label("year"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("count"),
        )
        .filter(Order.payment_status == PaymentStatus.paid)
        .group_by(extract("year", Order.created_at), extract("month", Order.created_at))
        .order_by(extract("year", Order.created_at), extract("month", Order.created_at))
        .all()
    )
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return [{"month": months[int(r.month)-1], "year": int(r.year), "revenue": round(float(r.revenue or 0), 2), "count": int(r.count)} for r in results]
