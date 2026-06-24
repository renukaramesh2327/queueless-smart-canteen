from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import random

from ..database.database import get_db
from ..models.order import Order, OrderItem, OrderStatusHistory, OrderStatus, PaymentStatus
from ..models.menu_item import MenuItem
from ..models.payment import Payment, PaymentStatusEnum
from ..schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, PickupVerify
from ..auth.auth import get_current_user, get_current_student, get_current_staff
from ..models.user import User
from ..utils.helpers import generate_order_number, generate_pickup_token, generate_qr_code, calculate_estimated_ready_time, calculate_queue_level

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _get_active_order_count(db: Session) -> int:
    return db.query(Order).filter(
        Order.order_status.in_([OrderStatus.placed, OrderStatus.accepted, OrderStatus.preparing])
    ).count()


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, current_user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    total = 0.0
    order_items_data = []
    items_meta = []

    for cart_item in data.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == cart_item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {cart_item.menu_item_id} not found")
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is currently unavailable")
        if menu_item.stock_quantity < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {menu_item.name}")
        subtotal = menu_item.price * cart_item.quantity
        total += subtotal
        order_items_data.append({
            "menu_item_id": menu_item.id,
            "item_name": menu_item.name,
            "quantity": cart_item.quantity,
            "unit_price": menu_item.price,
            "subtotal": subtotal,
        })
        items_meta.append({"preparation_time": menu_item.preparation_time})
        menu_item.stock_quantity -= cart_item.quantity
        if menu_item.stock_quantity == 0:
            menu_item.is_available = False

    # Get settings
    from ..models.setting import Setting
    def get_setting(key, default):
        s = db.query(Setting).filter(Setting.setting_key == key).first()
        return float(s.setting_value) if s else default

    tax_pct = get_setting("tax_percentage", 5.0)
    pkg_charge = get_setting("packaging_charge", 5.0)
    tax_amount = round(total * tax_pct / 100, 2)
    grand_total = round(total + tax_amount + pkg_charge, 2)

    active_count = _get_active_order_count(db)
    est_ready = calculate_estimated_ready_time(items_meta, active_count)
    counter = (active_count % 3) + 1  # distribute across counters

    order_number = generate_order_number()
    pickup_token = generate_pickup_token()
    qr_data = f"CB:{order_number}:{pickup_token}"
    qr_image = generate_qr_code(qr_data)

    order = Order(
        order_number=order_number,
        pickup_token=pickup_token,
        user_id=current_user.id,
        total_amount=grand_total,
        tax_amount=tax_amount,
        packaging_charge=pkg_charge,
        discount_amount=0.0,
        payment_method=data.payment_method,
        payment_status=PaymentStatus.paid if data.payment_method != "pay_at_counter" else PaymentStatus.pending,
        order_status=OrderStatus.placed,
        preparation_notes=data.preparation_notes,
        is_scheduled=data.is_scheduled,
        scheduled_pickup_time=data.scheduled_pickup_time,
        estimated_ready_time=est_ready,
        pickup_counter=counter,
        qr_data=qr_image,
    )
    db.add(order)
    db.flush()

    for item_data in order_items_data:
        db.add(OrderItem(order_id=order.id, **item_data))

    # Payment record
    ref = f"CB-PAY-{random.randint(100000, 999999)}"
    payment = Payment(
        order_id=order.id,
        payment_reference=ref,
        payment_method=data.payment_method.value,
        amount=grand_total,
        status=PaymentStatusEnum.success if data.payment_method.value != "pay_at_counter" else PaymentStatusEnum.pending,
        gateway_response="Simulated payment processed" if data.payment_method.value != "pay_at_counter" else "Pay at counter",
    )
    db.add(payment)

    # Status history
    db.add(OrderStatusHistory(order_id=order.id, old_status=None, new_status=OrderStatus.placed.value, updated_by=current_user.id))
    db.commit()
    db.refresh(order)
    return order


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(current_user: User = Depends(get_current_student), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()


@router.get("/active")
def get_active_orders_status(db: Session = Depends(get_db)):
    count = _get_active_order_count(db)
    return calculate_queue_level(count)


@router.get("/staff", response_model=List[OrderResponse])
def get_staff_orders(status: str = None, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    query = db.query(Order)
    if status and status != "all":
        try:
            query = query.filter(Order.order_status == OrderStatus(status))
        except ValueError:
            pass
    return query.order_by(Order.created_at.desc()).limit(100).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role.value == "student" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order


@router.patch("/{order_id}/cancel")
def cancel_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role.value == "student" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.order_status not in [OrderStatus.placed, OrderStatus.accepted]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled at this stage")
    old = order.order_status.value
    order.order_status = OrderStatus.cancelled
    db.add(OrderStatusHistory(order_id=order.id, old_status=old, new_status=OrderStatus.cancelled.value, updated_by=current_user.id))
    db.commit()
    return {"message": "Order cancelled"}


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate, staff=Depends(get_current_staff), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    old = order.order_status.value
    order.order_status = data.order_status
    db.add(OrderStatusHistory(order_id=order.id, old_status=old, new_status=data.order_status.value, updated_by=staff.id, notes=data.notes))
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_status": order.order_status.value}


@router.post("/{order_id}/verify-pickup")
def verify_pickup(order_id: int, data: PickupVerify, staff=Depends(get_current_staff), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.is_picked_up:
        raise HTTPException(status_code=400, detail="Order already picked up")
    if order.order_status != OrderStatus.ready:
        raise HTTPException(status_code=400, detail="Order is not ready for pickup")
    # Verify token
    if data.pickup_token and data.pickup_token != order.pickup_token:
        raise HTTPException(status_code=400, detail="Invalid pickup token")
    if data.order_number and data.order_number != order.order_number:
        raise HTTPException(status_code=400, detail="Invalid order number")
    order.is_picked_up = True
    order.order_status = OrderStatus.completed
    # Update payment if pay_at_counter
    if order.payment_status == PaymentStatus.pending:
        order.payment_status = PaymentStatus.paid
        if order.payment:
            order.payment.status = PaymentStatusEnum.success
    db.add(OrderStatusHistory(order_id=order.id, old_status=OrderStatus.ready.value, new_status=OrderStatus.completed.value, updated_by=staff.id))
    db.commit()
    return {"message": "Pickup verified", "order_number": order.order_number}
