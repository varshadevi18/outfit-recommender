from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import wardrobe, auth
import os

app = FastAPI(title="Virtual Wardrobe API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers WITHOUT /api prefix
app.include_router(wardrobe.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Virtual Wardrobe API", "status": "running"}