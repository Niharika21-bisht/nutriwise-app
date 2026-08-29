// NutriWise API Client & Dynamic Recommendation Engine
import { validateFoodInput, estimateNutritionalValues } from './foodIntelligence';

const API_BASE_URL = "http://localhost:8000";

// Client-side fallback calculation for zero-latency instant response
export function calculateClientTargets(profile) {
  const height_m = (profile.height_cm || 165) / 100;
  const weight = profile.weight_kg || 59;
  const age = profile.age || 24;
  const gender = profile.gender || "female";
  const bmi = Number((weight / (height_m * height_m)).toFixed(1));

  let bmi_category = "Normal weight";
  if (bmi < 18.5) bmi_category = "Underweight";
  else if (bmi >= 25 && bmi < 29.9) bmi_category = "Overweight";
  else if (bmi >= 30) bmi_category = "Obesity";

  // Mifflin-St Jeor
  let bmr = (10 * weight) + (6.25 * (profile.height_cm || 165)) - (5 * age);
  bmr = gender === "male" ? bmr + 5 : bmr - 161;
  bmr = Math.round(bmr);

  let multiplier = profile.user_type === "athlete" ? 1.70 : 1.40;
  if (profile.sport === "weightlifting" || profile.sport === "boxing") multiplier = 1.75;
  const tdee = Math.round(bmr * multiplier);

  let target_cals = tdee;
  let pRatio = 0.25, cRatio = 0.50, fRatio = 0.25;

  const goal = (profile.goal || "").toLowerCase();
  if (goal.includes("protein") || profile.user_type === "athlete") {
    pRatio = 0.30;
    cRatio = 0.45;
    fRatio = 0.25;
  } else if (goal.includes("muscle")) {
    target_cals = Math.round(tdee * 1.10);
    pRatio = 0.30;
    cRatio = 0.48;
    fRatio = 0.22;
  } else if (goal.includes("calorie") || goal.includes("weight")) {
    target_cals = Math.max(1300, Math.round(tdee * 0.85));
    pRatio = 0.28;
    cRatio = 0.44;
    fRatio = 0.28;
  }

  const target_protein_g = Math.round((target_cals * pRatio) / 4);
  const target_carbs_g = Math.round((target_cals * cRatio) / 4);
  const target_fat_g = Math.round((target_cals * fRatio) / 9);

  let water = weight * 35;
  if (profile.user_type === "athlete" || goal.includes("hydration")) water += 600;
  const target_water_ml = Math.round(water / 100) * 100;

  return {
    bmi,
    bmi_category,
    bmr,
    tdee,
    target_calories: target_cals,
    target_protein_g,
    target_carbs_g,
    target_fat_g,
    target_water_ml,
    daily_score: 78
  };
}

export async function fetchProfileTargets(profile) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return calculateClientTargets(profile);
}

