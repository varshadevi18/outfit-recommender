from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./wardrobe.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ClothingItem(Base):
    __tablename__ = "clothing_items"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Clothing attributes
    category = Column(String, nullable=True)
    color_primary = Column(String, nullable=True)
    color_secondary = Column(String, nullable=True)
    pattern = Column(String, nullable=True)
    style = Column(String, nullable=True)
    season = Column(String, nullable=True)
    formality_level = Column(String, nullable=True)
    
    # Detailed attributes (JSON stored as text)
    attributes = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)