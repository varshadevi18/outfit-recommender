from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json
from datetime import datetime
import os
import traceback

from app.models.database import SessionLocal, ClothingItem
from app.services.image_analyzer import image_analyzer

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_clothing(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and analyze a clothing item"""
    try:
        # Read file content
        contents = await file.read()
        
        # Analyze image
        analysis_result = await image_analyzer.analyze_image(contents, file.filename)
        
        # Check if file with same name exists
        existing_item = db.query(ClothingItem).filter(
            ClothingItem.filename == analysis_result['filename']
        ).first()
        
        if existing_item:
            # Update existing item
            existing_item.upload_date = datetime.utcnow()
            existing_item.category = analysis_result['category']
            existing_item.color_primary = analysis_result['color_primary']
            existing_item.color_secondary = analysis_result['color_secondary']
            existing_item.pattern = analysis_result['pattern']
            existing_item.style = analysis_result['style']
            existing_item.season = analysis_result['season']
            existing_item.formality_level = analysis_result['formality_level']
            existing_item.attributes = json.dumps(analysis_result['attributes'])
            existing_item.image_path = analysis_result['image_path']
            
            db.commit()
            db.refresh(existing_item)
            clothing_item = existing_item
        else:
            # Create new database entry
            clothing_item = ClothingItem(
                filename=analysis_result['filename'],
                category=analysis_result['category'],
                color_primary=analysis_result['color_primary'],
                color_secondary=analysis_result['color_secondary'],
                pattern=analysis_result['pattern'],
                style=analysis_result['style'],
                season=analysis_result['season'],
                formality_level=analysis_result['formality_level'],
                attributes=json.dumps(analysis_result['attributes']),
                image_path=analysis_result['image_path']
            )
            
            db.add(clothing_item)
            db.commit()
            db.refresh(clothing_item)
        
        # Prepare response (no confidence scores)
        response = {
            "id": clothing_item.id,
            "filename": clothing_item.filename,
            "upload_date": clothing_item.upload_date.isoformat(),
            "category": clothing_item.category,
            "color_primary": clothing_item.color_primary,
            "color_secondary": clothing_item.color_secondary,
            "pattern": clothing_item.pattern,
            "style": clothing_item.style,
            "season": clothing_item.season,
            "formality_level": clothing_item.formality_level,
            "attributes": analysis_result['attributes'],
            "image_url": f"/uploads/{os.path.basename(clothing_item.image_path)}"
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        print(f"Error in upload: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/items")
async def get_all_items(db: Session = Depends(get_db)):
    """Get all wardrobe items"""
    items = db.query(ClothingItem).order_by(ClothingItem.upload_date.desc()).all()
    
    response = []
    for item in items:
        response.append({
            "id": item.id,
            "filename": item.filename,
            "upload_date": item.upload_date.isoformat(),
            "category": item.category,
            "color_primary": item.color_primary,
            "color_secondary": item.color_secondary,
            "pattern": item.pattern,
            "style": item.style,
            "season": item.season,
            "formality_level": item.formality_level,
            "attributes": json.loads(item.attributes) if item.attributes else {},
            "image_url": f"/uploads/{os.path.basename(item.image_path)}"
        })
    
    return JSONResponse(content=response)

@router.get("/items/{item_id}")
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get specific wardrobe item"""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    response = {
        "id": item.id,
        "filename": item.filename,
        "upload_date": item.upload_date.isoformat(),
        "category": item.category,
        "color_primary": item.color_primary,
        "color_secondary": item.color_secondary,
        "pattern": item.pattern,
        "style": item.style,
        "season": item.season,
        "formality_level": item.formality_level,
        "attributes": json.loads(item.attributes) if item.attributes else {},
        "image_url": f"/uploads/{os.path.basename(item.image_path)}"
    }
    
    return JSONResponse(content=response)

@router.delete("/items/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete wardrobe item"""
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Delete image file
    if os.path.exists(item.image_path):
        os.remove(item.image_path)
    
    db.delete(item)
    db.commit()
    
    return JSONResponse(content={"message": "Item deleted successfully"})