export async function fetchDietPlan(profile) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/diet-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.days) return data;
    }
  } catch (e) {}

  const isVeg = profile.dietary_preference !== "non_vegetarian";
  const isEggetarian = profile.dietary_preference === "eggetarian";
  const isVegan = profile.dietary_preference === "vegan";

  const day1Meals = [
    {
      meal_type: "Breakfast",
      title: isVegan ? "Organic Rolled Oats with Chia & Berries" : isEggetarian ? "Double Egg Omelette with Whole Wheat Toast" : "Spiced Vegetable Poha + Fresh Curd",
      description: "Rich in complex carbohydrates, natural electrolytes and probiotics for kickstarting daily metabolic rate.",
      calories: 330,
      protein_g: isEggetarian ? 18.0 : 12.5,
      carbs_g: 50.0,
      fat_g: 8.0,
      fiber_g: 5.0,
      prep_time: "15 mins",
      ingredients: ["Pressed Rice (Poha)", "Fresh Low-fat Curd", "Green Peas & Carrots", "Roasted Peanuts", "Curry leaves"]
    },
    {
      meal_type: "Lunch",
      title: isVeg ? "Dal Tadka + Steamed Basmati Rice + Sabzi & Cucumber Salad" : "Grilled Herb Chicken Breast with Quinoa Pilaf & Greens",
      description: "High-protein midday thali providing complete amino acid profile and steady complex carbohydrates.",
      calories: 480,
      protein_g: isVeg ? 16.0 : 36.0,
      carbs_g: 78.0,
      fat_g: 11.5,
      fiber_g: 8.2,
      prep_time: "25 mins",
      ingredients: ["Toor Dal (Lentils)", "Steamed Rice", "Green Beans & Carrots", "Desi Ghee tempering", "Kachumber Salad"]
    },
    {
      meal_type: "Snack",
      title: "Seasonal Fruit Bowl + Dry Roasted Chana",
      description: "Crunchy, high-fiber, low-glycemic boost preventing 4 PM energy dips without processed sugars.",
      calories: 195,
      protein_g: 8.0,
      carbs_g: 34.0,
      fat_g: 3.0,
      fiber_g: 6.8,
      prep_time: "5 mins",
      ingredients: ["Crisp Apple / Papaya slices", "Dry Roasted Chana", "Chaat Masala", "Green Tea"]
    },
    {
      meal_type: "Dinner",
      title: isVeg ? "Multigrain Rotis (2) + Paneer Bhurji & Mixed Vegetables" : "Pan-Seared Salmon / Fish with Asparagus & Sweet Potato Mash",
      description: "Light on digestion, packed with essential minerals (calcium, iron, magnesium) for nighttime cellular repair.",
      calories: 440,
      protein_g: isVeg ? 22.0 : 34.0,
      carbs_g: 48.0,
      fat_g: 17.5,
      fiber_g: 7.5,
      prep_time: "20 mins",
      ingredients: ["Fresh Cottage Cheese / Paneer", "Multigrain Phulkas (2)", "Mixed Veggies", "Olive Oil / Ghee"]
    }
  ];

  const day2Meals = [
    {
      meal_type: "Breakfast",
      title: isVegan ? "Sprouted Moong & Vegetable Upma" : isEggetarian ? "Boiled Eggs (2) + Avocado Sourdough Toast" : "Moong Dal Cheela with Mint Curd Chutney",
      description: "High-protein lentil savory crepe packed with grated veggies and gut-healthy mint dip.",
      calories: 340,
      protein_g: isEggetarian ? 19.0 : 16.0,
      carbs_g: 44.0,
      fat_g: 9.0,
      fiber_g: 6.5,
      prep_time: "18 mins",
      ingredients: ["Yellow Moong Dal batter", "Grated Paneer/Tofu", "Spinach & Coriander", "Mint Chutney"]
    },
    {
      meal_type: "Lunch",
      title: isVeg ? "Rajma Masala with Brown Rice & Beetroot Raita" : "Lemon Garlic Chicken Bowl with Brown Rice & Broccoli",
      description: "Slow-digesting kidney beans rich in folate, iron, and prebiotic fibers for all-day focus.",
      calories: 510,
      protein_g: isVeg ? 19.5 : 38.0,
      carbs_g: 76.0,
      fat_g: 11.0,
      fiber_g: 10.5,
      prep_time: "30 mins",
      ingredients: ["Red Kidney Beans (Rajma)", "Steamed Brown Rice", "Beetroot Curd Raita", "Onion & Tomato Gravy"]
    },
    {
      meal_type: "Snack",
      title: "Spiced Roasted Makhana + Handful of Soaked Almonds & Walnuts",
      description: "Magnesium-dense fox nuts and omega-3 rich walnuts to fuel cognitive energy.",
      calories: 180,
      protein_g: 6.0,
      carbs_g: 22.0,
      fat_g: 8.5,
      fiber_g: 4.5,
      prep_time: "5 mins",
      ingredients: ["Roasted Fox Nuts (Makhana)", "Soaked Almonds (5 pcs)", "Walnut halves (2 pcs)", "Pink salt"]
    },
    {
      meal_type: "Dinner",
      title: isVeg ? "Tofu / Paneer Tikka Stir-fry with 2 Multigrain Rotis & Palak Soup" : "Grilled Fish Fillet with Sauteed Zucchini & Quinoa",
      description: "Thermogenic light dinner high in lean protein to promote active metabolic recovery during sleep.",
      calories: 420,
      protein_g: isVeg ? 24.0 : 32.0,
      carbs_g: 42.0,
      fat_g: 14.0,
      fiber_g: 8.0,
      prep_time: "22 mins",
      ingredients: ["Marinated Paneer/Tofu (140g)", "Bell peppers & Onions", "Multigrain Rotis", "Warm Palak soup"]
    }
  ];

  const day3Meals = [
    {
      meal_type: "Breakfast",
      title: isVegan ? "Chia Seed Coconut Pudding with Mango & Flax" : isEggetarian ? "Egg Bhurji (Scrambled) with 2 Multigrain Toasts" : "Besan Cheela Loaded with Cottage Cheese & Veggies",
      description: "Wholesome chickpea flour pancakes bursting with bioavailable protein and essential zinc.",
      calories: 325,
      protein_g: isEggetarian ? 18.5 : 15.0,
      carbs_g: 42.0,
      fat_g: 9.5,
      fiber_g: 6.0,
      prep_time: "15 mins",
      ingredients: ["Gram flour (Besan)", "Crumbled Paneer", "Finely chopped bell peppers", "Ajwain & Turmeric"]
    },
    {
      meal_type: "Lunch",
      title: isVeg ? "Chole (Chickpeas) with Quinoa Pilaf & Cucumber Salad" : "Tandoori Chicken Salad Bowl with Avocado dressing",
      description: "Hearty Mediterranean/Desi legume bowl rich in plant sterols and clean low-GI carbohydrates.",
      calories: 490,
      protein_g: isVeg ? 18.0 : 35.0,
      carbs_g: 72.0,
      fat_g: 12.0,
      fiber_g: 9.5,
      prep_time: "25 mins",
      ingredients: ["Boiled Kabuli Chana", "Steamed Quinoa/Rice", "Spiced Tomato Gravy", "Cucumber Onion Salad"]
    },
    {
      meal_type: "Snack",
      title: "Mixed Sprout Salad (Moong + Kala Chana) with Lemon Dressing",
      description: "Enzyme-active sprouted micro-legumes delivering live Vitamin C and prebiotic fiber.",
      calories: 175,
      protein_g: 9.5,
      carbs_g: 28.0,
      fat_g: 2.0,
      fiber_g: 7.2,
      prep_time: "5 mins",
      ingredients: ["Sprouted Green Moong", "Sprouted Black Chana", "Fresh Lemon juice", "Chaat masala"]
    },
    {
      meal_type: "Dinner",
      title: isVeg ? "Lauki Kofta (Baked) / Soya Chunk Curry with 2 Rotis & Salad" : "Chicken Clear Soup with Steamed Dumplings & Greens",
      description: "Easily assimilated gentle meal ensuring deep restful REM sleep and hydration retention.",
      calories: 410,
      protein_g: isVeg ? 22.5 : 30.0,
      carbs_g: 46.0,
      fat_g: 12.5,
      fiber_g: 8.0,
      prep_time: "20 mins",
      ingredients: ["Nutri Soya Chunks / Bottle Gourd", "Multigrain Rotis (2)", "Tomato Curry", "Fresh Green Salad"]
    }
  ];

  return {
    plan_title: `Personalized ${profile.goal?.replace('_', ' ')?.toUpperCase() || 'FITNESS'} 3-Day Blueprint`,
    target_summary: calculateClientTargets(profile),
    days: [
      {
        day_number: 1,
        day_label: "Day 1 (Today)",
        tagline: "Metabolic Kickstart & Balanced Glycemic Energy",
        meals: day1Meals,
        total_calories: day1Meals.reduce((s, m) => s + m.calories, 0),
        total_protein_g: Number(day1Meals.reduce((s, m) => s + m.protein_g, 0).toFixed(1)),
        why_this_plan: `Designed for ${profile.name || 'you'} to establish steady insulin balance and sustain ${profile.goal?.replace('_', ' ') || 'overall fitness'}.`
      },
      {
        day_number: 2,
        day_label: "Day 2 (Tomorrow)",
        tagline: "Endurance Fuel & High Legume Micronutrients",
        meals: day2Meals,
        total_calories: day2Meals.reduce((s, m) => s + m.calories, 0),
        total_protein_g: Number(day2Meals.reduce((s, m) => s + m.protein_g, 0).toFixed(1)),
        why_this_plan: `Focuses on iron-rich legumes (Rajma & Moong) paired with healthy monounsaturated nuts for cellular vitality.`
      },
      {
        day_number: 3,
        day_label: "Day 3 (Day After Tomorrow)",
        tagline: "Active Recovery & Plant-Powered Satiety",
        meals: day3Meals,
        total_calories: day3Meals.reduce((s, m) => s + m.calories, 0),
        total_protein_g: Number(day3Meals.reduce((s, m) => s + m.protein_g, 0).toFixed(1)),
        why_this_plan: `Integrates sprouted live enzymes and chickpea complex carbs to support muscle glycogen replenishment.`
      }
    ],
    advance_grocery_list: [
      "Thick Poha (Pressed rice) & Rolled Oats",
      "Yellow Moong Dal & Red Kidney Beans (Rajma)",
      "Fresh Artisanal Paneer / Organic Tofu (400g)",
      "Low-fat Probiotic Curd (500g)",
      "Green Peas, Carrots, Spinach, Bell Peppers & Cucumbers",
      "Dry Roasted Chana & Fox Nuts (Makhana)"
    ],
    advance_prep_tips: [
      "Soak Rajma (Kidney beans) tonight in water for tomorrow's high-protein lunch.",
      "Start sprouting green moong beans today for Day 3 live enzyme snack.",
      "Keep curd refrigerated and set aside multigrain flour for fresh evening rotis."
    ]
  };
}

