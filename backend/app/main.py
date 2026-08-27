# NutriWise FastAPI Backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from .models import (
    UserProfile,
    MacroTargets,
    ScanRequest,
    RecommendationResponse,
    MealUpgradeRequest,
    MealUpgradeResponse,
    DietPlanResponse
)
from .nutrition_engine import calculate_macro_targets
from .diet_engine import generate_diet_plan
from .recommendation_engine import analyze_and_recommend
from .meal_improver import improve_meal
from .food_database import FOOD_DATABASE

app = FastAPI(
    title="NutriWise API",
    description="Smart Nutrition, Diet Personalization, and Food Recommendation Engine",
    version="1.0.0"
)

# CORS setup for local and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": "NutriWise API",
        "status": "online",
        "version": "1.0.0",
        "tagline": "Eat better. Understand better. Live healthier."
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "nutriwise-backend"}

@app.post("/api/profile/calculate", response_model=MacroTargets)
def calculate_targets_endpoint(profile: UserProfile):
    """Calculates BMI, BMR, TDEE and personalized daily macro targets."""
    return calculate_macro_targets(profile)

@app.post("/api/diet-plan", response_model=DietPlanResponse)
def get_diet_plan_endpoint(profile: UserProfile):
    """Generates rule-based dynamic diet schedule tailored to user profile."""
    return generate_diet_plan(profile)

@app.post("/api/scan-food", response_model=RecommendationResponse)
def scan_food_endpoint(request: ScanRequest):
    """Analyzes meal/plate/label, scores fit against daily targets, and provides recommendations."""
    food_name = request.food_name or "paneer sandwich"
    return analyze_and_recommend(
        food_name_or_key=food_name,
        user_profile=request.user_profile,
        today_consumed=request.today_consumed
    )

@app.post("/api/make-meal-better", response_model=MealUpgradeResponse)
def make_meal_better_endpoint(request: MealUpgradeRequest):
    """Transforms a user meal into an optimized, nutrient-rich version with macro differences and 'Why?' explanation."""
    if not request.meal_text.strip():
        raise HTTPException(status_code=400, detail="Meal text cannot be empty.")
    return improve_meal(request.meal_text, request.user_profile)

@app.get("/api/sample-foods")
def get_sample_foods():
    """Returns catalog of sample foods for quick demo testing in the scanner."""
    return list(FOOD_DATABASE.values())
