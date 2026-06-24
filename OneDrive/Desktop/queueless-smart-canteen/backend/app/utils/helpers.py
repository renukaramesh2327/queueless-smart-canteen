import random
import string
import qrcode
import base64
from io import BytesIO
from datetime import datetime


def generate_order_number() -> str:
    """Generate unique order number like CB-20240601-XXXX"""
    date_str = datetime.now().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"CB-{date_str}-{suffix}"


def generate_pickup_token() -> str:
    """Generate 4-digit numeric pickup token"""
    return str(random.randint(1000, 9999))


def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


def calculate_estimated_ready_time(items_data: list, active_orders_count: int) -> datetime:
    """Smart queue estimation based on items and active orders"""
    from datetime import timedelta
    max_prep_time = max((item.get("preparation_time", 10) for item in items_data), default=10)
    queue_buffer = min(active_orders_count * 2, 20)  # cap at 20 minutes
    total_minutes = max_prep_time + queue_buffer
    return datetime.utcnow() + timedelta(minutes=total_minutes)


def calculate_queue_level(active_orders: int) -> dict:
    """Calculate queue level and wait time"""
    if active_orders <= 3:
        level = "low"
        wait_time = active_orders * 3 + 5
        message = "Low queue — great time to order!"
    elif active_orders <= 8:
        level = "moderate"
        wait_time = active_orders * 3 + 10
        message = "Moderate queue — food ready in ~{} min"
    elif active_orders <= 15:
        level = "busy"
        wait_time = active_orders * 2 + 15
        message = "Busy — slight wait expected"
    else:
        level = "very_busy"
        wait_time = 30 + (active_orders - 15)
        message = "Very busy — consider scheduling pickup"

    return {
        "level": level,
        "estimated_wait_minutes": wait_time,
        "message": message.format(wait_time) if "{}" in message else message,
        "active_orders": active_orders,
    }
