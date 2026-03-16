import numpy as np
from PIL import Image
from typing import Dict, List, Tuple
import cv2
from sklearn.cluster import KMeans
import colorsys
import math

class ClothingClassifier:
    def __init__(self):
        # Clothing categories
        self.categories = [
            't-shirt', 'shirt', 'blouse', 'sweater', 'hoodie',
            'jacket', 'coat', 'jeans', 'trousers', 'shorts',
            'skirt', 'dress', 'suit', 'blazer', 'vest'
        ]
        
        # Pattern types
        self.patterns = [
            'solid', 'striped', 'checked', 'polka_dot', 'floral', 
            'geometric', 'abstract', 'graphic'
        ]
        
        # Style categories
        self.styles = ['casual', 'formal', 'sporty', 'business', 'party',
                      'bohemian', 'vintage', 'minimalist', 'streetwear']

    def extract_colors(self, image: Image.Image, n_colors: int = 3) -> List[Dict]:
        """Extract dominant colors from image"""
        try:
            # Convert PIL to numpy
            img_array = np.array(image)
            
            # Get image dimensions
            height, width = img_array.shape[:2]
            
            # Focus on center 60% of image (where clothing is)
            h_start = int(height * 0.2)
            h_end = int(height * 0.8)
            w_start = int(width * 0.2)
            w_end = int(width * 0.8)
            
            # Extract center region
            center_region = img_array[h_start:h_end, w_start:w_end]
            
            # Reshape to list of pixels
            pixels = center_region.reshape(-1, 3)
            
            # Filter out extreme whites (background) and extreme blacks (shadows)
            filtered_pixels = []
            for r, g, b in pixels:
                # Skip near-white pixels (background)
                if r > 240 and g > 240 and b > 240:
                    continue
                # Skip near-black pixels (shadows/edges)
                if r < 30 and g < 30 and b < 30:
                    continue
                filtered_pixels.append([r, g, b])
            
            # If we filtered too much, use original pixels
            if len(filtered_pixels) < 100:
                filtered_pixels = pixels
            
            filtered_pixels = np.array(filtered_pixels)
            
            if len(filtered_pixels) == 0:
                return [{'name': 'unknown', 'percentage': 100}]
            
            # Use K-means to find dominant colors
            k = min(n_colors, len(filtered_pixels))
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(filtered_pixels)
            
            # Count pixels in each cluster
            labels = kmeans.labels_
            unique, counts = np.unique(labels, return_counts=True)
            
            colors = []
            for i, center in enumerate(kmeans.cluster_centers_):
                r, g, b = center.astype(int)
                percentage = (counts[i] / len(filtered_pixels)) * 100
                
                # Only include colors that make up at least 10% of the image
                if percentage < 10:
                    continue
                
                # Convert to HSV for better color naming
                h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
                color_name = self.get_color_name(h, s, v)
                
                colors.append({
                    'name': color_name,
                    'percentage': float(percentage)
                })
            
            # Sort by percentage
            colors = sorted(colors, key=lambda x: x['percentage'], reverse=True)
            
            # If no colors passed threshold, return top color
            if len(colors) == 0 and len(kmeans.cluster_centers_) > 0:
                center = kmeans.cluster_centers_[0]
                r, g, b = center.astype(int)
                h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
                color_name = self.get_color_name(h, s, v)
                colors.append({'name': color_name, 'percentage': 100.0})
            
            return colors
            
        except Exception as e:
            print(f"Error in extract_colors: {e}")
            return [{'name': 'unknown', 'percentage': 100}]

    def get_color_name(self, h: float, s: float, v: float) -> str:
        """Convert HSV to color name"""
        # Grayscale detection
        if s < 0.15:
            if v < 0.2:
                return 'black'
            elif v < 0.4:
                return 'dark_gray'
            elif v < 0.6:
                return 'gray'
            elif v < 0.8:
                return 'light_gray'
            else:
                return 'white'
        
        # Color detection based on hue
        h_deg = h * 360
        
        if h_deg < 10 or h_deg >= 350:
            return 'red'
        elif h_deg < 25:
            return 'orange_red'
        elif h_deg < 40:
            return 'orange'
        elif h_deg < 60:
            return 'yellow_orange'
        elif h_deg < 75:
            return 'yellow'
        elif h_deg < 100:
            return 'lime_green'
        elif h_deg < 140:
            return 'green'
        elif h_deg < 170:
            return 'teal'
        elif h_deg < 200:
            return 'cyan'
        elif h_deg < 220:
            return 'light_blue'
        elif h_deg < 250:
            return 'blue'
        elif h_deg < 280:
            return 'purple'
        elif h_deg < 320:
            return 'magenta'
        elif h_deg < 350:
            return 'pink'
        else:
            return 'red'

    def detect_pattern(self, image: Image.Image) -> str:
        """Detect pattern in clothing - optimized for polka dots"""
        try:
            # Convert to grayscale
            img_gray = np.array(image.convert('L'))
            
            # Apply blur to reduce noise
            blurred = cv2.GaussianBlur(img_gray, (5, 5), 0)
            
            # Edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Calculate edge density
            edge_density = np.sum(edges > 0) / edges.size
            
            # If very few edges, it's solid
            if edge_density < 0.02:
                return 'solid'
            
            # METHOD 1: Circle detection specifically for polka dots
            try:
                # Use Hough Circle Transform
                circles = cv2.HoughCircles(
                    blurred, 
                    cv2.HOUGH_GRADIENT, 
                    dp=1.2, 
                    minDist=15,
                    param1=50, 
                    param2=25, 
                    minRadius=3, 
                    maxRadius=25
                )
                
                if circles is not None:
                    circles = circles[0]
                    if len(circles) > 5:  # Multiple circles found
                        return 'polka_dot'
            except:
                pass
            
            # METHOD 2: Contour analysis for round shapes
            try:
                # Apply binary threshold
                _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
                
                # Find contours
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                # Count round contours
                round_count = 0
                for contour in contours:
                    area = cv2.contourArea(contour)
                    if 20 < area < 500:  # Small to medium areas
                        perimeter = cv2.arcLength(contour, True)
                        if perimeter > 0:
                            circularity = 4 * np.pi * area / (perimeter * perimeter)
                            if circularity > 0.7:  # Round shape
                                round_count += 1
                
                if round_count > 8:
                    return 'polka_dot'
            except:
                pass
            
            # METHOD 3: Check for many small edge clusters (dots create isolated edges)
            # Divide image into grid
            h, w = edges.shape
            cell_h, cell_w = h // 10, w // 10
            edge_cells = 0
            
            for i in range(0, h - cell_h, cell_h):
                for j in range(0, w - cell_w, cell_w):
                    cell = edges[i:i+cell_h, j:j+cell_w]
                    if np.sum(cell > 0) > cell.size * 0.02:
                        edge_cells += 1
            
            # If many cells have edges but overall density is moderate, likely dots
            edge_cell_ratio = edge_cells / ((h // cell_h) * (w // cell_w))
            
            if 0.2 < edge_cell_ratio < 0.6 and 0.03 < edge_density < 0.08:
                return 'polka_dot'
            
            # Detect lines (for stripes)
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, 
                                   minLineLength=30, maxLineGap=10)
            
            if lines is not None and len(lines) > 10:
                # Check if lines are mostly parallel (stripes)
                angles = []
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    angle = abs(math.atan2(y2 - y1, x2 - x1) * 180 / math.pi)
                    angles.append(angle)
                
                if angles:
                    angle_std = np.std(angles)
                    if angle_std < 25:  # Consistent angles
                        return 'striped'
            
            # Check for checked pattern (both horizontal and vertical lines)
            if lines is not None and len(lines) > 15:
                h_lines = 0
                v_lines = 0
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    angle = abs(math.atan2(y2 - y1, x2 - x1) * 180 / math.pi)
                    if angle < 20 or angle > 160:
                        h_lines += 1
                    elif 70 < angle < 110:
                        v_lines += 1
                
                if h_lines > 5 and v_lines > 5:
                    return 'checked'
            
            # If high edge density, it's patterned
            if edge_density > 0.08:
                return 'patterned'
            
            return 'solid'
            
        except Exception as e:
            print(f"Error in detect_pattern: {e}")
            return 'patterned'  # Default to patterned instead of unknown

    def classify_item(self, image: Image.Image) -> Dict:
        """Main classification function"""
        try:
            # Extract colors
            colors = self.extract_colors(image)
            primary_color = colors[0]['name'] if colors else 'unknown'
            secondary_color = colors[1]['name'] if len(colors) > 1 else None
            
            # Detect pattern
            pattern = self.detect_pattern(image)
            
            # Determine category based on aspect ratio
            category = self.determine_category(image)
            
            # Determine style based on color and pattern
            style = self.determine_style(primary_color, pattern)
            
            # Determine formality
            formality = self.determine_formality(style, pattern)
            
            # Determine season
            season = self.determine_season(primary_color, pattern)
            
            return {
                'category': category,
                'color_primary': primary_color,
                'color_secondary': secondary_color,
                'pattern': pattern,
                'style': style,
                'season': season,
                'formality_level': formality,
                'attributes': {
                    'colors': colors,
                    'pattern_detected': pattern
                }
            }
            
        except Exception as e:
            print(f"Error in classify_item: {e}")
            return {
                'category': 'shirt',
                'color_primary': 'unknown',
                'color_secondary': None,
                'pattern': 'unknown',
                'style': 'casual',
                'season': 'all_season',
                'formality_level': 'casual',
                'attributes': {}
            }

    def determine_category(self, image: Image.Image) -> str:
        """Determine clothing category based on aspect ratio"""
        try:
            width, height = image.size
            aspect_ratio = width / height
            
            # Rough category guessing based on shape
            if aspect_ratio > 1.3:  # Wider than tall
                return 'trousers'
            elif aspect_ratio < 0.6:  # Much taller than wide
                return 'dress'
            elif 0.8 < aspect_ratio < 1.2:  # Roughly square
                return 't-shirt'
            else:
                return 'shirt'
        except:
            return 'shirt'

    def determine_style(self, color: str, pattern: str) -> str:
        """Determine style based on attributes"""
        # Business style
        if pattern == 'solid' and color in ['black', 'navy', 'dark_gray', 'gray', 'white']:
            return 'business'
        
        # Party style
        if color in ['red', 'purple', 'pink', 'magenta', 'gold']:
            return 'party'
        
        # Casual style
        if pattern in ['striped', 'polka_dot', 'patterned']:
            return 'casual'
        
        # Default
        return 'casual'

    def determine_formality(self, style: str, pattern: str) -> str:
        """Determine formality level"""
        if style == 'business' and pattern == 'solid':
            return 'business_formal'
        elif style == 'business':
            return 'business_casual'
        elif style == 'party':
            return 'formal'
        elif style == 'casual' and pattern != 'patterned':
            return 'casual'
        else:
            return 'casual'

    def determine_season(self, color: str, pattern: str) -> str:
        """Determine season"""
        if pattern == 'floral':
            return 'spring'
        elif color in ['white', 'light_gray']:
            return 'summer'
        elif pattern in ['plaid', 'checked']:
            return 'fall'
        elif color in ['black', 'navy', 'dark_gray']:
            return 'winter'
        else:
            return 'all_season'

# Singleton instance
classifier = ClothingClassifier()