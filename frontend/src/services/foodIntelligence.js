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
  
  // Unhealthy Junk / Fried / High-Sugar Keywords
  const isJunkOrFried = query.includes("samosa") || query.includes("pakora") || query.includes("pakoda") ||
                        query.includes("kachori") || query.includes("bhatura") || query.includes("poori") || query.includes("puri") ||
                        query.includes("jalebi") || query.includes("gulab jamun") || query.includes("halwa") ||
                        query.includes("fries") || query.includes("chips") || query.includes("burger") || query.includes("pizza") ||
                        query.includes("maggi") || query.includes("noodles") || query.includes("chowmein") ||
                        query.includes("cake") || query.includes("pastry") || query.includes("soda") || query.includes("cola") ||
                        query.includes("pepsi") || query.includes("fried");

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

  // Check for portion numbers (e.g. "2 samosas", "2 rotis", "3 eggs")
  let portionMultiplier = 1.0;
  const numMatch = query.match(/(\d+)\s*(samosa|samosas|roti|rotis|phulka|phulkas|paratha|parathas|egg|eggs|toast|cup|cups|slice|slices|scoop|scoops|pcs|pieces)?/i);
  if (numMatch && numMatch[1]) {
    const count = parseInt(numMatch[1], 10);
    if (count >= 2 && count <= 6) {
      portionMultiplier = 0.75 + (count * 0.25);
    }
  }

  // 1. SPECIFIC FRIED SNACKS & JUNK FOOD (Samosa, Pakora, Bhature, Fries, Pizza, Burger)
  if (query.includes("samosa") || query.includes("kachori")) {
    calories = 520; protein_g = 5.5; carbs_g = 64.0; fat_g = 28.0; fiber_g = 2.0; sugar_g = 3.0; sodium_mg = 680;
    category = "Deep-Fried Refined Maida Snack";
    allergens.push("gluten");
    vitamins = ["Trace Minerals"];
    serving_size = "2 pieces (approx 180g)";
  } else if (query.includes("pakora") || query.includes("pakoda") || query.includes("bhajiya")) {
    calories = 480; protein_g = 7.0; carbs_g = 48.0; fat_g = 30.0; fiber_g = 3.0; sugar_g = 2.0; sodium_mg = 620;
    category = "Deep-Fried Besan Fritters";
    serving_size = "1 plate (150g)";
  } else if (query.includes("bhatura") || query.includes("bhature") || query.includes("puri") || query.includes("poori")) {
    calories = 590; protein_g = 11.0; carbs_g = 74.0; fat_g = 29.0; fiber_g = 3.0; sugar_g = 4.0; sodium_mg = 720;
    category = "Deep-Fried Refined Flatbread";
    allergens.push("gluten");
  } else if (query.includes("pizza") || query.includes("burger") || query.includes("fries") || query.includes("chips")) {
    calories = 620; protein_g = 14.0; carbs_g = 78.0; fat_g = 28.0; fiber_g = 2.5; sugar_g = 12.0; sodium_mg = 880;
    category = "High-Calorie Ultra-Processed Meal";
    allergens.push("gluten", "dairy");
  } else if (query.includes("maggi") || query.includes("noodles") || query.includes("chowmein")) {
    calories = 460; protein_g = 8.0; carbs_g = 68.0; fat_g = 18.0; fiber_g = 2.0; sugar_g = 3.0; sodium_mg = 940;
    category = "High-Sodium Instant Refined Noodles";
    allergens.push("gluten");
  } else if (query.includes("gulab jamun") || query.includes("halwa") || query.includes("jalebi") || query.includes("cake")) {
    calories = 420; protein_g = 4.0; carbs_g = 68.0; fat_g = 17.0; fiber_g = 1.0; sugar_g = 52.0; sodium_mg = 120;
    category = "Dense Refined Sugar Confection";
    allergens.push("dairy");
  } 
  // 2. High-Protein Dishes (Paneer / Tofu / Legumes)
  else if (query.includes("paneer") || query.includes("panner") || query.includes("tofu")) {
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
  // 3. Non-Veg & Eggs
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
  // 4. Indian Breakfasts & Breads
  else if (query.includes("poha") || query.includes("upma")) {
    calories = 320; protein_g = 11.5; carbs_g = 52.0; fat_g = 7.5; fiber_g = 4.8; sugar_g = 2.5; sodium_mg = 310;
    category = "Traditional Low-GI Breakfast Grain";
    vitamins = ["Iron", "Vitamin B1", "Potassium"];
  } else if (query.includes("cheela") || query.includes("chilla") || query.includes("dosa") || query.includes("idli")) {
    calories = 325; protein_g = 15.0; carbs_g = 44.0; fat_g = 8.5; fiber_g = 6.0; sugar_g = 2.0; sodium_mg = 290;
    category = "Fermented / Lentil Savory Crepe";
    vitamins = ["Bioavailable Zinc", "Live Enzymes", "Folate"];
  } else if (query.includes("paratha")) {
    calories = 420; protein_g = 14.0; carbs_g = 54.0; fat_g = 16.0; fiber_g = 4.5; sugar_g = 2.0; sodium_mg = 420;
    category = "Wholesome Stuffed Flatbread";
  }
  // 5. Fruits & Veggies
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

  // Apply portion multiplier
  calories = Math.round(calories * portionMultiplier);
  protein_g = Number((protein_g * portionMultiplier).toFixed(1));
  carbs_g = Number((carbs_g * portionMultiplier).toFixed(1));
  fat_g = Number((fat_g * portionMultiplier).toFixed(1));
  fiber_g = Number((fiber_g * portionMultiplier).toFixed(1));

  const isHighProtein = protein_g >= 16.0;

  let score = isJunkOrFried ? 3.8 : (isHighProtein ? 8.8 : 7.8);
  const verdict = isJunkOrFried ? "not_ideal" : (isHighProtein ? "good_fit" : "modify");
  const badge_label = isJunkOrFried ? "🔴 Not Suitable — High Fat & Refined Flour" : (isHighProtein ? "🟢 Optimal Fit — High Protein" : "🟡 Good Fit with Adjustment");

  let rationale = `AI estimated for "${foodName}": ${calories} kcal, ${protein_g}g protein, and ${fat_g}g fat. `;
  if (isJunkOrFried) {
    rationale += `Contains high amounts of refined maida flour and deep-frying saturated/trans fats with very low protein density. Consuming this causes rapid glucose spikes, fat accumulation, and post-meal lethargy.`;
  } else {
    rationale += `Provides wholesome complex carbohydrates and bioavailable amino acids to nourish muscle recovery without causing sudden glycemic spikes.`;
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
    suggestions: isJunkOrFried ? [
      "⚠️ Samosas and fried snacks exceed your daily fat & calorie budget. Swap with a high-protein roasted alternative below.",
      "If eating this, pair with a tall glass of water and raw cucumber salad to blunt the glycemic load."
    ] : [
      "Well-balanced choice! Drink a glass of water to support active nutrient absorption."
    ]
  };
}

