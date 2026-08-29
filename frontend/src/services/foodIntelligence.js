// NutriWise AI Food Intelligence & Culinary Validation Engine

// Common non-food terms and physical objects to strictly reject
const NON_FOOD_DICTIONARY = new Set([
  "laptop", "computer", "phone", "cellphone", "mobile", "mouse", "keyboard", "screen", "monitor",
  "television", "tv", "remote", "desk", "table", "chair", "sofa", "couch", "bed", "door", "window",
  "wall", "floor", "ceiling", "fan", "light", "bulb", "lamp", "car", "bike", "bicycle", "motorcycle",
  "wheel", "tire", "brick", "stone", "rock", "metal", "plastic", "wood", "glass", "paper", "book",
  "pen", "pencil", "bottle cap", "shoe", "shoes", "sock", "socks", "shirt", "pant", "pants", "dress",
  "hat", "bag", "backpack", "wallet", "coin", "money", "card", "box", "wire", "cable", "battery",
  "human", "person", "man", "woman", "boy", "girl", "face", "hair", "dog", "cat", "pet", "animal",
  "medicine", "tablet", "pill", "syrup", "shampoo", "soap", "toothpaste", "brush", "asdf", "qwerty",
  "xyz", "test", "demo", "dummy", "nothing", "null", "undefined", "none"
]);

// Extensive culinary tokens & food categories
const FOOD_KEYWORDS = [
  // Indian Lentils & Legumes
  "dal", "daal", "dhal", "tadka", "makhani", "fry", "toor", "moong", "urad", "chana", "masoor", "rajma", "chole", "sambar", "rasam", "kadhi",
  // Breads & Grains
  "roti", "rotis", "chapati", "chapatis", "phulka", "phulkas", "paratha", "parathas", "aloo paratha", "paneer paratha", "gobi paratha", "naan", "garlic naan", "butter naan", "kulcha", "puri", "poori", "bhatura", "bhature", "thepla", "khakhra",
  // Rice & Pilaf
  "rice", "chawal", "basmati", "brown rice", "biryani", "pulao", "pulav", "khichdi", "fried rice", "curd rice", "jeera rice",
  // Dairy & Cottage Cheese
  "paneer", "panner", "tofu", "curd", "dahi", "raita", "buttermilk", "chaas", "lassi", "milk", "cheese", "butter", "ghee", "yogurt", "greek yogurt",
  // South Indian
  "idli", "idlis", "dosa", "masala dosa", "uttapam", "vada", "medu vada", "upma", "poha", "cheela", "chilla", "appam", "pongal",
  // Vegetables & Curries
  "sabzi", "subzi", "curry", "bhindi", "aloo", "gobi", "gobhi", "palak", "spinach", "methi", "baingan", "brinjal", "eggplant", "lauki", "tinda", "matar", "peas", "carrot", "gajar", "capsicum", "shimla mirch", "karela", "bitter gourd", "cabbage", "patta gobhi", "cauliflower", "broccoli", "mushroom", "mushrooms", "corn", "sweet corn", "tomato", "onion", "garlic", "ginger",
  // Non-Veg & Eggs
  "egg", "eggs", "omelette", "omelet", "bhurji", "boiled egg", "chicken", "chicken curry", "butter chicken", "tandoori chicken", "chicken tikka", "fish", "fish curry", "salmon", "tuna", "prawns", "shrimp", "mutton", "keema", "meat", "pork", "beef", "turkey",
  // Snacks, Street Food & Fast Food
  "samosa", "pakora", "pakoda", "bhajiya", "kachori", "dhokla", "khandvi", "pani puri", "golgappa", "sev puri", "bhel puri", "chaat", "aloo tikki", "sandwich", "burger", "pizza", "pasta", "noodles", "maggie", "maggi", "chowmein", "roll", "kathi roll", "wrap", "frankie", "french fries", "fries", "chips", "nachos", "popcorn", "makhana",
  // Healthy & Fitness Items
  "salad", "sprouts", "sprout salad", "green salad", "greek salad", "fruit bowl", "fruit salad", "oats", "oatmeal", "porridge", "muesli", "granola", "chia seeds", "flax seeds", "pumpkin seeds", "almonds", "badam", "walnuts", "akhrot", "cashews", "kaju", "peanuts", "chana", "roasted chana", "protein bar", "protein shake", "whey", "smoothie",
  // Fruits
  "apple", "banana", "mango", "orange", "papaya", "pomegranate", "anar", "grapes", "watermelon", "melon", "guava", "amrood", "chikoo", "pineapple", "strawberry", "berries", "blueberry", "kiwi", "pear", "peach", "plum", "dates", "khajoor", "figs", "anjeer", "avocado", "coconut", "lemon", "lime",
  // Beverages
  "tea", "chai", "masala chai", "green tea", "coffee", "black coffee", "espresso", "latte", "cappuccino", "juice", "fresh juice", "orange juice", "apple juice", "sugarcane juice", "coconut water", "nariyal pani", "water", "lemonade", "nimbu pani", "shake", "milkshake", "smoothie",
  // Sweets & Desserts
  "gulab jamun", "rasgulla", "kheer", "halwa", "gajar halwa", "laddu", "ladoo", "jalebi", "kaju katli", "ice cream", "kulfi", "cake", "pastry", "brownie", "chocolate", "cookie", "biscuit", "pudding"
];

