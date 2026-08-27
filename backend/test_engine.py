# Backend unit tests for NutriWise
from app.models import UserProfile
from app.nutrition_engine import calculate_bmi, calculate_bmr, calculate_macro_targets
from app.diet_engine import generate_diet_plan
from app.recommendation_engine import analyze_and_recommend
from app.meal_improver import improve_meal

def test_bmi_and_targets():
    profile = UserProfile(
        name="Niharika",
        age=24,
        height_cm=165.0,
        weight_kg=59.0,
        user_type="general",
        goal="overall_fitness"
    )
    bmi, category = calculate_bmi(profile.height_cm, profile.weight_kg)
    assert round(bmi, 1) == 21.7
    assert category == "Normal weight"

    targets = calculate_macro_targets(profile)
    assert targets.target_calories > 1500
    assert targets.target_protein_g > 60
    assert targets.target_water_ml >= 2000
    print("[PASS] test_bmi_and_targets passed!")

def test_diet_generation():
    profile = UserProfile(
        name="Niharika",
        user_type="athlete",
        sport="Running",
        goal="protein_focused",
        dietary_preference="vegetarian",
        meal_frequency="3_meals_snacks"
    )
    plan = generate_diet_plan(profile)
    assert len(plan.meals) == 4  # Breakfast, Lunch, Snack, Dinner
    assert plan.total_protein_g > 50
    assert "Runner" in plan.why_this_plan or "running" in plan.why_this_plan.lower()
    print("[PASS] test_diet_generation passed!")

def test_recommendation_engine():
    profile = UserProfile(goal="protein_focused")
    # Paneer sandwich scan
    res = analyze_and_recommend("paneer sandwich", profile)
    assert res.score >= 7.0
    assert res.verdict in ["good_fit", "modify"]
    assert res.food_item.protein_g >= 15.0
    print("[PASS] test_recommendation_engine passed!")

def test_meal_improver():
    res = improve_meal("pizza + cold drink")
    assert "Thin-Crust" in res.improved_meal or "Salad" in res.improved_meal
    assert "-38%" in res.macro_improvements["calories"] or "Saved" in res.macro_improvements["calories"]
    assert len(res.key_changes) >= 3
    print("[PASS] test_meal_improver passed!")

if __name__ == "__main__":
    test_bmi_and_targets()
    test_diet_generation()
    test_recommendation_engine()
    test_meal_improver()
    print("All backend tests completed successfully!")
