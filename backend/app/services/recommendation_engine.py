import random
from typing import List, Dict, Any
import json

class RecommendationEngine:
    def __init__(self):
        # Occasion to outfit rules mapping
        self.occasion_rules = {
            'interview': {
                'required': ['business_formal', 'business_casual'],
                'preferred': ['shirt', 'blazer', 'suit', 'trousers'],
                'colors': ['black', 'navy', 'dark_gray', 'white', 'gray'],
                'patterns': ['solid'],
                'max_items': 3,
                'description': 'Professional and conservative outfit'
            },
            'business meeting': {
                'required': ['business_casual', 'business_formal'],
                'preferred': ['shirt', 'blazer', 'trousers', 'skirt'],
                'colors': ['black', 'navy', 'gray', 'white', 'blue'],
                'patterns': ['solid', 'striped'],
                'max_items': 3,
                'description': 'Professional business attire'
            },
            'party': {
                'required': ['party', 'formal'],
                'preferred': ['dress', 'shirt', 'blazer'],
                'colors': ['red', 'black', 'purple', 'pink', 'gold'],
                'patterns': ['solid', 'patterned'],
                'max_items': 3,
                'description': 'Festive and stylish outfit'
            },
            'casual': {
                'required': ['casual', 'very_casual'],
                'preferred': ['t-shirt', 'jeans', 'shorts', 'hoodie'],
                'colors': ['any'],
                'patterns': ['any'],
                'max_items': 3,
                'description': 'Comfortable everyday wear'
            },
            'date night': {
                'required': ['casual', 'party'],
                'preferred': ['shirt', 'dress', 'blazer'],
                'colors': ['red', 'black', 'blue', 'purple'],
                'patterns': ['solid', 'striped'],
                'max_items': 3,
                'description': 'Romantic and stylish outfit'
            },
            'wedding': {
                'required': ['formal', 'party'],
                'preferred': ['suit', 'dress', 'blazer'],
                'colors': ['navy', 'gray', 'pastel', 'elegant'],
                'patterns': ['solid'],
                'max_items': 3,
                'description': 'Elegant wedding attire'
            },
            'workout': {
                'required': ['sporty', 'casual'],
                'preferred': ['t-shirt', 'shorts', 'hoodie'],
                'colors': ['any'],
                'patterns': ['any'],
                'max_items': 2,
                'description': 'Comfortable active wear'
            },
            'default': {
                'required': ['casual'],
                'preferred': ['t-shirt', 'jeans'],
                'colors': ['any'],
                'patterns': ['any'],
                'max_items': 3,
                'description': 'Casual everyday outfit'
            }
        }
        
        # Outfit combinations that work well together
        self.outfit_combinations = [
            {'top': ['shirt', 'blouse', 't-shirt'], 'bottom': ['trousers', 'jeans', 'skirt']},
            {'top': ['shirt', 'blouse'], 'bottom': ['trousers'], 'outer': ['blazer', 'jacket']},
            {'top': ['t-shirt', 'hoodie'], 'bottom': ['jeans', 'shorts']},
            {'dress': ['dress']},
            {'top': ['shirt', 'blouse'], 'bottom': ['skirt']},
        ]

    def parse_occasion(self, user_input: str) -> str:
        """Parse user input to determine occasion type"""
        user_input = user_input.lower()
        
        # Simple keyword matching
        occasion_keywords = {
            'interview': ['interview', 'job', 'hiring', 'recruitment'],
            'business meeting': ['meeting', 'business', 'corporate', 'office', 'work'],
            'party': ['party', 'club', 'night out', 'celebration'],
            'casual': ['casual', 'everyday', 'regular', 'normal'],
            'date night': ['date', 'romantic', 'dinner'],
            'wedding': ['wedding', 'marriage', 'ceremony'],
            'workout': ['gym', 'workout', 'exercise', 'sports', 'running']
        }
        
        for occasion, keywords in occasion_keywords.items():
            if any(keyword in user_input for keyword in keywords):
                return occasion
        
        return 'default'

    def get_compatible_items(self, wardrobe_items: List[Dict], occasion: str) -> Dict[str, List]:
        """Get items compatible with the occasion"""
        rules = self.occasion_rules.get(occasion, self.occasion_rules['default'])
        
        # Categorize items by type
        tops = []
        bottoms = []
        dresses = []
        outerwear = []
        footwear = []  # You can add footwear later
        
        for item in wardrobe_items:
            category = item.get('category', '').lower()
            formality = item.get('formality_level', 'casual')
            color = item.get('color_primary', '')
            pattern = item.get('pattern', '')
            
            # Check if item meets occasion requirements
            meets_formality = formality in rules['required'] or rules['required'] == ['any']
            meets_color = color in rules['colors'] or 'any' in rules['colors']
            meets_pattern = pattern in rules['patterns'] or 'any' in rules['patterns']
            
            if not (meets_formality and meets_color and meets_pattern):
                continue
            
            # Categorize
            if category in ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie']:
                tops.append(item)
            elif category in ['trousers', 'jeans', 'shorts', 'skirt']:
                bottoms.append(item)
            elif category in ['dress']:
                dresses.append(item)
            elif category in ['blazer', 'jacket', 'coat', 'suit']:
                outerwear.append(item)
        
        return {
            'tops': tops,
            'bottoms': bottoms,
            'dresses': dresses,
            'outerwear': outerwear
        }

    def generate_outfit(self, categorized_items: Dict[str, List], occasion: str) -> Dict[str, Any]:
        """Generate an outfit from available items"""
        rules = self.occasion_rules.get(occasion, self.occasion_rules['default'])
        max_items = rules['max_items']
        
        outfit = {
            'items': [],
            'total_items': 0,
            'occasion': occasion,
            'description': rules['description']
        }
        
        # Try different combination patterns
        if categorized_items['dresses'] and random.choice([True, False]):
            # Dress outfit
            if categorized_items['dresses']:
                dress = random.choice(categorized_items['dresses'])
                outfit['items'].append({
                    'type': 'dress',
                    'item': dress,
                    'position': 'main'
                })
                
                # Add outerwear if available and not exceeding max_items
                if categorized_items['outerwear'] and len(outfit['items']) < max_items:
                    outer = random.choice(categorized_items['outerwear'])
                    outfit['items'].append({
                        'type': 'outerwear',
                        'item': outer,
                        'position': 'over'
                    })
        
        else:
            # Top + Bottom outfit
            if categorized_items['tops'] and len(outfit['items']) < max_items:
                top = random.choice(categorized_items['tops'])
                outfit['items'].append({
                    'type': 'top',
                    'item': top,
                    'position': 'top'
                })
            
            if categorized_items['bottoms'] and len(outfit['items']) < max_items:
                bottom = random.choice(categorized_items['bottoms'])
                outfit['items'].append({
                    'type': 'bottom',
                    'item': bottom,
                    'position': 'bottom'
                })
            
            # Add outerwear if available and outfit looks good
            if categorized_items['outerwear'] and len(outfit['items']) < max_items:
                # Check if outerwear complements the outfit
                if outfit['items']:
                    main_color = outfit['items'][0]['item'].get('color_primary', '')
                    outer_options = [o for o in categorized_items['outerwear'] 
                                   if o.get('color_primary') in ['black', 'navy', 'gray', main_color]]
                    if outer_options:
                        outer = random.choice(outer_options)
                        outfit['items'].append({
                            'type': 'outerwear',
                            'item': outer,
                            'position': 'over'
                        })
        
        # If no items found, return empty outfit
        if not outfit['items']:
            outfit['items'] = []
            outfit['message'] = 'No suitable items found for this occasion'
        
        outfit['total_items'] = len(outfit['items'])
        return outfit

    def recommend(self, wardrobe_items: List[Dict], user_query: str) -> Dict[str, Any]:
        """Main recommendation function"""
        # Parse occasion from user query
        occasion = self.parse_occasion(user_query)
        
        # Get compatible items
        categorized_items = self.get_compatible_items(wardrobe_items, occasion)
        
        # Generate outfit
        outfit = self.generate_outfit(categorized_items, occasion)
        
        # Add all available items for reference
        outfit['available_counts'] = {
            'tops': len(categorized_items['tops']),
            'bottoms': len(categorized_items['bottoms']),
            'dresses': len(categorized_items['dresses']),
            'outerwear': len(categorized_items['outerwear'])
        }
        
        return outfit

# Singleton instance
recommendation_engine = RecommendationEngine()