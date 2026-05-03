from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json
import os
import jwt
import traceback

from app.models.database import SessionLocal, ClothingItem, User
from app.services.image_analyzer import image_analyzer
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])
SECRET_KEY = "your-secret-key-change-in-production"


# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTH ----------------
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("id")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- UPLOAD ----------------
@router.post("/upload")
async def upload_clothing(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()
        analysis = await image_analyzer.analyze_image(contents, file.filename)

        item = ClothingItem(
            user_id=user.id,
            filename=analysis.get('filename'),
            category=analysis.get('category'),
            color_primary=analysis.get('color_primary'),
            color_secondary=analysis.get('color_secondary'),
            pattern=analysis.get('pattern'),
            style=analysis.get('style'),
            season=analysis.get('season'),
            formality_level=analysis.get('formality_level'),
            attributes=json.dumps(analysis.get('attributes', {})),
            image_path=analysis.get('image_path')
        )

        db.add(item)
        db.commit()
        db.refresh(item)

        return {
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
            "attributes": analysis.get('attributes', {}),
            "image_url": f"/uploads/{os.path.basename(item.image_path)}"
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET ALL ITEMS ----------------
@router.get("/items")
def get_items(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(ClothingItem)\
        .filter(ClothingItem.user_id == user.id)\
        .order_by(ClothingItem.upload_date.desc())\
        .all()

    response = []

    for it in items:
        response.append({
            "id": it.id,
            "filename": it.filename,
            "upload_date": it.upload_date.isoformat(),
            "category": it.category,
            "color_primary": it.color_primary,
            "color_secondary": it.color_secondary,
            "pattern": it.pattern,
            "style": it.style,
            "season": it.season,
            "formality_level": it.formality_level,
            "attributes": json.loads(it.attributes) if it.attributes else {},
            "image_url": f"/uploads/{os.path.basename(it.image_path)}"
        })

    return response


# ---------------- GET SINGLE ITEM ----------------
@router.get("/items/{item_id}")
def get_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ClothingItem)\
        .filter(ClothingItem.id == item_id, ClothingItem.user_id == user.id)\
        .first()

    if not item:
        raise HTTPException(404, "Item not found")

    return {
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


# ---------------- DELETE ITEM ----------------
@router.delete("/items/{item_id}")
def delete_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ClothingItem)\
        .filter(ClothingItem.id == item_id, ClothingItem.user_id == user.id)\
        .first()

    if not item:
        raise HTTPException(404, "Item not found")

    if os.path.exists(item.image_path):
        os.remove(item.image_path)

    db.delete(item)
    db.commit()

    return {"message": "Item deleted"}


# ---------------- RECOMMEND ----------------
@router.post("/recommend")
def recommend(
    request: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print("=" * 50)
        print("RECOMMENDATION REQUEST")

        query = request.get('query', '')
        if not query:
            return JSONResponse(
                status_code=400,
                content={"error": "No query provided"}
            )

        print(f"User: {user.email}")
        print(f"Skin tone: {user.skin_tone}")
        print(f"Query: {query}")

        # Fetch user wardrobe
        items = db.query(ClothingItem)\
            .filter(ClothingItem.user_id == user.id)\
            .all()

        print(f"Found {len(items)} items")

        wardrobe_list = []

        for i in items:
            wardrobe_list.append({
                "id": i.id,
                "category": (i.category or "").lower(),
                "color_primary": (i.color_primary or "").lower(),  # ✅ IMPORTANT FIX
                "pattern": i.pattern,
                "style": i.style,
                "formality_level": i.formality_level,
                "image_url": f"/uploads/{os.path.basename(i.image_path)}"
            })

        print("WARDROBE LIST:", wardrobe_list)

        # Run recommendation engine
        engine = RecommendationEngine()

        rec = engine.recommend(
            wardrobe_list,
            query,
            skin_tone=(user.skin_tone or "").lower()  # ✅ PASS CLEAN DATA
        )

        print("RESPONSE:", rec)

        return rec

    except Exception as e:
        print("=" * 50)
        print("ERROR IN RECOMMENDATION:")
        traceback.print_exc()
        print("=" * 50)

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "message": "Internal server error"
            }
        )