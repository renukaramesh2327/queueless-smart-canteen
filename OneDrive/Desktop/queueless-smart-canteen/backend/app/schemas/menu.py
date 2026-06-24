from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.menu_item import FoodType


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    price: float
    preparation_time: int = 10
    food_type: FoodType = FoodType.veg
    image_url: Optional[str] = None
    is_available: bool = True
    stock_quantity: int = 100
    is_popular: bool = False
    is_recommended: bool = False


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    preparation_time: Optional[int] = None
    food_type: Optional[FoodType] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    stock_quantity: Optional[int] = None
    is_popular: Optional[bool] = None
    is_recommended: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: int
    rating: float
    rating_count: int
    category: CategoryResponse
    created_at: datetime

    class Config:
        from_attributes = True
