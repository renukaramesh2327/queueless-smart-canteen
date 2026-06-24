from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.order import PaymentMethod, PaymentStatus, OrderStatus


class CartItem(BaseModel):
    menu_item_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[CartItem]
    payment_method: PaymentMethod
    preparation_notes: Optional[str] = None
    is_scheduled: bool = False
    scheduled_pickup_time: Optional[datetime] = None


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int]
    item_name: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    old_status: Optional[str]
    new_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    pickup_token: str
    user_id: int
    total_amount: float
    tax_amount: float
    packaging_charge: float
    discount_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    order_status: OrderStatus
    preparation_notes: Optional[str]
    is_scheduled: bool
    scheduled_pickup_time: Optional[datetime]
    estimated_ready_time: Optional[datetime]
    pickup_counter: int
    is_picked_up: bool
    items: List[OrderItemResponse]
    status_history: List[OrderStatusHistoryResponse]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    order_status: OrderStatus
    notes: Optional[str] = None


class PickupVerify(BaseModel):
    pickup_token: Optional[str] = None
    order_number: Optional[str] = None
