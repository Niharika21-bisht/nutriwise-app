# NutriWise Nutrition Engine
# Calculates BMR, TDEE, BMI, and personalized daily macro targets

from .models import UserProfile, MacroTargets

def calculate_bmi(height_cm: float, weight_kg: float) -> tuple[float, str]:
    if height_cm <= 0:
        return (22.0, "Normal weight")
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)
    
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 24.9:
        category = "Normal weight"
    elif bmi < 29.9:
        category = "Overweight"
    else:
        category = "Obesity"
        
    return (bmi, category)

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str = "female") -> int:
    # Mifflin-St Jeor Equation
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    return int(round(bmr))

def get_activity_multiplier(user_type: str, sport: str | None = None) -> float:
    if user_type == "athlete":
        sport_multipliers = {
            "running": 1.75,
            "weightlifting": 1.65,
            "boxing": 1.80,
            "swimming": 1.75,
            "gymnastics": 1.60,
            "cricket": 1.55,
            "football": 1.75,
            "other": 1.60
        }
        sport_key = (sport or "").lower()
        return sport_multipliers.get(sport_key, 1.65)
    return 1.40  # General moderate active user

def calculate_macro_targets(profile: UserProfile) -> MacroTargets:
    bmi, bmi_category = calculate_bmi(profile.height_cm, profile.weight_kg)
    bmr = calculate_bmr(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
    multiplier = get_activity_multiplier(profile.user_type, profile.sport)
    tdee = int(round(bmr * multiplier))

    # Goal based adjustments
    goal = profile.goal.lower()
    target_cals = tdee
    protein_ratio = 0.25
    carb_ratio = 0.50
    fat_ratio = 0.25

    if "protein" in goal or profile.user_type == "athlete":
        protein_ratio = 0.30
        carb_ratio = 0.45
        fat_ratio = 0.25
        if profile.sport and profile.sport.lower() in ["weightlifting", "boxing"]:
            protein_ratio = 0.32
            carb_ratio = 0.43
            fat_ratio = 0.25
    elif "muscle" in goal:
        target_cals = int(tdee * 1.10)  # Slight surplus
        protein_ratio = 0.30
        carb_ratio = 0.48
        fat_ratio = 0.22
    elif "calorie" in goal or "weight" in goal:
        target_cals = max(1300, int(tdee * 0.85))  # Moderate deficit
        protein_ratio = 0.28
        carb_ratio = 0.44
        fat_ratio = 0.28
    elif "vitamins" in goal or "overall" in goal:
        protein_ratio = 0.24
        carb_ratio = 0.52
        fat_ratio = 0.24

    # Calculate grams: Protein 4 cal/g, Carbs 4 cal/g, Fat 9 cal/g
    target_protein_g = int(round((target_cals * protein_ratio) / 4))
    target_carbs_g = int(round((target_cals * carb_ratio) / 4))
    target_fat_g = int(round((target_cals * fat_ratio) / 9))

    # Water Target: 35ml per kg + athlete boost
    base_water = profile.weight_kg * 35
    if profile.user_type == "athlete" or "hydration" in goal:
        base_water += 600
    target_water_ml = int(round(base_water / 100) * 100)

    return MacroTargets(
        bmi=bmi,
        bmi_category=bmi_category,
        bmr=bmr,
        tdee=tdee,
        target_calories=target_cals,
        target_protein_g=target_protein_g,
        target_carbs_g=target_carbs_g,
        target_fat_g=target_fat_g,
        target_water_ml=target_water_ml,
        daily_score=78
    )