// Checks if input is gibberish or non-food
export function validateFoodInput(inputText) {
  if (!inputText || typeof inputText !== 'string') {
    return {
      isValid: false,
      reason: "Please enter a meal or food name."
    };
  }

  const query = inputText.trim().toLowerCase();

  if (query.length < 2) {
    return {
      isValid: false,
      reason: "Please enter a valid food name (at least 2 characters)."
    };
  }

  if (/^[^a-zA-Z]+$/.test(query)) {
    return {
      isValid: false,
      reason: "Food name must contain letters, not just numbers or symbols."
    };
  }

  const hasVowels = /[aeiouy]/i.test(query);
  if (!hasVowels && query.length >= 4) {
    return {
      isValid: false,
      reason: `"${inputText}" is not recognized as an edible food item. Please enter a valid meal (e.g. 'Dal Tadka & Rice', 'Paneer Tikka', 'Oats').`
    };
  }

  if (/(.)\1{4,}/.test(query)) {
    return {
      isValid: false,
      reason: `"${inputText}" is not recognized as a food item. Please enter a meaningful dish name.`
    };
  }

  const words = query.split(/[\s,+/&]+/).map(w => w.trim()).filter(Boolean);
  for (const word of words) {
    if (NON_FOOD_DICTIONARY.has(word) && !FOOD_KEYWORDS.some(k => query.includes(k))) {
      return {
        isValid: false,
        reason: `"${inputText}" is identified as a non-food object. Please enter an edible food dish or ingredient.`
      };
    }
  }

  const hasFoodMatch = FOOD_KEYWORDS.some(k => query.includes(k));
  if (!hasFoodMatch && query.length >= 6) {
    const lettersOnly = query.replace(/[^a-z]/g, '');
    const uniqueLetters = new Set(lettersOnly).size;
    if (uniqueLetters <= 2) {
      return {
        isValid: false,
        reason: `"${inputText}" was not recognized as an edible food item. Please enter a valid meal.`
      };
    }
  }

  return {
    isValid: true,
    cleanQuery: inputText.trim()
  };
}

