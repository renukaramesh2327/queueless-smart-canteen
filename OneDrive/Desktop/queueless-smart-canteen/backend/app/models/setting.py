from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(String(500), nullable=True)
    setting_type = Column(String(20), default="string")  # string, integer, float, boolean
    description = Column(String(200), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
