# NutriWise Dynamic Diet Plan Engine
from typing import List, Dict, Any
from .models import UserProfile, MealPlanItem, DietPlanResponse
from .nutrition_engine import calculate_macro_targets

def generate_diet_plan(profile: UserProfile) -> DietPlanResponse:
    targets = calculate_macro_targets(profile)
    diet = profile.dietary_preference.lower()
    freq = profile.meal_frequency.lower()
    goal = profile.goal.lower()
    is_athlete = profile.user_type.lower() == "athlete"
    allergies = [a.lower() for a in profile.allergies]

    meals: List[MealPlanItem] = []

    # 1. Breakfast options based on diet & allergies
    if diet in ["vegetarian", "eggetarian"]:
        if "dairy" in allergies:
            bf_title = "Sprouted Moong & Vegetable Poha"
            bf_desc = "Steamed flattened rice tossed with sprouted mung beans, mustard seeds, curry leaves, peanuts & fresh lemon."
            bf_cals, bf_p, bf_c, bf_f, bf_fib = 310, 12.0, 48.0, 7.5, 6.0
            bf_ing = ["Thick Poha (Flattened rice)", "Sprouted green moong", "Mustard seeds & Curry leaves", "Lemon juice", "Coriander"]
        elif diet == "eggetarian":
            bf_title = "Masala Egg Omelette with Whole Wheat Toast"
            bf_desc = "2-egg fluffy omelette packed with onions, tomatoes & green chillies served with toasted whole grain bread."
            bf_cals, bf_p, bf_c, bf_f, bf_fib = 340, 18.0, 32.0, 12.5, 4.0
            bf_ing = ["2 Whole Eggs", "Whole Wheat Toast", "Finely chopped Onion & Tomato", "Olive Oil / Ghee", "Black pepper"]
        else:
            bf_title = "Vegetable Poha + Fresh Curd"
            bf_desc = "Lightly spiced flattened rice with turmeric, carrots, green peas, served with a bowl of probiotic-rich homemade curd."
            bf_cals, bf_p, bf_c, bf_f, bf_fib = 330, 12.5, 50.0, 8.0, 5.0
            bf_ing = ["Pressed Rice (Poha)", "Fresh Low-fat Curd", "Green Peas & Carrots", "Roasted Peanuts", "Turmeric & Mustard seeds"]
    elif diet == "vegan":
        bf_title = "Rolled Oats Bowl with Chia, Almond Milk & Berries"
        bf_desc = "Slow-cooked organic oats topped with chia seeds, crushed almonds, fresh berries and cinnamon."
        bf_cals, bf_p, bf_c, bf_f, bf_fib = 320, 11.5, 52.0, 7.5, 9.0
        bf_ing = ["Rolled Oats", "Unsweetened Almond Milk", "Chia Seeds", "Blueberries & Pomegranate", "Cinnamon"]
    else: # non-vegetarian
        bf_title = "Herb Scrambled Eggs with Avocado Sourdough Toast"
        bf_desc = "Scrambled organic eggs topped with cracked pepper and fresh chives, alongside mashed avocado on sourdough."
        bf_cals, bf_p, bf_c, bf_f, bf_fib = 360, 20.0, 28.0, 14.0, 5.5
        bf_ing = ["2 Whole Eggs + 1 Egg White", "Sourdough Toast", "Hass Avocado", "Baby Spinach", "Extra Virgin Olive Oil"]

    meals.append(MealPlanItem(
        meal_type="Breakfast",
        title=bf_title,
        description=bf_desc,
        calories=bf_cals,
        protein_g=bf_p,
        carbs_g=bf_c,
        fat_g=bf_f,
        fiber_g=bf_fib,
        prep_time="15 mins",
        ingredients=bf_ing
    ))

    # 2. Lunch options
    if diet in ["vegetarian", "eggetarian", "vegan"]:
        if "gluten" in allergies:
            lunch_title = "Yellow Moong Dal with Brown Rice & Stir-Fried Bhindi"
            lunch_desc = "Tempered yellow lentil soup with cumin and garlic, paired with nutty brown rice and crunchy okra stir-fry."
            lunch_cals, lunch_p, lunch_c, lunch_f, lunch_fib = 470, 17.5, 76.0, 10.0, 8.5
            lunch_ing = ["Yellow Moong Dal", "Brown Basmati Rice", "Fresh Okra (Bhindi)", "Cumin & Garlic Tadka", "Tomato Salad"]
        elif is_athlete or "protein" in goal:
            lunch_title = "Dal Tadka, Steamed Rice, Soya Chunk Curry & Cucumber Salad"
            lunch_desc = "Protein-fortified high-energy lunch featuring yellow dal, steamed basmati rice, soya chunks gravy, and cucumber raita."
            lunch_cals, lunch_p, lunch_c, lunch_f, lunch_fib = 520, 28.0, 74.0, 11.0, 9.0
            lunch_ing = ["Arhar/Toor Dal", "Steamed Basmati Rice", "Nutri Soya Chunks", "Cucumber & Mint Raita", "Mixed Green Salad"]
        else:
            lunch_title = "Dal Tadka + Steamed Rice + Seasonal Green Sabzi"
            lunch_desc = "Classic comforting thali with protein-rich toor dal, fragrant steamed rice, and sautéed beans-carrot sabzi."
            lunch_cals, lunch_p, lunch_c, lunch_f, lunch_fib = 480, 16.0, 78.0, 11.5, 8.2
            lunch_ing = ["Toor Dal (Lentils)", "Steamed Rice", "Green Beans & Carrots", "Desi Ghee tempering", "Kachumber Salad"]
    else: # non-vegetarian
        lunch_title = "Grilled Herb Chicken Breast with Quinoa Pilaf & Steamed Broccoli"
        lunch_desc = "Tender marinated chicken breast served over fluffy seasoned quinoa and lemon-buttered steamed broccoli."
        lunch_cals, lunch_p, lunch_c, lunch_f, lunch_fib = 510, 36.0, 52.0, 12.0, 7.0
        lunch_ing = ["Lean Chicken Breast (180g)", "Quinoa Pilaf", "Steamed Broccoli florets", "Garlic Herb marinade", "Lemon slice"]

    meals.append(MealPlanItem(
        meal_type="Lunch",
        title=lunch_title,
        description=lunch_desc,
        calories=lunch_cals,
        protein_g=lunch_p,
        carbs_g=lunch_c,
        fat_g=lunch_f,
        fiber_g=lunch_fib,
        prep_time="25 mins",
        ingredients=lunch_ing
    ))

    # 3. Snacks (if 3_meals_snacks or athlete)
    if "snack" in freq or is_athlete:
        snack_title = "Seasonal Fruit Bowl + Roasted Spiced Chana"
        snack_desc = "Freshly sliced apple/papaya with a handful of crunchy dry-roasted chickpeas for sustained afternoon energy and fiber."
        snack_cals, snack_p, snack_c, snack_f, snack_fib = 200, 8.5, 34.0, 3.2, 7.0
        snack_ing = ["Crisp Apple / Papaya slices", "Dry Roasted Chana (Chickpeas)", "Chaat Masala sprinkle", "Green Tea"]
        
        meals.append(MealPlanItem(
            meal_type="Snack",
            title=snack_title,
            description=snack_desc,
            calories=snack_cals,
            protein_g=snack_p,
            carbs_g=snack_c,
            fat_g=snack_f,
            fiber_g=snack_fib,
            prep_time="5 mins",
            ingredients=snack_ing
        ))

    # 4. Dinner
    if diet in ["vegetarian", "eggetarian"]:
        if "dairy" in allergies or diet == "vegan":
            din_title = "Tofu Stir-fry with Multigrain Rotis & Spinach Dal"
            din_desc = "Firm tofu cubes pan-seared with bell peppers, served alongside two high-fiber rotis and nourishing palak dal."
            din_cals, din_p, din_c, din_f, din_fib = 430, 21.0, 52.0, 14.0, 8.0
            din_ing = ["Organic Firm Tofu (150g)", "Multigrain Rotis (2 pcs)", "Spinach Palak Dal", "Bell Peppers & Onion"]
        else:
            din_title = "Multigrain Roti with Paneer Bhurji & Mixed Vegetables"
            din_desc = "Fresh artisanal paneer crumbled with onions, tomatoes and fragrant spices, accompanied by 2 whole wheat rotis and salad."
            din_cals, din_p, din_c, din_f, din_fib = 450, 23.5, 48.0, 17.0, 7.5
            din_ing = ["Fresh Cottage Cheese / Paneer (120g)", "Multigrain Phulkas (2 pcs)", "Mixed Veggies (Capsicum, Tomato)", "Olive oil / Ghee (1 tsp)"]
    elif diet == "vegan":
        din_title = "Chickpea Mediterranean Bowl with Tahini Drizzle"
        din_desc = "Warm spiced chickpeas, roasted pumpkin cubes, cucumber, kalamata olives, and leafy greens with garlic tahini."
        din_cals, din_p, din_c, din_f, din_fib = 440, 18.0, 56.0, 15.0, 11.0
        din_ing = ["Boiled Chickpeas (Kabuli Chana)", "Roasted Butternut Squash", "Baby Spinach & Cucumber", "Sesame Tahini dressing"]
    else: # non-vegetarian
        din_title = "Pan-seared Salmon / White Fish with Sauteed Asparagus & Mash"
        din_desc = "Omega-3 rich fish fillet pan-seared in lemon dill butter, accompanied by garlic asparagus and sweet potato mash."
        din_cals, din_p, din_c, din_f, din_fib = 470, 34.0, 36.0, 18.0, 6.0
        din_ing = ["Fresh Salmon / Fish Fillet (160g)", "Sauteed Green Asparagus", "Sweet Potato Mash", "Lemon & Dill"]

    meals.append(MealPlanItem(
        meal_type="Dinner",
        title=din_title,
        description=din_desc,
        calories=din_cals,
        protein_g=din_p,
        carbs_g=din_c,
        fat_g=din_f,
        fiber_g=din_fib,
        prep_time="20 mins",
        ingredients=din_ing
    ))

    # Calculate totals
    total_cals = sum(m.calories for m in meals)
    total_p = round(sum(m.protein_g for m in meals), 1)
    total_c = round(sum(m.carbs_g for m in meals), 1)
    total_f = round(sum(m.fat_g for m in meals), 1)

    # Generate "Why this plan?"
    persona_label = f"as a {profile.sport} athlete" if is_athlete and profile.sport else "for daily peak energy and vitality"
    why_explanation = (
        f"Designed specifically for {profile.name} ({profile.dietary_preference.replace('_', ' ').capitalize()}) "
        f"to support your {profile.goal.replace('_', ' ')} goal {persona_label}. "
        f"Macro distribution balances complex carbohydrates for steady glycogen stores, "
        f"adequate high-biological value protein ({total_p}g) for muscle tissue repair and satiety, "
        f"and healthy micronutrient-dense fats for hormonal health."
    )

    lifestyle_tips = [
        f"Drink at least {targets.target_water_ml / 1000:.1f} Liters of water evenly across the day.",
        "Keep at least 2.5 hours gap between your dinner and bedtime for optimal digestion.",
        "Include a raw colorful salad before major meals to enhance enzyme activity and control glucose spikes."
    ]

    return DietPlanResponse(
        plan_title=f"Personalized {profile.goal.replace('_', ' ').title()} Blueprint",
        target_summary={
            "target_calories": targets.target_calories,
            "target_protein_g": targets.target_protein_g,
            "target_carbs_g": targets.target_carbs_g,
            "target_fat_g": targets.target_fat_g,
            "bmi": targets.bmi,
            "bmi_category": targets.bmi_category
        },
        meals=meals,
        total_calories=total_cals,
        total_protein_g=total_p,
        total_carbs_g=total_c,
        total_fat_g=total_f,
        why_this_plan=why_explanation,
        lifestyle_tips=lifestyle_tips
    )
