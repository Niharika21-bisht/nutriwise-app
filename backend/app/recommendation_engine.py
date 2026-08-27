# NutriWise Recommendation Engine
from typing import Dict, Any, Optional
from .models import UserProfile, FoodItem, RecommendationResponse
from .nutrition_engine import calculate_macro_targets
from .food_database import FOOD_DATABASE

def analyze_and_recommend(
    food_name_or_key: str,
    user_profile: Optional[UserProfile] = None,
    today_consumed: Optional[Dict[str, float]] = None
) -> RecommendationResponse:
    profile = user_profile or UserProfile()
    targets = calculate_macro_targets(profile)
    today = today_consumed or {"calories": 950.0, "protein_g": 38.0, "carbs_g": 110.0, "fat_g": 26.0}

    # Normalize lookup key
    key = food_name_or_key.strip().lower()
    matched_data = None
    for db_key, data in FOOD_DATABASE.items():
        if db_key in key or key in db_key or data["name"].lower() in key:
            matched_data = data
            break
    
    if not matched_data:
        # Default synthesized analysis if custom name
        matched_data = {
            "name": food_name_or_key.title(),
            "category": "Custom Meal Item",
            "serving_size": "1 standard portion (250g)",
            "calories": 420,
            "protein_g": 14.0,
            "carbs_g": 52.0,
            "fat_g": 16.0,
            "fiber_g": 4.0,
            "sugar_g": 6.0,
            "sodium_mg": 450.0,
            "vitamins": ["B-Vitamins", "Minerals"],
            "allergens": []
        }

    food_item = FoodItem(
        name=matched_data["name"],
        category=matched_data.get("category", "General Food"),
        serving_size=matched_data["serving_size"],
        calories=matched_data["calories"],
        protein_g=matched_data["protein_g"],
        carbs_g=matched_data["carbs_g"],
        fat_g=matched_data["fat_g"],
        fiber_g=matched_data.get("fiber_g", 0.0),
        sugar_g=matched_data.get("sugar_g", 0.0),
        sodium_mg=matched_data.get("sodium_mg", 0.0),
        vitamins=matched_data.get("vitamins", []),
        allergens=matched_data.get("allergens", [])
    )

    # Scoring Algorithm
    remaining_cals = max(0, targets.target_calories - today.get("calories", 0))
    remaining_protein = max(0, targets.target_protein_g - today.get("protein_g", 0))
    
    score = 7.5
    verdict = "good_fit"
    badge_label = "Good Choice"
    suggestions = []
    health_highlights = []

    # Check allergens
    user_allergies = [a.lower() for a in profile.allergies]
    food_allergens = [a.lower() for a in food_item.allergens]
    allergy_overlap = set(user_allergies).intersection(set(food_allergens))
    if allergy_overlap:
        score -= 4.0
        suggestions.append(f"⚠️ Allergy Warning: Contains {', '.join(allergy_overlap).title()} which is in your restriction list.")

    # Goal & Macro fit
    goal = profile.goal.lower()
    is_athlete = profile.user_type.lower() == "athlete"

    # Protein scoring
    if "protein" in goal or is_athlete:
        if food_item.protein_g >= 18.0:
            score += 1.8
            health_highlights.append(f"High Protein ({food_item.protein_g}g) supports muscle recovery and satiety.")
        elif food_item.protein_g < 8.0 and food_item.calories > 300:
            score -= 1.5
            suggestions.append("Low protein density for this calorie load. Pair with curd, paneer, tofu, or boiled egg.")
    
    # Sugar & empty calories scoring
    if food_item.sugar_g > 20.0:
        score -= 2.5
        suggestions.append(f"High simple sugar content ({food_item.sugar_g}g). May cause rapid blood glucose spike.")
    
    # Sodium check
    if food_item.sodium_mg > 800.0:
        score -= 1.5
        suggestions.append("High sodium level. Be mindful if managing blood pressure or water retention.")

    # Fiber bonus
    if food_item.fiber_g >= 5.0:
        score += 1.0
        health_highlights.append(f"Excellent dietary fiber ({food_item.fiber_g}g) for digestive health.")

    # Bound score
    score = max(1.0, min(9.8, round(score, 1)))

    if score >= 7.8:
        verdict = "good_fit"
        badge_label = "Good Choice"
        rationale = f"This meal fits nicely into your daily {profile.goal.replace('_', ' ')} target. It provides balanced sustained energy."
    elif score >= 5.5:
        verdict = "modify"
        badge_label = "Can Fit with Modification"
        rationale = "Nutritionally acceptable, but can be improved with a high-protein or fresh fiber side to align closer with your targets."
    else:
        verdict = "not_ideal"
        badge_label = "Not Ideal for Current Goal"
        rationale = "High in refined carbs/sugars or low in essential micronutrients. Better enjoyed occasionally or with mindful portion control."

    if not suggestions:
        suggestions.append("Suitable as part of your scheduled meals. Keep hydrated with a glass of water.")

    macro_summary = {
        "protein_status": "Optimal" if food_item.protein_g >= 15 else "Moderate" if food_item.protein_g >= 8 else "Low",
        "carb_status": "High Carb" if food_item.carbs_g > 55 else "Balanced" if food_item.carbs_g >= 25 else "Low Carb",
        "fat_status": "Rich" if food_item.fat_g > 18 else "Moderate" if food_item.fat_g >= 6 else "Lean",
        "calorie_impact": f"{int((food_item.calories / max(1, targets.target_calories)) * 100)}% of daily allowance"
    }

    return RecommendationResponse(
        food_item=food_item,
        verdict=verdict,
        score=score,
        badge_label=badge_label,
        macro_fit_summary=macro_summary,
        rationale=rationale,
        suggestions=suggestions,
        health_highlights=health_highlights
    )