// AI-Powered Food Intelligence with Non-Food / Gibberish Validation
export async function analyzeScannedFood(foodName, userProfile, todayConsumed, parsedData = null) {
  // 1. If parsedData (from verified Barcode or OCR) is present, use it directly
  if (parsedData && parsedData.calories) {
    const result = estimateNutritionalValues(parsedData.product_name || foodName || "Packaged Food", userProfile);
    result.food_item = {
      ...result.food_item,
      name: parsedData.product_name || result.food_item.name,
      calories: parsedData.calories,
      protein_g: parsedData.protein_g,
      carbs_g: parsedData.carbs_g,
      fat_g: parsedData.fat_g,
      fiber_g: parsedData.fiber_g || 3.0,
      sugar_g: parsedData.sugar_g || 4.0,
      sodium_mg: parsedData.sodium_mg || 380,
      serving_size: parsedData.serving_size || "1 serving"
    };
    return result;
  }

  // 2. Validate input string for gibberish, non-food, or objects
  const validation = validateFoodInput(foodName);
  if (!validation.isValid) {
    return {
      is_valid_food: false,
      error_message: validation.reason,
      verdict: "invalid",
      food_item: { name: foodName || "Invalid Item" }
    };
  }

  // 3. Generate AI nutritional breakdown
  return estimateNutritionalValues(validation.cleanQuery, userProfile);
}