// AI Nutrition Estimation Engine
export function estimateNutritionalValues(foodName, userProfile) {
  const query = (foodName || "").toLowerCase();
  
  let calories = 380;
  let protein_g = 14.0;
  let carbs_g = 52.0;
  let fat_g = 12.0;
  let fiber_g = 4.5;
  let sugar_g = 3.5;
  let sodium_mg = 380;
  let category = "Balanced Indian Meal";
  let allergens = [];
  let vitamins = ["Vitamin B-Complex", "Iron", "Zinc"];
  let serving_size = "1 standard serving";

  // Check for portion numbers (e.g. "2 rotis", "3 eggs", "2 cups")
  let portionMultiplier = 1.0;
  const numMatch = query.match(/(\d+)\s*(roti|rotis|phulka|phulkas|paratha|parathas|egg|eggs|toast|cup|cups|slice|slices|scoop|scoops|pcs|pieces)?/i);
  if (numMatch && numMatch[1]) {
    const count = parseInt(numMatch[1], 10);
    if (count >= 2 && count <= 6) {
      portionMultiplier = 0.75 + (count * 0.25);
    }
  }

  // 1. High-Protein Dishes (Paneer / Tofu / Legumes)
  if (query.includes("paneer") || query.includes("panner") || query.includes("tofu")) {
    calories = 410; protein_g = 22.0; carbs_g = 34.0; fat_g = 18.0; fiber_g = 4.0; sugar_g = 2.5; sodium_mg = 420;
    category = "High Calcium & Bioavailable Protein";
    allergens.push("dairy");
    vitamins = ["Calcium", "Vitamin B12", "Phosphorus"];
  } else if (query.includes("rajma") || query.includes("chole") || query.includes("chana") || query.includes("lobia")) {
    calories = 480; protein_g = 18.5; carbs_g = 78.0; fat_g = 9.0; fiber_g = 10.5; sugar_g = 3.0; sodium_mg = 390;
    category = "High-Fiber Legume & Complex Carb";
    vitamins = ["Iron", "Folate", "Magnesium", "Potassium"];
  } else if (query.includes("dal") || query.includes("daal") || query.includes("khichdi") || query.includes("sambar")) {
    calories = 440; protein_g = 16.5; carbs_g = 72.0; fat_g = 8.5; fiber_g = 7.5; sugar_g = 2.0; sodium_mg = 360;
    category = "Slow-Digesting Plant Protein & Carb";
    vitamins = ["B-Complex", "Iron", "Zinc"];
  } else if (query.includes("soya") || query.includes("soy")) {
    calories = 390; protein_g = 28.0; carbs_g = 42.0; fat_g = 7.5; fiber_g = 8.5; sugar_g = 2.0; sodium_mg = 310;
    category = "Ultra High-Protein Plant Superfood";
    vitamins = ["Complete Amino Acids", "Isoflavones", "Calcium"];
  } 
  // 2. Non-Veg & Eggs
  else if (query.includes("egg") || query.includes("omelette") || query.includes("bhurji")) {
    calories = 340; protein_g = 20.0; carbs_g = 24.0; fat_g = 15.0; fiber_g = 2.5; sugar_g = 1.5; sodium_mg = 440;
    category = "High Biological Value Animal Protein";
    allergens.push("egg");
    vitamins = ["Choline", "Vitamin D", "Vitamin B12"];
  } else if (query.includes("chicken") || query.includes("tikka") || query.includes("tandoori")) {
    calories = 490; protein_g = 36.0; carbs_g = 32.0; fat_g = 14.0; fiber_g = 3.5; sugar_g = 2.0; sodium_mg = 520;
    category = "Lean Complete Muscle Protein";
    vitamins = ["Niacin", "Selenium", "Phosphorus"];
  } else if (query.includes("fish") || query.includes("salmon") || query.includes("prawn")) {
    calories = 420; protein_g = 32.0; carbs_g = 28.0; fat_g = 12.0; fiber_g = 2.0; sugar_g = 1.0; sodium_mg = 460;
    category = "Omega-3 Lean Marine Protein";
    vitamins = ["Omega-3 Fatty Acids", "Iodine", "Vitamin D"];
  }
  // 3. Indian Breakfasts & Breads
  else if (query.includes("poha") || query.includes("upma")) {
    calories = 320; protein_g = 11.5; carbs_g = 52.0; fat_g = 7.5; fiber_g = 4.8; sugar_g = 2.5; sodium_mg = 310;
    category = "Traditional Low-GI Breakfast Grain";
    vitamins = ["Iron", "Vitamin B1", "Potassium"];
  } else if (query.includes("cheela") || query.includes("chilla") || query.includes("dosa") || query.includes("idli")) {
    calories = 325; protein_g = 15.0; carbs_g = 44.0; fat_g = 8.5; fiber_g = 6.0; sugar_g = 2.0; sodium_mg = 290;
    category = "Fermented / Lentil Savory Crepe";
    vitamins = ["Bioavailable Zinc", "Live Enzymes", "Folate"];
  } else if (query.includes("paratha") || query.includes("naan") || query.includes("puri") || query.includes("bhatura")) {
    calories = 490; protein_g = 13.5; carbs_g = 62.0; fat_g = 21.0; fiber_g = 4.0; sugar_g = 3.0; sodium_mg = 460;
    category = "Energy-Dense Flatbread";
  }
  // 4. Healthy Fruits, Veggies & Oats
  else if (query.includes("fruit") || query.includes("papaya") || query.includes("apple") || query.includes("banana") || query.includes("pomegranate")) {
    calories = 175; protein_g = 3.0; carbs_g = 42.0; fat_g = 0.8; fiber_g = 6.5; sugar_g = 24.0; sodium_mg = 15;
    category = "Fresh Fruit / Antioxidant Rich";
    vitamins = ["Vitamin C", "Potassium", "Flavonoids"];
  } else if (query.includes("salad") || query.includes("sprout") || query.includes("cucumber") || query.includes("spinach")) {
    calories = 180; protein_g = 9.0; carbs_g = 26.0; fat_g = 3.5; fiber_g = 7.5; sugar_g = 4.0; sodium_mg = 160;
    category = "Micronutrient & Raw Fiber Superfood";
    vitamins = ["Vitamin K", "Vitamin A", "Folate", "Chlorophyll"];
  } else if (query.includes("oats") || query.includes("oatmeal")) {
    calories = 290; protein_g = 12.5; carbs_g = 48.0; fat_g = 6.0; fiber_g = 7.5; sugar_g = 3.0; sodium_mg = 90;
    category = "Beta-Glucan Whole Grain";
    vitamins = ["Beta-Glucan", "Manganese", "Phosphorus"];
  } 
  // 5. Fast Food / Junk & Sweets
  else if (query.includes("pizza") || query.includes("burger") || query.includes("fries") || query.includes("chips") || query.includes("samosa") || query.includes("maggi") || query.includes("noodles") || query.includes("fried")) {
    calories = 580; protein_g = 12.0; carbs_g = 76.0; fat_g = 26.0; fiber_g = 2.0; sugar_g = 12.0; sodium_mg = 840;
    category = "High-Calorie Refined / Fried Meal";
    allergens.push("gluten");
  } else if (query.includes("gulab jamun") || query.includes("halwa") || query.includes("cake") || query.includes("ice cream") || query.includes("jalebi") || query.includes("chocolate")) {
    calories = 390; protein_g = 4.5; carbs_g = 62.0; fat_g = 16.0; fiber_g = 1.0; sugar_g = 45.0; sodium_mg = 140;
    category = "Dense Sugar / Sweet Confection";
  }

  // Apply portion multiplier
  calories = Math.round(calories * portionMultiplier);
  protein_g = Number((protein_g * portionMultiplier).toFixed(1));
  carbs_g = Number((carbs_g * portionMultiplier).toFixed(1));
  fat_g = Number((fat_g * portionMultiplier).toFixed(1));
  fiber_g = Number((fiber_g * portionMultiplier).toFixed(1));

  const isUnhealthy = query.includes("pizza") || query.includes("burger") || query.includes("chips") || query.includes("samosa") || query.includes("fries") || query.includes("soda") || query.includes("cake");
  const isHighProtein = protein_g >= 16.0;

  let score = isUnhealthy ? 5.0 : (isHighProtein ? 8.8 : 7.8);
  const verdict = isUnhealthy ? "not_ideal" : (isHighProtein ? "good_fit" : "modify");
  const badge_label = isUnhealthy ? "High Calorie / Not Ideal" : (isHighProtein ? "Optimal Fit" : "Good Fit with Adjustment");

  let rationale = `AI estimated for "${foodName}": ${calories} kcal and ${protein_g}g protein. `;
  if (!isUnhealthy) {
    rationale += `Provides wholesome complex carbohydrates and bioavailable amino acids to nourish muscle recovery without causing sudden glycemic spikes.`;
  } else {
    rationale += `Contains higher amounts of refined flour, deep-frying oils, or simple sugars, which can lead to rapid energy spikes followed by midday lethargy.`;
  }

  return {
    is_valid_food: true,
    food_item: {
      name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
      category,
      serving_size,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
      vitamins,
      allergens: Array.from(new Set(allergens))
    },
    verdict,
    score,
    badge_label,
    rationale,
    suggestions: isUnhealthy ? [
      "Consider swapping with a whole-grain, grilled, or lentil-based alternative below to stay aligned with your daily diet target.",
      "If consuming this dish, pair with raw cucumber slices or low-fat curd to blunt the glucose spike."
    ] : [
      "Well-balanced choice! Drink a glass of water to support active nutrient absorption."
    ]
  };
}

