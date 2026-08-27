from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    name: str = "Niharika"
    email: str = "niharika@example.com"
    age: int = 24
    gender: str = "female"
    user_type: str = "general"  # "general" | "athlete"
    sport: Optional[str] = None  # "Running", "Weightlifting", "Boxing", "Swimming", "Cricket", "Football", "Other"
    goal: str = "overall_fitness"  # "overall_fitness", "calorie_awareness", "protein_focused", "hydration", "vitamins_minerals", "muscle_strength", "weight_management"
    custom_goal: Optional[str] = None
    meal_frequency: str = "3_meals"  # "2_meals", "3_meals", "3_meals_snacks", "other"
    height_cm: float = 165.0
    weight_kg: float = 59.0
    dietary_preference: str = "vegetarian"  # "vegetarian", "non_vegetarian", "vegan", "eggetarian"
    allergies: List[str] = Field(default_factory=list)  # ["dairy", "nuts", "gluten", "none"]

class MacroTargets(BaseModel):
    bmi: float
    bmi_category: str
    bmr: int
    tdee: int
    target_calories: int
    target_protein_g: int
    target_carbs_g: int
    target_fat_g: int
    target_water_ml: int
    daily_score: int = 78

class FoodItem(BaseModel):
    name: str
    category: str
    serving_size: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    vitamins: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)

class ScanRequest(BaseModel):
    scan_type: str  # "meal", "label", "food"
    food_name: Optional[str] = None
    image_base64: Optional[str] = None
    user_profile: Optional[UserProfile] = None
    today_consumed: Optional[Dict[str, float]] = None

class RecommendationResponse(BaseModel):
    food_item: FoodItem
    verdict: str  # "good_fit" | "modify" | "not_ideal"
    score: float  # 0.0 to 10.0
    badge_label: str  # "Good Choice", "Can Fit with Modification", "Not Ideal for Goal"
    macro_fit_summary: Dict[str, str]
    rationale: str
    suggestions: List[str]
    health_highlights: List[str]

class MealUpgradeRequest(BaseModel):
    meal_text: str
    user_profile: Optional[UserProfile] = None

class MealUpgradeResponse(BaseModel):
    original_meal: str
    original_macros: Dict[str, Any]
    improved_meal: str
    improved_macros: Dict[str, Any]
    macro_improvements: Dict[str, str]
    key_changes: List[str]
    why_explanation: str
    recipe_tips: List[str]

class MealPlanItem(BaseModel):
    meal_type: str  # "Breakfast", "Lunch", "Snack", "Dinner"
    title: str
    description: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    prep_time: str
    ingredients: List[str]

class DietPlanResponse(BaseModel):
    plan_title: str
    target_summary: Dict[str, Any]
    meals: List[MealPlanItem]
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    why_this_plan: str
    lifestyle_tips: List[str]
