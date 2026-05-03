from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./wardrobe.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    gender = Column(String, nullable=True)          # male/female/other
    skin_tone = Column(String, nullable=True)       # fair/medium/dark/olive
    created_at = Column(DateTime, default=datetime.utcnow)

    clothing_items = relationship("ClothingItem", back_populates="owner")

class ClothingItem(Base):
    __tablename__ = "clothing_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    category = Column(String, nullable=True)
    color_primary = Column(String, nullable=True)
    color_secondary = Column(String, nullable=True)
    pattern = Column(String, nullable=True)
    style = Column(String, nullable=True)
    season = Column(String, nullable=True)
    formality_level = Column(String, nullable=True)
    attributes = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)

    owner = relationship("User", back_populates="clothing_items")

Base.metadata.create_all(bind=engine)