// Evaluates Suitability Against Personalized Diet Plan and Generates Explained Alternatives
export function evaluateDietPlanSuitabilityAndAlternatives(foodItem, targetSlot = 'lunch', dietPlan = null, userProfile = {}) {
  const slot = targetSlot.toLowerCase();
  
  // Benchmark target calories & protein for each slot
  const slotTargets = {
    breakfast: { calories: 330, protein: 14.0, name: "Breakfast" },
    lunch: { calories: 480, protein: 18.0, name: "Lunch" },
    snack: { calories: 180, protein: 8.0, name: "Snack" },
    dinner: { calories: 420, protein: 22.0, name: "Dinner" }
  };

  const target = slotTargets[slot] || slotTargets.lunch;
  const calDiff = foodItem.calories - target.calories;
  const proteinDiff = foodItem.protein_g - target.protein;
  const foodNameLower = (foodItem.name || "").toLowerCase();

  const isJunkOrFried = foodNameLower.includes("pizza") || foodNameLower.includes("burger") || foodNameLower.includes("chips") ||
                        foodNameLower.includes("samosa") || foodNameLower.includes("fries") || foodNameLower.includes("fried") ||
                        foodNameLower.includes("cake") || foodNameLower.includes("soda") || foodNameLower.includes("cola");

  let suitability = 'suitable';
  let badgeText = '🟢 Suitable & Fits Diet Plan Blueprint';
  let badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
  let explanation = '';

  if (isJunkOrFried || calDiff > 220 || (calDiff > 140 && foodItem.protein_g < 10)) {
    suitability = 'not_suitable';
    badgeText = '🔴 Not Suitable for Your Diet Plan';
    badgeColor = 'text-rose-800 bg-rose-100 border-rose-300';
    explanation = `⚠️ "${foodItem.name}" is NOT optimal for your scheduled ${target.name}. It delivers ${foodItem.calories} kcal (exceeding your planned ${target.name} target of ${target.calories} kcal by +${calDiff} kcal) with higher saturated fats/refined carbs and low protein density (${foodItem.protein_g}g vs ${target.protein}g target). Consuming this can cause glucose spikes and exceed your daily calorie budget.`;
  } else if (Math.abs(calDiff) > 100 || proteinDiff < -4) {
    suitability = 'partially_suitable';
    badgeText = '🟡 Partially Suitable (Minor Adjustment Needed)';
    badgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
    explanation = `⚡ "${foodItem.name}" can fit into your ${target.name} with minor adjustments. It contains ${foodItem.calories} kcal vs your planned ${target.calories} kcal (${calDiff > 0 ? `+${calDiff} kcal` : `${calDiff} kcal`}) and ${foodItem.protein_g}g protein. To keep your daily score optimal, keep remaining meals slightly lighter and add protein.`;
  } else {
    suitability = 'suitable';
    badgeText = '🟢 Highly Suitable & Perfectly Fits Diet Plan';
    badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    explanation = `✅ Excellent choice! "${foodItem.name}" (${foodItem.calories} kcal, ${foodItem.protein_g}g protein) closely matches your personalized ${target.name} targets (${target.calories} kcal, ${target.protein}g protein). It delivers sustained complex carbohydrates and clean amino acids for optimal metabolic balance.`;
  }

  // Pre-configured seasonal, practical, local Indian alternatives for each time slot
  const slotAlternatives = {
    breakfast: [
      {
        name: "Moong Dal Cheela with Grated Paneer & Mint Dip",
        calories: 325,
        protein_g: 16.5,
        carbs_g: 38.0,
        fat_g: 9.0,
        prep_time: "15 mins",
        local_availability: "🌱 Local Kirana & Dairy Staple",
        why_better: "Saves excess calories while doubling bioavailable protein (+9g). Made with yellow lentils and fresh paneer for steady 4-hour morning energy."
      },
      {
        name: "Spiced Vegetable Poha with Peanuts & Fresh Curd",
        calories: 330,
        protein_g: 12.5,
        carbs_g: 50.0,
        fat_g: 8.0,
        prep_time: "15 mins",
        local_availability: "🌱 100% Everyday Indian Staple",
        why_better: "Light, iron-rich, and non-bloating. Adding probiotic curd balances the glycemic response and prevents hunger spikes."
      },
      {
        name: "Besan Chilla with Onions, Tomatoes & Homemade Dahi",
        calories: 315,
        protein_g: 13.5,
        carbs_g: 44.0,
        fat_g: 7.5,
        prep_time: "10 mins",
        local_availability: "🌱 10-Min Fast Home Cooking",
        why_better: "Chickpea flour is packed with zinc and soluble fiber, offering sustained satiety with zero refined oils."
      }
    ],
    lunch: [
      {
        name: "Yellow Toor Dal Tadka + Steamed Rice + Palak Sabzi & Salad",
        calories: 480,
        protein_g: 16.5,
        carbs_g: 78.0,
        fat_g: 10.0,
        prep_time: "25 mins",
        local_availability: "🌱 Classic Everyday Home Thali",
        why_better: "Complete essential amino acid profile. Pairing toor dal with fresh palak ensures rich iron, fiber, and clean energy without afternoon fatigue."
      },
      {
        name: "Desi Rajma Masala with Steamed Brown/Jeera Rice & Beetroot Raita",
        calories: 495,
        protein_g: 19.0,
        carbs_g: 80.0,
        fat_g: 9.5,
        prep_time: "25 mins",
        local_availability: "🌱 High Iron & Folate Powerhouse",
        why_better: "Red kidney beans deliver slow-digesting resistant starch, providing sustained midday focus with 19g of plant protein."
      },
      {
        name: "Amritsari Chole with 2 Multigrain Phulkas & Cucumber Salad",
        calories: 470,
        protein_g: 17.5,
        carbs_g: 74.0,
        fat_g: 10.5,
        prep_time: "20 mins",
        local_availability: "🌱 Rich in Prebiotic Fiber",
        why_better: "White chickpeas provide magnesium and zinc. Whole wheat phulkas prevent insulin spikes compared to refined breads."
      }
    ],
    snack: [
      {
        name: "Dry Roasted Chana (Bhuna Chana) + Fresh Seasonal Papaya/Apple",
        calories: 180,
        protein_g: 8.5,
        carbs_g: 32.0,
        fat_g: 3.0,
        prep_time: "2 mins",
        local_availability: "🌱 Zero Oil • Ready to Eat",
        why_better: "Delivers 8.5g protein and active papain enzymes for gut health. Replaces 200+ kcal of fried snacks or sugary biscuits."
      },
      {
        name: "Roasted Fox Nuts (Makhana) with 5 Soaked Badam (Almonds)",
        calories: 175,
        protein_g: 6.5,
        carbs_g: 22.0,
        fat_g: 7.5,
        prep_time: "5 mins",
        local_availability: "🌱 Magnesium Rich Lotus Seeds",
        why_better: "Rich in anti-aging flavonoids and heart-healthy magnesium. Calms 4 PM cravings without adding refined sodium."
      },
      {
        name: "Sprouted Green Moong Chaat with Lemon & Tomatoes",
        calories: 170,
        protein_g: 9.5,
        carbs_g: 28.0,
        fat_g: 2.0,
        prep_time: "5 mins",
        local_availability: "🌱 Live Enzymes & Bioactive Vitamin C",
        why_better: "Sprouting unlocks active enzymes and doubles Vitamin C bioavailability for glowing skin and metabolic health."
      }
    ],
    dinner: [
      {
        name: "2 Multigrain Phulkas + Paneer Bhurji (or Egg Bhurji) & Green Salad",
        calories: 430,
        protein_g: 22.5,
        carbs_g: 40.0,
        fat_g: 16.0,
        prep_time: "18 mins",
        local_availability: "🌱 High Protein • Easy Night Digestion",
        why_better: "Provides 22.5g of nighttime muscle-repair protein with minimal complex carbs, optimizing restful sleep."
      },
      {
        name: "Palak Paneer (Fresh Spinach) with 2 Soft Phulkas",
        calories: 420,
        protein_g: 21.5,
        carbs_g: 42.0,
        fat_g: 16.0,
        prep_time: "20 mins",
        local_availability: "🌱 Seasonal Spinach & Fresh Dairy",
        why_better: "Delivers lutein and calcium without heavy cream. Easily digested within 2 hours before bed."
      },
      {
        name: "Desi Moong Dal Khichdi with A2 Ghee & Fresh Homemade Curd",
        calories: 385,
        protein_g: 16.5,
        carbs_g: 54.0,
        fat_g: 9.5,
        prep_time: "20 mins",
        local_availability: "🌱 Ayurvedic Soothing Reset",
        why_better: "The gold-standard Ayurvedic comfort dinner that restores gut flora and prepares your metabolism for the morning."
      }
    ]
  };

  return {
    suitability,
    badgeText,
    badgeColor,
    explanation,
    alternatives: slotAlternatives[slot] || slotAlternatives.lunch
  };
}
