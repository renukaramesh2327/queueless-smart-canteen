from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database.database import Base


class FoodType(str, enum.Enum):
    veg = "veg"
    non_veg = "non_veg"


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(300), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False)
    preparation_time = Column(Integer, default=10)  # minutes
    food_type = Column(Enum(FoodType), default=FoodType.veg, nullable=False)
    image_url = Column(String(300), nullable=True)
    is_available = Column(Boolean, default=True)
    stock_quantity = Column(Integer, default=100)
    rating = Column(Float, default=4.0)
    rating_count = Column(Integer, default=0)
    is_popular = Column(Boolean, default=False)
    is_recommended = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")
