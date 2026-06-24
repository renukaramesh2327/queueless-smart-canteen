from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
from ..database.database import get_db
from ..models.setting import Setting
from ..auth.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).all()
    return {s.setting_key: s.setting_value for s in settings}


@router.put("")
def update_settings(data: Dict[str, str], db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    for key, value in data.items():
        setting = db.query(Setting).filter(Setting.setting_key == key).first()
        if setting:
            setting.setting_value = value
        else:
            db.add(Setting(setting_key=key, setting_value=value))
    db.commit()
    return {"message": "Settings updated"}