// Evaluates Suitability Against Personalized Diet Plan and Generates Explained Alternatives
export function evaluateDietPlanSuitabilityAndAlternatives(foodItem, targetSlot = 'lunch', dietPlan = null, userProfile = {}) {
  const slot = targetSlot.toLowerCase();
  
  const slotTargets = {
    breakfast: { calories: 330, protein: 14.0, name: "Breakfast" },
    lunch: { calories: 480, protein: 18.0, name: "Lunch" },
    snack: { calories: 180, protein: 8.0, name: "Snack" },
    dinner: { calories: 420, protein: 22.0, name: "Dinner" }
  };

  const target = slotTargets[slot] || slotTargets.lunch;
  const calDiff = foodItem.calories - target.calories;
  const foodNameLower = (foodItem.name || "").toLowerCase();

  const isJunkOrFried = foodNameLower.includes("samosa") || foodNameLower.includes("pakora") || foodNameLower.includes("pakoda") ||
                        foodNameLower.includes("kachori") || foodNameLower.includes("bhatura") || foodNameLower.includes("bhature") ||
                        foodNameLower.includes("puri") || foodNameLower.includes("poori") || foodNameLower.includes("jalebi") ||
                        foodNameLower.includes("gulab jamun") || foodNameLower.includes("halwa") || foodNameLower.includes("fries") ||
                        foodNameLower.includes("chips") || foodNameLower.includes("burger") || foodNameLower.includes("pizza") ||
                        foodNameLower.includes("maggi") || foodNameLower.includes("noodles") || foodNameLower.includes("chowmein") ||
                        foodNameLower.includes("cake") || foodNameLower.includes("pastry") || foodNameLower.includes("soda") ||
                        foodNameLower.includes("cola") || foodNameLower.includes("pepsi") || foodNameLower.includes("fried");

  let suitability = 'suitable';
  let badgeText = '🟢 Suitable & Fits Diet Plan Blueprint';
  let badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
  let explanation = '';

  if (isJunkOrFried || calDiff > 200 || (calDiff > 120 && foodItem.protein_g < 10)) {
    suitability = 'not_suitable';
    badgeText = '🔴 NOT SUITABLE for Your Diet Plan';
    badgeColor = 'text-rose-800 bg-rose-100 border-rose-300';
    
    if (isJunkOrFried) {
      explanation = `🚫 "${foodItem.name}" is NOT SUITABLE for your diet plan. Samosas, fried snacks, and junk foods are deep-fried in reused oils and made with refined maida flour. It contains ${foodItem.calories} kcal (exceeding your ${target.name} target by +${Math.max(0, calDiff)} kcal) and high saturated fat (${foodItem.fat_g}g) with poor protein (${foodItem.protein_g}g). This will spike insulin and disrupt your daily nutrition score.`;
    } else {
      explanation = `⚠️ "${foodItem.name}" exceeds your scheduled ${target.name} allowance by +${calDiff} kcal while lacking sufficient protein density (${foodItem.protein_g}g vs ${target.protein}g target).`;
    }
  } else if (Math.abs(calDiff) > 100 || (target.protein - foodItem.protein_g > 5)) {
    suitability = 'partially_suitable';
    badgeText = '🟡 Partially Suitable (Minor Adjustment Needed)';
    badgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
    explanation = `⚡ "${foodItem.name}" can fit into your ${target.name} with minor adjustments. It contains ${foodItem.calories} kcal vs your planned ${target.calories} kcal (${calDiff > 0 ? `+${calDiff} kcal` : `${calDiff} kcal`}) and ${foodItem.protein_g}g protein. Keep your next meal higher in protein and lower in fats.`;
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
        local_availability: "🌱 Local Kirana & Dairy Staple",
        why_better: "Saves excess calories while doubling bioavailable protein (+9g). Made with yellow lentils and fresh paneer for steady 4-hour morning energy."
      },
      {
        name: "Spiced Vegetable Poha with Peanuts & Fresh Curd",
        calories: 330,
        protein_g: 12.5,
        carbs_g: 50.0,
        fat_g: 8.0,
        local_availability: "🌱 100% Everyday Indian Staple",
        why_better: "Light, iron-rich, and non-bloating. Adding probiotic curd balances the glycemic response and prevents hunger spikes."
      },
      {
        name: "Besan Chilla with Onions, Tomatoes & Homemade Dahi",
        calories: 315,
        protein_g: 13.5,
        carbs_g: 44.0,
        fat_g: 7.5,
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
        local_availability: "🌱 Classic Everyday Home Thali",
        why_better: "Complete essential amino acid profile. Pairing toor dal with fresh palak ensures rich iron, fiber, and clean energy without afternoon fatigue."
      },
      {
        name: "Desi Rajma Masala with Steamed Brown/Jeera Rice & Beetroot Raita",
        calories: 495,
        protein_g: 19.0,
        carbs_g: 80.0,
        fat_g: 9.5,
        local_availability: "🌱 High Iron & Folate Powerhouse",
        why_better: "Red kidney beans deliver slow-digesting resistant starch, providing sustained midday focus with 19g of plant protein."
      },
      {
        name: "Amritsari Chole with 2 Multigrain Phulkas & Cucumber Salad",
        calories: 470,
        protein_g: 17.5,
        carbs_g: 74.0,
        fat_g: 10.5,
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
        local_availability: "🌱 Zero Oil • Ready to Eat",
        why_better: "Saves 340+ kcal compared to Samosa, eliminates 25g of trans fats, and provides clean protein and active papain gut enzymes."
      },
      {
        name: "Roasted Fox Nuts (Makhana) with 5 Soaked Badam (Almonds)",
        calories: 175,
        protein_g: 6.5,
        carbs_g: 22.0,
        fat_g: 7.5,
        local_availability: "🌱 Magnesium Rich Lotus Seeds",
        why_better: "Light, crunchy, and packed with heart-healthy magnesium and antioxidants instead of deep-fried refined maida."
      },
      {
        name: "Sprouted Green Moong Chaat with Lemon & Tomatoes",
        calories: 170,
        protein_g: 9.5,
        carbs_g: 28.0,
        fat_g: 2.0,
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
        local_availability: "🌱 High Protein • Easy Night Digestion",
        why_better: "Provides 22.5g of nighttime muscle-repair protein with minimal complex carbs, optimizing restful sleep."
      },
      {
        name: "Palak Paneer (Fresh Spinach) with 2 Soft Phulkas",
        calories: 420,
        protein_g: 21.5,
        carbs_g: 42.0,
        fat_g: 16.0,
        local_availability: "🌱 Seasonal Spinach & Fresh Dairy",
        why_better: "Delivers lutein and calcium without heavy cream. Easily digested within 2 hours before bed."
      },
      {
        name: "Desi Moong Dal Khichdi with A2 Ghee & Fresh Homemade Curd",
        calories: 385,
        protein_g: 16.5,
        carbs_g: 54.0,
        fat_g: 9.5,
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
