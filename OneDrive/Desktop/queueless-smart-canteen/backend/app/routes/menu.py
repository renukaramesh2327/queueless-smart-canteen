from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.database import get_db
from ..models.menu_item import MenuItem, FoodType
from ..models.category import Category
from ..schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse, CategoryCreate, CategoryResponse
from ..auth.auth import get_current_user, get_current_staff
from ..models.user import User

router = APIRouter(prefix="/api/menu", tags=["Menu"])
cat_router = APIRouter(prefix="/api/categories", tags=["Categories"])


# ---- Categories ----

@cat_router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True).order_by(Category.sort_order).all()


@cat_router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(status_code=400, detail="Category name already exists")
    cat = Category(**data.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@cat_router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: int, data: CategoryCreate, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@cat_router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()
    return {"message": "Category deactivated"}


# ---- Menu Items ----

@router.get("", response_model=List[MenuItemResponse])
def get_menu(
    category_id: Optional[int] = None,
    food_type: Optional[FoodType] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    available_only: bool = False,
    popular_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if food_type:
        query = query.filter(MenuItem.food_type == food_type)
    if min_price is not None:
        query = query.filter(MenuItem.price >= min_price)
    if max_price is not None:
        query = query.filter(MenuItem.price <= max_price)
    if available_only:
        query = query.filter(MenuItem.is_available == True)
    if popular_only:
        query = query.filter(MenuItem.is_popular == True)
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search}%"))
    return query.order_by(MenuItem.name).all()


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.post("", response_model=MenuItemResponse, status_code=201)
def create_menu_item(data: MenuItemCreate, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")
    item = MenuItem(**data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, data: MenuItemUpdate, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted"}


@router.patch("/{item_id}/availability")
def toggle_availability(item_id: int, db: Session = Depends(get_db), staff=Depends(get_current_staff)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    item.is_available = not item.is_available
    db.commit()
    return {"id": item.id, "is_available": item.is_available}
