"""
Seed script — populates CampusBite database with demo data.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
import random

from app.database.database import engine, SessionLocal, Base
from app.models import User, Category, MenuItem, Order, OrderItem, OrderStatusHistory
from app.models.order import PaymentMethod, PaymentStatus, OrderStatus
from app.models.payment import Payment, PaymentStatusEnum
from app.models.menu_item import FoodType
from app.models.setting import Setting
from app.models.user import UserRole
from app.auth.auth import get_password_hash
from app.utils.helpers import generate_order_number, generate_pickup_token, generate_qr_code

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("🌱 Seeding CampusBite database...")

# ─── Settings ───────────────────────────────────────────────────────────────
SETTINGS = [
    ("canteen_name", "CampusBite Canteen"),
    ("opening_time", "07:30"),
    ("closing_time", "21:00"),
    ("tax_percentage", "5"),
    ("packaging_charge", "5"),
    ("pickup_counters", "3"),
    ("max_simultaneous_orders", "30"),
    ("cancellation_window_minutes", "5"),
    ("default_preparation_time", "10"),
    ("canteen_status", "open"),
]
for key, value in SETTINGS:
    if not db.query(Setting).filter(Setting.setting_key == key).first():
        db.add(Setting(setting_key=key, setting_value=value))
db.commit()
print("  ✓ Settings seeded")

# ─── Users ───────────────────────────────────────────────────────────────────
USERS = [
    {"full_name": "Admin User", "email": "admin@campusbite.com", "password": "Admin@123", "role": UserRole.admin},
    {"full_name": "Ramesh Kumar", "email": "staff@campusbite.com", "password": "Staff@123", "role": UserRole.staff},
    {"full_name": "Priya Lakshmi", "email": "staff2@campusbite.com", "password": "Staff@123", "role": UserRole.staff},
    {
        "full_name": "Arun Raj",
        "email": "student@campusbite.com",
        "password": "Student@123",
        "role": UserRole.student,
        "register_number": "21CS001",
        "department": "Computer Science",
        "study_year": 3,
        "phone": "9876543210",
    },
    {
        "full_name": "Divya Menon",
        "email": "divya@campusbite.com",
        "password": "Student@123",
        "role": UserRole.student,
        "register_number": "21EC005",
        "department": "Electronics",
        "study_year": 2,
        "phone": "9876543211",
    },
    {
        "full_name": "Karthik Selvam",
        "email": "karthik@campusbite.com",
        "password": "Student@123",
        "role": UserRole.student,
        "register_number": "21ME010",
        "department": "Mechanical",
        "study_year": 4,
        "phone": "9876543212",
    },
    {
        "full_name": "Sneha Pillai",
        "email": "sneha@campusbite.com",
        "password": "Student@123",
        "role": UserRole.student,
        "register_number": "22IT020",
        "department": "Information Technology",
        "study_year": 1,
        "phone": "9876543213",
    },
    {
        "full_name": "Vignesh Babu",
        "email": "vignesh@campusbite.com",
        "password": "Student@123",
        "role": UserRole.student,
        "register_number": "21CS045",
        "department": "Computer Science",
        "study_year": 3,
        "phone": "9876543214",
    },
]

user_objects = {}
for u in USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if not existing:
        user = User(
            full_name=u["full_name"],
            email=u["email"],
            password_hash=get_password_hash(u["password"]),
            role=u["role"],
            register_number=u.get("register_number"),
            department=u.get("department"),
            study_year=u.get("study_year"),
            phone=u.get("phone"),
            is_active=True,
        )
        db.add(user)
        db.flush()
        user_objects[u["email"]] = user
    else:
        user_objects[u["email"]] = existing
db.commit()
print("  ✓ Users seeded")

# ─── Categories ──────────────────────────────────────────────────────────────
CATEGORIES = [
    ("Breakfast", "Morning meals to start your day", "☀️", 1),
    ("South Indian", "Traditional South Indian cuisine", "🍛", 2),
    ("North Indian", "Authentic North Indian dishes", "🥘", 3),
    ("Rice & Meals", "Full meals and variety rice", "🍚", 4),
    ("Fast Food", "Quick bites and snacks", "🍔", 5),
    ("Snacks", "Light snacks and street food", "🥪", 6),
    ("Beverages", "Hot and cold drinks", "☕", 7),
    ("Desserts", "Sweet treats and ice creams", "🍦", 8),
]
cat_objects = {}
for name, desc, emoji, order in CATEGORIES:
    existing = db.query(Category).filter(Category.name == name).first()
    if not existing:
        cat = Category(name=name, description=f"{emoji} {desc}", sort_order=order)
        db.add(cat)
        db.flush()
        cat_objects[name] = cat
    else:
        cat_objects[name] = existing
db.commit()
print("  ✓ Categories seeded")

# ─── Menu Items ──────────────────────────────────────────────────────────────
MENU_ITEMS = [
    # Breakfast
    {"name": "Idli (2 pieces)", "desc": "Soft steamed rice cakes served with sambar and chutney", "cat": "Breakfast", "price": 25, "prep": 5, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Idli_sambar.jpg/320px-Idli_sambar.jpg"},
    {"name": "Dosa", "desc": "Crispy rice crepe served with sambar and coconut chutney", "cat": "South Indian", "price": 35, "prep": 8, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Masala_dosa_from_Bangalore.jpg/320px-Masala_dosa_from_Bangalore.jpg"},
    {"name": "Masala Dosa", "desc": "Crispy dosa stuffed with spiced potato filling", "cat": "South Indian", "price": 45, "prep": 10, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Masala_dosa_from_Bangalore.jpg/320px-Masala_dosa_from_Bangalore.jpg"},
    {"name": "Pongal", "desc": "Comforting rice and lentil dish with ghee and cashews", "cat": "Breakfast", "price": 30, "prep": 5, "type": FoodType.veg, "popular": False, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Ven_Pongal.jpg/320px-Ven_Pongal.jpg"},
    {"name": "Poori (2 pieces)", "desc": "Deep-fried whole wheat bread with potato masala", "cat": "Breakfast", "price": 30, "prep": 8, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Puri.jpg/320px-Puri.jpg"},
    # Rice & Meals
    {"name": "Veg Meals", "desc": "Full South Indian meals with rice, sambar, rasam, 3 curries, papad, pickle", "cat": "Rice & Meals", "price": 70, "prep": 5, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/South_Indian_meals.jpg/320px-South_Indian_meals.jpg"},
    {"name": "Veg Fried Rice", "desc": "Wok-tossed basmati rice with mixed vegetables and soy sauce", "cat": "Rice & Meals", "price": 60, "prep": 12, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Fried_Rice.jpg/320px-Fried_Rice.jpg"},
    {"name": "Chicken Fried Rice", "desc": "Aromatic fried rice with tender chicken pieces and vegetables", "cat": "Rice & Meals", "price": 80, "prep": 15, "type": FoodType.non_veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Fried_Rice.jpg/320px-Fried_Rice.jpg"},
    {"name": "Lemon Rice", "desc": "Tangy turmeric rice with peanuts and curry leaves", "cat": "Rice & Meals", "price": 40, "prep": 5, "type": FoodType.veg, "popular": False, "img": "https://images.unsplash.com/photo-1585937421612-70a008356c36?w=320"},
    # North Indian
    {"name": "Paneer Butter Masala + Roti", "desc": "Creamy tomato-based paneer curry with 2 tandoor rotis", "cat": "North Indian", "price": 90, "prep": 15, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Paneer_butter_masala.jpg/320px-Paneer_butter_masala.jpg"},
    {"name": "Chole Bhature", "desc": "Spicy chickpea curry with fluffy deep-fried bread", "cat": "North Indian", "price": 65, "prep": 10, "type": FoodType.veg, "popular": False, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chole-Bhature.jpg/320px-Chole-Bhature.jpg"},
    # Fast Food
    {"name": "Veg Burger", "desc": "Crispy vegetable patty with lettuce, tomato, and special sauce", "cat": "Fast Food", "price": 50, "prep": 8, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Chicken_burger.jpg/320px-Chicken_burger.jpg"},
    {"name": "Chicken Burger", "desc": "Juicy grilled chicken patty with mayo and pickles", "cat": "Fast Food", "price": 70, "prep": 10, "type": FoodType.non_veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Chicken_burger.jpg/320px-Chicken_burger.jpg"},
    {"name": "Veg Noodles", "desc": "Hakka noodles stir-fried with vegetables and soy sauce", "cat": "Fast Food", "price": 55, "prep": 12, "type": FoodType.veg, "popular": False, "img": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=320"},
    {"name": "French Fries", "desc": "Crispy golden potato fries with ketchup", "cat": "Fast Food", "price": 40, "prep": 8, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Kinder_Happy_Meal_french_fries.jpg/320px-Kinder_Happy_Meal_french_fries.jpg"},
    # Snacks
    {"name": "Samosa (2 pieces)", "desc": "Crispy pastry filled with spiced potatoes and peas", "cat": "Snacks", "price": 20, "prep": 5, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Samosachutney.jpg/320px-Samosachutney.jpg"},
    {"name": "Veg Sandwich", "desc": "Toasted bread with fresh vegetables, cheese, and green chutney", "cat": "Snacks", "price": 35, "prep": 5, "type": FoodType.veg, "popular": False, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Finger_Sandwich.jpg/320px-Finger_Sandwich.jpg"},
    # Beverages
    {"name": "Masala Tea", "desc": "Spiced ginger tea with cardamom and milk", "cat": "Beverages", "price": 15, "prep": 3, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ginger_Chai.jpg/320px-Ginger_Chai.jpg"},
    {"name": "Filter Coffee", "desc": "Strong South Indian coffee with chicory and milk", "cat": "Beverages", "price": 20, "prep": 3, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/320px-A_small_cup_of_coffee.JPG"},
    {"name": "Fresh Lime Juice", "desc": "Refreshing lime juice with a pinch of salt and sugar", "cat": "Beverages", "price": 25, "prep": 3, "type": FoodType.veg, "popular": False, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Lime_Juice.jpg/320px-Lime_Juice.jpg"},
    {"name": "Mango Lassi", "desc": "Creamy yogurt-based mango smoothie", "cat": "Beverages", "price": 35, "prep": 3, "type": FoodType.veg, "popular": True, "img": "https://images.unsplash.com/photo-1605898104434-d6c5b49ee8f6?w=320"},
    {"name": "Water Bottle (500ml)", "desc": "Packaged drinking water", "cat": "Beverages", "price": 10, "prep": 1, "type": FoodType.veg, "popular": False, "img": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=320"},
    # Desserts
    {"name": "Vanilla Ice Cream", "desc": "Creamy vanilla ice cream scoop", "cat": "Desserts", "price": 30, "prep": 2, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/320px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg"},
    {"name": "Gulab Jamun", "desc": "Soft milk-solid balls soaked in rose-flavored sugar syrup", "cat": "Desserts", "price": 25, "prep": 3, "type": FoodType.veg, "popular": True, "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Gulabjamun.jpg/320px-Gulabjamun.jpg"},
]

item_objects = {}
for item in MENU_ITEMS:
    existing = db.query(MenuItem).filter(MenuItem.name == item["name"]).first()
    cat = cat_objects[item["cat"]]
    if not existing:
        mi = MenuItem(
            name=item["name"],
            description=item["desc"],
            category_id=cat.id,
            price=item["price"],
            preparation_time=item["prep"],
            food_type=item["type"],
            image_url=item["img"],
            is_available=True,
            stock_quantity=random.randint(30, 100),
            rating=round(random.uniform(3.8, 5.0), 1),
            rating_count=random.randint(10, 200),
            is_popular=item.get("popular", False),
            is_recommended=item.get("popular", False),
        )
        db.add(mi)
        db.flush()
        item_objects[item["name"]] = mi
    else:
        item_objects[item["name"]] = existing
db.commit()
print("  ✓ Menu items seeded")

# ─── Sample Orders ────────────────────────────────────────────────────────────
student_emails = ["student@campusbite.com", "divya@campusbite.com", "karthik@campusbite.com", "sneha@campusbite.com", "vignesh@campusbite.com"]
admin_user = user_objects["admin@campusbite.com"]

SAMPLE_ORDERS = [
    {"email": "student@campusbite.com", "items": [("Idli (2 pieces)", 2), ("Filter Coffee", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "divya@campusbite.com", "items": [("Masala Dosa", 1), ("Masala Tea", 2)], "method": PaymentMethod.card, "status": OrderStatus.completed, "paid": True},
    {"email": "karthik@campusbite.com", "items": [("Chicken Fried Rice", 1), ("Mango Lassi", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "sneha@campusbite.com", "items": [("Veg Meals", 1), ("Water Bottle (500ml)", 1)], "method": PaymentMethod.pay_at_counter, "status": OrderStatus.completed, "paid": True},
    {"email": "vignesh@campusbite.com", "items": [("Samosa (2 pieces)", 2), ("Fresh Lime Juice", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "student@campusbite.com", "items": [("Chicken Burger", 1), ("French Fries", 1), ("Mango Lassi", 1)], "method": PaymentMethod.card, "status": OrderStatus.completed, "paid": True},
    {"email": "divya@campusbite.com", "items": [("Paneer Butter Masala + Roti", 1), ("Filter Coffee", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "karthik@campusbite.com", "items": [("Veg Fried Rice", 1), ("Gulab Jamun", 2)], "method": PaymentMethod.card, "status": OrderStatus.completed, "paid": True},
    {"email": "sneha@campusbite.com", "items": [("Poori (2 pieces)", 1), ("Masala Tea", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "vignesh@campusbite.com", "items": [("Dosa", 1), ("Vanilla Ice Cream", 1)], "method": PaymentMethod.upi, "status": OrderStatus.completed, "paid": True},
    {"email": "student@campusbite.com", "items": [("Veg Burger", 1), ("Fresh Lime Juice", 1)], "method": PaymentMethod.card, "status": OrderStatus.ready, "paid": True},
    {"email": "divya@campusbite.com", "items": [("Veg Noodles", 1), ("Mango Lassi", 1)], "method": PaymentMethod.upi, "status": OrderStatus.preparing, "paid": True},
    {"email": "karthik@campusbite.com", "items": [("Chicken Fried Rice", 1), ("Filter Coffee", 1)], "method": PaymentMethod.pay_at_counter, "status": OrderStatus.accepted, "paid": False},
    {"email": "sneha@campusbite.com", "items": [("Idli (2 pieces)", 2), ("Masala Tea", 1)], "method": PaymentMethod.upi, "status": OrderStatus.placed, "paid": True},
    {"email": "vignesh@campusbite.com", "items": [("Pongal", 1), ("Filter Coffee", 1)], "method": PaymentMethod.card, "status": OrderStatus.placed, "paid": True},
]

for idx, order_data in enumerate(SAMPLE_ORDERS):
    u = user_objects[order_data["email"]]
    total = 0
    oi_data = []
    for item_name, qty in order_data["items"]:
        mi = item_objects.get(item_name)
        if not mi:
            continue
        sub = mi.price * qty
        total += sub
        oi_data.append({"menu_item_id": mi.id, "item_name": mi.name, "quantity": qty, "unit_price": mi.price, "subtotal": sub})

    tax = round(total * 0.05, 2)
    grand = round(total + tax + 5, 2)
    days_ago = random.randint(0, 14)
    created = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 6), minutes=random.randint(0, 59))
    token = generate_pickup_token()
    order_number = generate_order_number()

    # avoid duplicate order numbers
    while db.query(Order).filter(Order.order_number == order_number).first():
        order_number = generate_order_number()

    qr = generate_qr_code(f"CB:{order_number}:{token}")

    order = Order(
        order_number=order_number,
        pickup_token=token,
        user_id=u.id,
        total_amount=grand,
        tax_amount=tax,
        packaging_charge=5.0,
        discount_amount=0.0,
        payment_method=order_data["method"],
        payment_status=PaymentStatus.paid if order_data["paid"] else PaymentStatus.pending,
        order_status=order_data["status"],
        is_picked_up=order_data["status"] == OrderStatus.completed,
        pickup_counter=random.randint(1, 3),
        estimated_ready_time=created + timedelta(minutes=15),
        qr_data=qr,
        created_at=created,
    )
    db.add(order)
    db.flush()

    for oi in oi_data:
        db.add(OrderItem(order_id=order.id, **oi))

    db.add(Payment(
        order_id=order.id,
        payment_reference=f"CB-PAY-{random.randint(100000,999999)}",
        payment_method=order_data["method"].value,
        amount=grand,
        status=PaymentStatusEnum.success if order_data["paid"] else PaymentStatusEnum.pending,
    ))

    db.add(OrderStatusHistory(order_id=order.id, old_status=None, new_status=OrderStatus.placed.value, updated_by=u.id, created_at=created))
    if order_data["status"] in [OrderStatus.accepted, OrderStatus.preparing, OrderStatus.ready, OrderStatus.completed]:
        db.add(OrderStatusHistory(order_id=order.id, old_status=OrderStatus.placed.value, new_status=OrderStatus.accepted.value, updated_by=admin_user.id, created_at=created + timedelta(minutes=1)))
    if order_data["status"] in [OrderStatus.preparing, OrderStatus.ready, OrderStatus.completed]:
        db.add(OrderStatusHistory(order_id=order.id, old_status=OrderStatus.accepted.value, new_status=OrderStatus.preparing.value, updated_by=admin_user.id, created_at=created + timedelta(minutes=3)))
    if order_data["status"] in [OrderStatus.ready, OrderStatus.completed]:
        db.add(OrderStatusHistory(order_id=order.id, old_status=OrderStatus.preparing.value, new_status=OrderStatus.ready.value, updated_by=admin_user.id, created_at=created + timedelta(minutes=10)))
    if order_data["status"] == OrderStatus.completed:
        db.add(OrderStatusHistory(order_id=order.id, old_status=OrderStatus.ready.value, new_status=OrderStatus.completed.value, updated_by=admin_user.id, created_at=created + timedelta(minutes=15)))

db.commit()
print("  ✓ Sample orders seeded")

db.close()
print("\n✅ Database seeded successfully!")
print("\n📋 Demo Credentials:")
print("  Admin:   admin@campusbite.com   / Admin@123")
print("  Staff:   staff@campusbite.com   / Staff@123")
print("  Student: student@campusbite.com / Student@123")
