import aiofiles
from PIL import Image
import io
import os
import uuid
import traceback
from typing import Dict
from .clothing_classifier import classifier

class ImageAnalyzer:
    async def analyze_image(self, image_data: bytes, filename: str) -> Dict:
        """Analyze uploaded image and extract clothing features"""
        try:
            print(f"Starting analysis for {filename}")
            
            # Open image with PIL
            image = Image.open(io.BytesIO(image_data))
            print(f"Image opened successfully. Mode: {image.mode}, Size: {image.size}")
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                print("Converted image to RGB")
            
            # Analyze with classifier
            print("Calling classifier...")
            analysis_result = classifier.classify_item(image)
            print(f"Classification complete")
            
            # Save image
            print("Saving image...")
            image_path = await self.save_image(image_data, filename)
            print(f"Image saved to {image_path}")
            
            analysis_result['image_path'] = image_path
            analysis_result['filename'] = filename
            
            return analysis_result
            
        except Exception as e:
            print(f"ERROR in analyze_image: {str(e)}")
            print(traceback.format_exc())
            raise Exception(f"Error analyzing image: {str(e)}")

    async def save_image(self, image_data: bytes, filename: str) -> str:
        """Save image to uploads folder"""
        try:
            # Ensure uploads directory exists
            os.makedirs("uploads", exist_ok=True)
            print("Uploads directory ready")
            
            # Generate safe filename
            ext = filename.split('.')[-1] if '.' in filename else 'jpg'
            safe_filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join("uploads", safe_filename)
            print(f"Saving to: {filepath}")
            
            # Save file
            async with aiofiles.open(filepath, 'wb') as f:
                await f.write(image_data)
            
            print(f"File saved successfully")
            return filepath
            
        except Exception as e:
            print(f"Error saving image: {str(e)}")
            raise

# Singleton instance
image_analyzer = ImageAnalyzer()