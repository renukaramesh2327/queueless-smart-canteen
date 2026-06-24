from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import csv
import io
from ..database.database import get_db
from ..models.order import Order, OrderItem, OrderStatus, PaymentStatus
from ..auth.auth import get_current_admin

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _make_csv_response(rows: list, headers: list, filename: str):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/daily-sales")
def daily_sales_report(date: str = None, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    target = datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.utcnow().date()
    start = datetime.combine(target, datetime.min.time())
    end = datetime.combine(target, datetime.max.time())
    orders = db.query(Order).filter(Order.created_at >= start, Order.created_at <= end).all()
    rows = [{
        "order_number": o.order_number,
        "pickup_token": o.pickup_token,
        "total_amount": o.total_amount,
        "payment_method": o.payment_method.value,
        "payment_status": o.payment_status.value,
        "order_status": o.order_status.value,
        "created_at": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "",
    } for o in orders]
    return _make_csv_response(rows, list(rows[0].keys()) if rows else ["order_number"], f"sales_{target}.csv")


@router.get("/items-report")
def items_report(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    from sqlalchemy import func
    results = (
        db.query(OrderItem.item_name, func.sum(OrderItem.quantity).label("qty"), func.sum(OrderItem.subtotal).label("rev"))
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .all()
    )
    rows = [{"item_name": r.item_name, "total_quantity": int(r.qty), "total_revenue": round(float(r.rev), 2)} for r in results]
    return _make_csv_response(rows, ["item_name", "total_quantity", "total_revenue"], "items_report.csv")
