import random
from typing import List, Dict

class RecommendationEngine:
    def __init__(self):
        pass

    def parse_occasion(self, text: str) -> str:
        text = (text or "").lower()

        if 'interview' in text or 'job' in text:
            return 'interview'
        elif 'party' in text or 'celebration' in text:
            return 'party'
        elif 'meeting' in text or 'business' in text or 'work' in text:
            return 'business'
        elif 'date' in text or 'romantic' in text:
            return 'date'
        elif 'casual' in text or 'everyday' in text:
            return 'casual'
        else:
            return 'default'

    def recommend(self, wardrobe_items: List[Dict], user_query: str, skin_tone: str = None) -> Dict:
        try:
            print("DEBUG: Starting recommendation...")
            print("DEBUG: Skin tone:", skin_tone)

            occasion = self.parse_occasion(user_query)

            # Normalize items
            filtered = []
            for item in wardrobe_items:
                if not isinstance(item, dict):
                    continue

                filtered.append({
                    **item,
                    "category": (item.get("category") or "").lower(),
                    "color_primary": (item.get("color_primary") or "").lower()
                })

            if not filtered:
                return {
                    "items": [],
                    "message": "No items in wardrobe. Upload some clothes first."
                }

            # 🎯 SKIN TONE COLOR LOGIC
            skin_tone_colors = {
                "fair": ["blue", "green", "purple", "pink", "navy"],
                "medium": ["white", "black", "maroon", "olive", "teal"],
                "dark": ["yellow", "orange", "red", "white", "gold"]
            }

            preferred_colors = skin_tone_colors.get((skin_tone or "").lower(), [])

            print("Preferred colors:", preferred_colors)

            if preferred_colors:
                skin_filtered = [
                    item for item in filtered
                    if item.get("color_primary") in preferred_colors
                ]

                # fallback if nothing matches
                if skin_filtered:
                    filtered = skin_filtered
                    print(f"Filtered {len(filtered)} items based on skin tone")

            # 🎯 OCCASION BASED FILTER (optional upgrade)
            occasion_map = {
                "interview": ["shirt", "trousers"],
                "business": ["shirt", "trousers"],
                "party": ["t-shirt", "jeans"],
                "date": ["shirt", "jeans"],
                "casual": ["t-shirt", "jeans"]
            }

            preferred_categories = occasion_map.get(occasion, [])

            if preferred_categories:
                occ_filtered = [
                    item for item in filtered
                    if item.get("category") in preferred_categories
                ]
                if occ_filtered:
                    filtered = occ_filtered
                    print(f"Filtered {len(filtered)} items based on occasion")

            random.shuffle(filtered)

            # 🎯 SELECT OUTFIT
            outfit_items = []

            top = next(
                (c for c in filtered if c.get('category') in ['t-shirt', 'shirt', 'blouse']),
                None
            )

            bottom = next(
                (c for c in filtered if c.get('category') in ['trousers', 'jeans', 'skirt']),
                None
            )

            if top:
                outfit_items.append({'type': 'top', 'item': top})

            if bottom:
                outfit_items.append({'type': 'bottom', 'item': bottom})

            # fallback
            if not outfit_items and filtered:
                outfit_items.append({'type': 'outfit', 'item': filtered[0]})

            return {
                'items': outfit_items,
                'occasion': occasion,
                'skin_tone_used': skin_tone,
                'description': f'Recommended outfit for {occasion} based on {skin_tone} skin tone.',
                'total_items': len(outfit_items)
            }

        except Exception as e:
            print("ERROR:", str(e))
            return {
                "items": [],
                "error": str(e),
                "message": "Recommendation failed"
            }