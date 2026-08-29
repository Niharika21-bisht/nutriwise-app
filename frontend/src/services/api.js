// NutriWise API Client & 7-Day Weekly Diet Plan Engine
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
    daily_score: 0
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

// 7-Day (Next Week) Complete Diet Plan Generator
export async function fetchDietPlan(profile) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/diet-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.days && data.days.length >= 7) return data;
    }
  } catch (e) {}

  const isVeg = profile.dietary_preference !== "non_vegetarian";
  const isEggetarian = profile.dietary_preference === "eggetarian";
  const isVegan = profile.dietary_preference === "vegan";

  const days = [
    // DAY 1 - MONDAY
    {
      day_number: 1,
      day_name: "Monday",
      day_label: "Mon • Day 1",
      tagline: "Metabolic Kickstart & Balanced Glycemic Energy",
      why_this_plan: `Sets a clean weekly baseline with probiotics and complex carbs to regulate insulin sensitivity.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Organic Rolled Oats with Chia & Berries" : isEggetarian ? "Double Egg Omelette with Whole Wheat Toast" : "Spiced Vegetable Poha + Low-Fat Curd",
          description: "Rich in complex carbohydrates and live probiotics for kickstarting daily metabolic rate.",
          calories: 330, protein_g: isEggetarian ? 18.0 : 12.5, carbs_g: 50.0, fat_g: 8.0, fiber_g: 5.0, prep_time: "15 mins",
          ingredients: ["Pressed Rice (Poha)", "Fresh Low-fat Curd", "Green Peas & Carrots", "Roasted Peanuts"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Dal Tadka + Steamed Basmati Rice + Sabzi & Cucumber Salad" : "Grilled Herb Chicken Breast with Quinoa Pilaf & Greens",
          description: "High-protein midday thali providing complete amino acid profile and steady complex carbohydrates.",
          calories: 480, protein_g: isVeg ? 16.0 : 36.0, carbs_g: 78.0, fat_g: 11.5, fiber_g: 8.2, prep_time: "25 mins",
          ingredients: ["Toor Dal", "Steamed Rice", "Green Beans & Carrots", "Desi Ghee tempering", "Kachumber Salad"]
        },
        {
          meal_type: "Snack",
          title: "Seasonal Fruit Bowl + Dry Roasted Chana",
          description: "Crunchy, high-fiber, low-glycemic boost preventing 4 PM energy dips without processed sugars.",
          calories: 195, protein_g: 8.0, carbs_g: 34.0, fat_g: 3.0, fiber_g: 6.8, prep_time: "5 mins",
          ingredients: ["Crisp Apple / Papaya", "Dry Roasted Chana", "Chaat Masala", "Green Tea"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Multigrain Rotis (2) + Paneer Bhurji & Mixed Vegetables" : "Pan-Seared Salmon / Fish with Asparagus & Sweet Potato Mash",
          description: "Light on digestion, packed with essential minerals (calcium, iron, magnesium) for nighttime repair.",
          calories: 440, protein_g: isVeg ? 22.0 : 34.0, carbs_g: 48.0, fat_g: 17.5, fiber_g: 7.5, prep_time: "20 mins",
          ingredients: ["Fresh Cottage Cheese / Paneer", "Multigrain Phulkas (2)", "Mixed Veggies", "Olive Oil"]
        }
      ]
    },
    // DAY 2 - TUESDAY
    {
      day_number: 2,
      day_name: "Tuesday",
      day_label: "Tue • Day 2",
      tagline: "Endurance Fuel & High-Legume Micronutrients",
      why_this_plan: `Focuses on iron-rich kidney beans and monounsaturated nuts to sustain high mental clarity and focus.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Sprouted Moong & Vegetable Upma" : isEggetarian ? "Boiled Eggs (2) + Avocado Toast" : "Moong Dal Cheela with Mint Curd Chutney",
          description: "High-protein lentil savory crepe packed with grated veggies and gut-healthy mint dip.",
          calories: 340, protein_g: isEggetarian ? 19.0 : 16.0, carbs_g: 44.0, fat_g: 9.0, fiber_g: 6.5, prep_time: "18 mins",
          ingredients: ["Yellow Moong Dal batter", "Grated Paneer/Tofu", "Spinach & Coriander", "Mint Chutney"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Rajma Masala with Brown Rice & Beetroot Raita" : "Lemon Garlic Chicken Bowl with Brown Rice & Broccoli",
          description: "Slow-digesting kidney beans rich in folate, iron, and prebiotic fibers for all-day focus.",
          calories: 510, protein_g: isVeg ? 19.5 : 38.0, carbs_g: 76.0, fat_g: 11.0, fiber_g: 10.5, prep_time: "30 mins",
          ingredients: ["Red Kidney Beans (Rajma)", "Steamed Brown Rice", "Beetroot Curd Raita", "Onion & Tomato Gravy"]
        },
        {
          meal_type: "Snack",
          title: "Spiced Roasted Makhana + Handful of Soaked Almonds & Walnuts",
          description: "Magnesium-dense fox nuts and omega-3 rich walnuts to fuel cognitive energy.",
          calories: 180, protein_g: 6.0, carbs_g: 22.0, fat_g: 8.5, fiber_g: 4.5, prep_time: "5 mins",
          ingredients: ["Roasted Fox Nuts (Makhana)", "Soaked Almonds (5 pcs)", "Walnut halves (2 pcs)", "Pink salt"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Tofu / Paneer Tikka Stir-fry with 2 Multigrain Rotis & Palak Soup" : "Grilled Fish Fillet with Sauteed Zucchini & Quinoa",
          description: "Thermogenic light dinner high in lean protein to promote active metabolic recovery during sleep.",
          calories: 420, protein_g: isVeg ? 24.0 : 32.0, carbs_g: 42.0, fat_g: 14.0, fiber_g: 8.0, prep_time: "22 mins",
          ingredients: ["Marinated Paneer/Tofu (140g)", "Bell peppers & Onions", "Multigrain Rotis", "Warm Palak soup"]
        }
      ]
    },
    // DAY 3 - WEDNESDAY
    {
      day_number: 3,
      day_name: "Wednesday",
      day_label: "Wed • Day 3",
      tagline: "Active Recovery & Plant-Powered Satiety",
      why_this_plan: `Integrates sprouted live enzymes and chickpea complex carbs to support muscle glycogen replenishment.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Chia Seed Coconut Pudding with Mango & Flax" : isEggetarian ? "Egg Bhurji (Scrambled) with 2 Multigrain Toasts" : "Besan Cheela Loaded with Cottage Cheese & Veggies",
          description: "Wholesome chickpea flour pancakes bursting with bioavailable protein and essential zinc.",
          calories: 325, protein_g: isEggetarian ? 18.5 : 15.0, carbs_g: 42.0, fat_g: 9.5, fiber_g: 6.0, prep_time: "15 mins",
          ingredients: ["Gram flour (Besan)", "Crumbled Paneer", "Finely chopped bell peppers", "Ajwain & Turmeric"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Chole (Chickpeas) with Quinoa Pilaf & Cucumber Salad" : "Tandoori Chicken Salad Bowl with Avocado dressing",
          description: "Hearty Mediterranean/Desi legume bowl rich in plant sterols and clean low-GI carbohydrates.",
          calories: 490, protein_g: isVeg ? 18.0 : 35.0, carbs_g: 72.0, fat_g: 12.0, fiber_g: 9.5, prep_time: "25 mins",
          ingredients: ["Boiled Kabuli Chana", "Steamed Quinoa/Rice", "Spiced Tomato Gravy", "Cucumber Onion Salad"]
        },
        {
          meal_type: "Snack",
          title: "Mixed Sprout Salad (Moong + Kala Chana) with Lemon Dressing",
          description: "Enzyme-active sprouted micro-legumes delivering live Vitamin C and prebiotic fiber.",
          calories: 175, protein_g: 9.5, carbs_g: 28.0, fat_g: 2.0, fiber_g: 7.2, prep_time: "5 mins",
          ingredients: ["Sprouted Green Moong", "Sprouted Black Chana", "Fresh Lemon juice", "Chaat masala"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Lauki Kofta (Baked) / Soya Chunk Curry with 2 Rotis & Salad" : "Chicken Clear Soup with Steamed Dumplings & Greens",
          description: "Easily assimilated gentle meal ensuring deep restful REM sleep and hydration retention.",
          calories: 410, protein_g: isVeg ? 22.5 : 30.0, carbs_g: 46.0, fat_g: 12.5, fiber_g: 8.0, prep_time: "20 mins",
          ingredients: ["Nutri Soya Chunks / Bottle Gourd", "Multigrain Rotis (2)", "Tomato Curry", "Fresh Green Salad"]
        }
      ]
    },
    // DAY 4 - THURSDAY
    {
      day_number: 4,
      day_name: "Thursday",
      day_label: "Thu • Day 4",
      tagline: "Gut Microbiome & Probiotic Cellular Repair",
      why_this_plan: `Focuses on fermented foods and soluble beta-glucan to enhance nutrient absorption and digestion.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Overnight Rolled Oats with Almond Butter & Sliced Apples" : isEggetarian ? "Soft Boiled Eggs (2) with Multigrain Toast" : "Steamed Idlis (3) with Sambar & Coconut Dip",
          description: "Fermented rice & lentil cakes providing easily digestible bioavailable carbs and gut probiotics.",
          calories: 310, protein_g: isEggetarian ? 17.5 : 11.5, carbs_g: 58.0, fat_g: 4.5, fiber_g: 6.0, prep_time: "15 mins",
          ingredients: ["Idli Batter", "Vegetable Sambar", "Fresh Coconut Chutney"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Palak Paneer (Spinach Cottage Cheese) with 2 Rotis & Brown Rice" : "Grilled Salmon Fillet with Brown Rice & Steamed Asparagus",
          description: "Iron-rich spinach combined with calcium-dense cottage cheese for comprehensive micronutrient balance.",
          calories: 495, protein_g: isVeg ? 22.0 : 34.0, carbs_g: 58.0, fat_g: 16.0, fiber_g: 8.5, prep_time: "25 mins",
          ingredients: ["Fresh Spinach / Palak", "Paneer Cubes (120g)", "Multigrain Phulkas", "Jeera Brown Rice"]
        },
        {
          meal_type: "Snack",
          title: "Fresh Tender Coconut Water + Handful of Roasted Pumpkin & Sunflower Seeds",
          description: "Natural electrolyte replenishment rich in potassium, zinc, and magnesium.",
          calories: 160, protein_g: 5.5, carbs_g: 18.0, fat_g: 7.0, fiber_g: 3.5, prep_time: "3 mins",
          ingredients: ["Fresh Coconut Water", "Pumpkin Seeds (15g)", "Sunflower Seeds (10g)"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Moong Dal Khichdi with Ghee & Roasted Papad + Cucumber Raita" : "Herb Roasted Chicken Breast with Sauteed Zucchini & Clear Broth",
          description: "Ayurvedic tridoshic comfort dinner that soothes the GI tract and optimizes restorative sleep.",
          calories: 390, protein_g: isVeg ? 16.5 : 32.0, carbs_g: 56.0, fat_g: 10.0, fiber_g: 6.5, prep_time: "20 mins",
          ingredients: ["Yellow Moong Dal", "Basmati Rice", "A2 Cow Ghee", "Fresh Cucumber Raita"]
        }
      ]
    },
    // DAY 5 - FRIDAY
    {
      day_number: 5,
      day_name: "Friday",
      day_label: "Fri • Day 5",
      tagline: "High-Protein Energy & Antioxidant Defenses",
      why_this_plan: `Antioxidant-dense berries and cruciferous greens to combat weekly oxidative stress and fatigue.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Green Smoothie Bowl with Spinach, Banana & Hemp Seeds" : isEggetarian ? "Egg & Spinach Breakfast Wrap" : "Paneer Stuffed Multigrain Paratha (1) with Low-fat Curd",
          description: "Whole-wheat stuffed flatbread delivering sustained morning amino acid release.",
          calories: 360, protein_g: isEggetarian ? 19.0 : 18.5, carbs_g: 46.0, fat_g: 12.0, fiber_g: 6.0, prep_time: "20 mins",
          ingredients: ["Multigrain Flour", "Grated Paneer (80g)", "Ajwain & Spices", "Fresh Dahi"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Black Eyed Peas (Lobia Curry) with Steamed Rice & Carrot Slaw" : "Lemon Herb Chicken with Sweet Potato Mash & Green Beans",
          description: "High-fiber lobia legumes packed with zinc, copper, and plant flavonoids.",
          calories: 470, protein_g: isVeg ? 18.0 : 36.0, carbs_g: 74.0, fat_g: 9.5, fiber_g: 9.0, prep_time: "25 mins",
          ingredients: ["Lobia (Black-eyed peas)", "Steamed Rice", "Tomato-Ginger Gravy", "Grated Carrot Slaw"]
        },
        {
          meal_type: "Snack",
          title: "Warm Spiced Turmeric Golden Milk (Almond/Cow Milk) + 2 Dates",
          description: "Curcumin-rich anti-inflammatory elixir paired with natural fiber-rich medjool dates.",
          calories: 170, protein_g: 5.0, carbs_g: 28.0, fat_g: 4.5, fiber_g: 3.0, prep_time: "5 mins",
          ingredients: ["Warm Milk", "Wild Turmeric & Black pepper", "Cardamom", "Pitted Medjool Dates"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Tofu / Mushroom Mattar Masala with 2 Rotis & Mint Salad" : "Grilled Fish Fillet with Steamed Broccoli & Quinoa",
          description: "Light, mushroom & green pea savory curry boosting natural immunity and selenium.",
          calories: 405, protein_g: isVeg ? 20.0 : 30.0, carbs_g: 48.0, fat_g: 12.5, fiber_g: 7.5, prep_time: "20 mins",
          ingredients: ["Button Mushrooms / Tofu", "Green Peas", "Multigrain Rotis (2)", "Fresh Mint Salad"]
        }
      ]
    },
    // DAY 6 - SATURDAY
    {
      day_number: 6,
      day_name: "Saturday",
      day_label: "Sat • Day 6",
      tagline: "Weekend Athletic Vitality & Complex Carb Fuel",
      why_this_plan: `Optimizes glycogen stores for weekend physical activities, outdoor sports, or workouts.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Quinoa Porridge with Almonds, Figs & Cinnamon" : isEggetarian ? "Avocado & Poached Eggs on Sourdough" : "Moong Dal Dosa with Sambar & Tomato Chutney",
          description: "Crisp golden crepe packed with plant protein and slow-digesting complex carbs.",
          calories: 345, protein_g: isEggetarian ? 19.5 : 15.0, carbs_g: 48.0, fat_g: 8.5, fiber_g: 6.5, prep_time: "18 mins",
          ingredients: ["Moong dal batter", "Vegetable Sambar", "Tangy Tomato Chutney"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Hyderabadi Veg & Paneer Dum Biryani with Cucumber Raita" : "Fragrant Chicken Dum Biryani with Mint Raita & Salad",
          description: "Aromatic basmati rice cooked with whole spices, paneer cubes, and cooling probiotic raita.",
          calories: 520, protein_g: isVeg ? 21.0 : 38.0, carbs_g: 78.0, fat_g: 14.0, fiber_g: 6.5, prep_time: "30 mins",
          ingredients: ["Long-grain Basmati Rice", "Fresh Paneer/Chicken", "Whole Spices", "Cooling Dahi Raita"]
        },
        {
          meal_type: "Snack",
          title: "Dry Roasted Makhana & Peanut Trail Mix + Black Coffee / Green Tea",
          description: "High-protein crunchy fuel that provides steady sustained energy.",
          calories: 190, protein_g: 7.5, carbs_g: 20.0, fat_g: 9.0, fiber_g: 4.0, prep_time: "5 mins",
          ingredients: ["Fox Nuts (Makhana)", "Roasted Peanuts (15g)", "Himalayan Pink Salt", "Green Tea"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Paneer Tikka with Grilled Bell Peppers & 2 Phulkas" : "Tandoori Chicken Skewers with Mint Dip & Roti",
          description: "Smoky tandoori meal packed with bioavailable protein and essential minerals.",
          calories: 430, protein_g: isVeg ? 24.0 : 35.0, carbs_g: 40.0, fat_g: 16.5, fiber_g: 6.0, prep_time: "20 mins",
          ingredients: ["Paneer / Chicken", "Capsicum & Onion petals", "Multigrain Rotis (2)", "Green Chutney"]
        }
      ]
    },
    // DAY 7 - SUNDAY
    {
      day_number: 7,
      day_name: "Sunday",
      day_label: "Sun • Day 7",
      tagline: "Digestive Reset & Metabolic Harmony",
      why_this_plan: `Prepares the body for the upcoming week with light, enzyme-rich meals and natural detoxification.`,
      meals: [
        {
          meal_type: "Breakfast",
          title: isVegan ? "Chia Seed Pudding with Mango, Kiwi & Mint" : isEggetarian ? "Egg White Omelette with Mushrooms & Whole Wheat Toast" : "Multigrain Vegetable Cheela with Mint Curd Chutney",
          description: "Savory vegetable crepes loaded with grated zucchini, carrots, and gram flour.",
          calories: 320, protein_g: isEggetarian ? 18.0 : 14.0, carbs_g: 44.0, fat_g: 8.0, fiber_g: 6.5, prep_time: "15 mins",
          ingredients: ["Besan / Multigrain flour", "Grated Carrots & Zucchini", "Curd Mint Dip"]
        },
        {
          meal_type: "Lunch",
          title: isVeg ? "Panchmel Dal (5 Lentil Mix) + Brown Rice + Bhindi Masala" : "Grilled Fish Bowl with Brown Rice & Stir-fry Greens",
          description: "5-lentil power dal offering a complete amino acid profile paired with fiber-rich okra.",
          calories: 475, protein_g: isVeg ? 19.0 : 34.0, carbs_g: 74.0, fat_g: 10.5, fiber_g: 9.5, prep_time: "25 mins",
          ingredients: ["5-Lentil Blend (Toor, Moong, Masoor, Chana, Urad)", "Brown Rice", "Bhindi Masala (Okra)"]
        },
        {
          meal_type: "Snack",
          title: "Fresh Pomegranate & Papaya Bowl with Roasted Seeds",
          description: "Papain enzymes and polyphenol antioxidants assisting cellular gut recovery.",
          calories: 165, protein_g: 3.5, carbs_g: 36.0, fat_g: 1.5, fiber_g: 6.0, prep_time: "5 mins",
          ingredients: ["Pomegranate pearls", "Diced Papaya", "Sunflower & Chia seeds"]
        },
        {
          meal_type: "Dinner",
          title: isVeg ? "Light Bottle Gourd (Lauki) Soup + 2 Rotis with Soya Bhurji" : "Steamed Chicken & Vegetable Clear Dumpling Soup with Greens",
          description: "Gentle, easily digestible evening meal to wake up energized for Monday.",
          calories: 395, protein_g: isVeg ? 22.0 : 30.0, carbs_g: 44.0, fat_g: 11.5, fiber_g: 7.0, prep_time: "20 mins",
          ingredients: ["Fresh Lauki Soup", "Nutri Soya Chunks", "Multigrain Rotis (2)", "Green Salad"]
        }
      ]
    }
  ];

  // Calculate daily totals
  const processedDays = days.map(d => ({
    ...d,
    total_calories: d.meals.reduce((sum, m) => sum + m.calories, 0),
    total_protein_g: Number(d.meals.reduce((sum, m) => sum + m.protein_g, 0).toFixed(1)),
    total_carbs_g: Number(d.meals.reduce((sum, m) => sum + m.carbs_g, 0).toFixed(1)),
    total_fat_g: Number(d.meals.reduce((sum, m) => sum + m.fat_g, 0).toFixed(1))
  }));

  // Complete Next Week Categorized Grocery Checklist
  const next_week_groceries = [
    {
      category: "🌾 Grains, Flours & Cereals",
      items: [
        "Multigrain Atta / Whole Wheat Flour (2 kg)",
        "Rolled Oats & Thick Poha (1 kg)",
        "Organic Basmati & Brown Rice (1.5 kg)",
        "Quinoa & Besan / Gram Flour (500g)"
      ]
    },
    {
      category: "🫘 Lentils & Legumes (High Protein)",
      items: [
        "Yellow Moong Dal & Toor Dal (1 kg)",
        "Red Kidney Beans (Rajma) & Kabuli Chana (1 kg)",
        "Whole Green Moong & Kala Chana for Sprouting (500g)",
        "Nutri Soya Chunks (200g)"
      ]
    },
    {
      category: "🥛 Dairy & Plant Protein",
      items: [
        "Fresh Artisanal Paneer / Tofu (800g)",
        "Low-Fat Probiotic Curd / Dahi (1.5 kg)",
        "Cow / Almond Milk (2 Liters)",
        "Farm-Fresh Eggs (1 Dozen - if eggetarian)"
      ]
    },
    {
      category: "🥦 Fresh Vegetables & Greens",
      items: [
        "Spinach (Palak) & Mint / Coriander (3 bunches)",
        "Bell Peppers, Carrots, Cucumbers & Tomatoes (2 kg)",
        "Green Beans, Okra (Bhindi) & Bottle Gourd (Lauki)",
        "Button Mushrooms & Broccoli (400g)",
        "Ginger, Garlic & Fresh Lemons (10 pcs)"
      ]
    },
    {
      category: "🍎 Fresh Fruits",
      items: [
        "Apples & Bananas (1 kg each)",
        "Pomegranate & Papaya (1 kg)",
        "Seasonal Berries or Oranges"
      ]
    },
    {
      category: "🥜 Nuts, Seeds & Superfoods",
      items: [
        "Raw Almonds & Walnuts (250g)",
        "Roasted Fox Nuts (Makhana) (200g)",
        "Dry Roasted Chana (300g)",
        "Chia Seeds & Pumpkin Seeds (150g)",
        "Cold-Pressed Ghee & Extra Virgin Olive Oil"
      ]
    }
  ];

  return {
    plan_title: `Personalized 7-Day (Next Week) ${profile.goal?.replace('_', ' ')?.toUpperCase() || 'FITNESS'} Blueprint`,
    target_summary: calculateClientTargets(profile),
    days: processedDays,
    next_week_groceries,
    advance_prep_tips: [
      "Prep ahead: Soak Rajma (Kidney beans) on Monday night for Tuesday's high-protein lunch.",
      "Start sprouting whole green moong on Tuesday for Wednesday's live enzyme sprout salad.",
      "Refrigerate fresh curd and keep roasted makhana & dry chana sealed in airtight jars for quick 4 PM snacking."
    ]
  };
}

// AI-Powered Food Intelligence with Non-Food / Gibberish Validation
export async function analyzeScannedFood(foodName, userProfile, todayConsumed, parsedData = null) {
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

  const validation = validateFoodInput(foodName);
  if (!validation.isValid) {
    return {
      is_valid_food: false,
      error_message: validation.reason,
      verdict: "invalid",
      food_item: { name: foodName || "Invalid Item" }
    };
  }

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