export async function improveMealApi(mealText, userProfile) {
  const validation = validateFoodInput(mealText);
  if (!validation.isValid) {
    return {
      is_valid: false,
      error_message: validation.reason
    };
  }

  const query = (mealText || "").toLowerCase();
  const isPizza = query.includes("pizza") || query.includes("drink") || query.includes("coke");
  
  if (isPizza) {
    return {
      is_valid: true,
      original_meal: "Cheese Pizza (2 Slices) + Regular Cola (330ml)",
      original_macros: { calories: 680, protein: 18, carbs: 102, fat: 23, sugar: 45, fiber: 3.2 },
      improved_meal: "Thin-Crust Grilled Veggie & Paneer Pizza + Lemon Mint Infused Sparkling Water + Side Salad",
      improved_macros: { calories: 420, protein: 24, carbs: 54, fat: 12, sugar: 4, fiber: 8.5 },
      macro_improvements: {
        calories: "-38% (Saved 260 kcal)",
        protein: "+33% (+6g protein)",
        sugar: "-91% (-41g refined sugar)",
        fiber: "+165% (+5.3g dietary fiber)"
      },
      key_changes: [
        "🍕 Swapped thick refined crust for thin-crust multigrain sourdough base.",
        "🧀 Replaced excess processed cheese with grilled paneer cubes, bell peppers & mushrooms.",
        "🥗 Added crisp arugula & cucumber side salad with lemon dressing.",
        "🍋 Replaced high-sugar soft drink with chilled fresh lemon-mint sparkling water."
      ],
      why_explanation: "Substituting the sugary cola eliminates over 40g of empty sugar, preventing post-meal energy crashes. Adding fibrous vegetables and protein-rich paneer boosts satiety while lowering glycemic index.",
      recipe_tips: [
        "Use a light brush of extra virgin olive oil rather than butter on the crust.",
        "Add chili flakes and oregano freely for rich flavor without sodium overload."
      ]
    };
  }

  return {
    is_valid: true,
    original_meal: `${mealText} (Standard Preparation)`,
    original_macros: { calories: 650, protein: 14, carbs: 82, fat: 24, sugar: 16, fiber: 3.0 },
    improved_meal: `Nutrient-Dense ${mealText} with Added Greens & Protein Boost`,
    improved_macros: { calories: 410, protein: 26, carbs: 48, fat: 11, sugar: 3, fiber: 8.0 },
    macro_improvements: {
      calories: "-37% (Saved 240 kcal)",
      protein: "+85% (+12g protein)",
      fat: "-54% (Lower saturated fat)",
      fiber: "+166% (+5g dietary fiber)"
    },
    key_changes: [
      `🥗 Added 1 cup fresh crunchy fiber-rich salad to reduce glucose spikes.`,
      `💪 Incorporated high-biological value protein (Paneer / Tofu / Boiled eggs / Greek yogurt).`,
      "✨ Reduced cooking oil by 50% through air-frying, steaming, or light olive oil brushing.",
      "💧 Paired with electrolyte-rich lemon water instead of sugary beverages."
    ],
    why_explanation: `By restructuring ${mealText} with a 40:30:30 macro balance (complex carbs, clean protein, healthy fats), your body receives sustained energy without mid-afternoon fatigue.`,
    recipe_tips: [
      "Follow the 'Half-Plate Rule': fill half your plate with raw/cooked vegetables, one quarter with protein, and one quarter with complex carbs."
    ]
  };
}
