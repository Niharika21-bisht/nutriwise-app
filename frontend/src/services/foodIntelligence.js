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
  "paneer", "tofu", "curd", "dahi", "raita", "buttermilk", "chaas", "lassi", "milk", "cheese", "butter", "ghee", "yogurt", "greek yogurt",
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

  // 1. Minimum length check
  if (query.length < 2) {
    return {
      isValid: false,
      reason: "Please enter a valid food name (at least 2 characters)."
    };
  }

  // 2. Reject pure numbers or special symbols
  if (/^[^a-zA-Z]+$/.test(query)) {
    return {
      isValid: false,
      reason: "Food name must contain letters, not just numbers or symbols."
    };
  }

  // 3. Gibberish check: Reject random consonant clusters without vowels (e.g. "asdfgh", "zxcvbnm", "qwrtyp")
  const hasVowels = /[aeiouy]/i.test(query);
  if (!hasVowels && query.length >= 4) {
    return {
      isValid: false,
      reason: `"${inputText}" does not appear to be a recognized word. Please enter a valid meal.`
    };
  }

  // 4. Repeated character gibberish (e.g. "aaaaaa", "zzzzzz")
  if (/(.)\1{4,}/.test(query)) {
    return {
      isValid: false,
      reason: `"${inputText}" is not recognized as a food item. Please enter a meaningful dish name.`
    };
  }

  // 5. Strict Non-Food dictionary check
  const words = query.split(/[\s,+/&]+/).map(w => w.trim()).filter(Boolean);
  for (const word of words) {
    if (NON_FOOD_DICTIONARY.has(word) && !FOOD_KEYWORDS.some(k => query.includes(k))) {
      return {
        isValid: false,
        reason: `"${inputText}" is identified as an object or non-food item. Please enter an edible meal or food item.`
      };
    }
  }

  // 6. Food Keyword and Semantic Check
  const hasFoodMatch = FOOD_KEYWORDS.some(k => query.includes(k));

  // If word is unknown and has zero food tokens
  if (!hasFoodMatch && words.length <= 2) {
    // Check if it sounds like a culinary term (has standard vowels, reasonable length)
    // If it's a completely unknown word not matching any known food
    const isCommonEnglishNonFood = ["book", "car", "room", "door", "table", "chair", "wall", "pencil", "bottle", "road", "sky", "tree", "plant", "shirt", "shoe"].includes(query);
    if (isCommonEnglishNonFood) {
      return {
        isValid: false,
        reason: `"${inputText}" is not an edible food item. Please enter a food dish (e.g. 'Dal Chawal', 'Paneer Tikka', 'Oats', 'Fruit Bowl').`
      };
    }
  }

  return {
    isValid: true,
    cleanQuery: inputText.trim()
  };
}

// AI-driven nutritional calculator for any verified food query
export function estimateNutritionalValues(foodName, userProfile = null) {
  const query = foodName.toLowerCase();
  
  // Default baseline
  let calories = 350;
  let protein_g = 12.0;
  let carbs_g = 48.0;
  let fat_g = 10.0;
  let fiber_g = 4.0;
  let sugar_g = 3.0;
  let sodium_mg = 380;
  let serving_size = "1 standard serving (220g)";
  let category = "Indian / Global Food Item";
  let allergens = [];
  let vitamins = ["Vitamin B-Complex", "Iron", "Magnesium"];

  // 1. Portion quantity multipliers (e.g. "2 rotis", "3 eggs", "2 slices")
  let portionMultiplier = 1.0;
  const numMatch = query.match(/(\d+)\s*(roti|rotis|phulka|chapati|slice|slices|egg|eggs|piece|pieces|cup|cups|bowl|bowls|paratha|parathas|idli|idlis|cheela|dosa)/i);
  if (numMatch && numMatch[1]) {
    const count = parseInt(numMatch[1], 10);
    if (count > 1 && count <= 8) {
      portionMultiplier = Math.min(3.5, 0.65 * count);
    }
  }

  // 2. High-Protein Indian Dishes (Paneer, Tofu, Dal, Soya, Chicken, Eggs)
  if (query.includes("paneer") || query.includes("cottage cheese")) {
    calories = 380; protein_g = 22.0; carbs_g = 18.0; fat_g = 22.0; fiber_g = 3.5;
    category = "High-Protein Dairy / Cottage Cheese";
    allergens.push("dairy");
    vitamins = ["Calcium", "Phosphorus", "Vitamin B12"];
  } else if (query.includes("tofu") || query.includes("soya") || query.includes("soy")) {
    calories = 290; protein_g = 24.0; carbs_g = 14.0; fat_g = 12.0; fiber_g = 6.0;
    category = "Plant-Based Protein";
    allergens.push("soy");
    vitamins = ["Iron", "Calcium", "Isoflavones"];
  } else if (query.includes("dal") || query.includes("lentil") || query.includes("rajma") || query.includes("chole") || query.includes("chana")) {
    calories = 420; protein_g = 18.0; carbs_g = 68.0; fat_g = 8.5; fiber_g = 9.5;
    category = "High-Fiber Legume & Lentil";
    vitamins = ["Folate", "Iron", "Zinc", "Prebiotic Fiber"];
  } else if (query.includes("egg") || query.includes("omelette") || query.includes("bhurji")) {
    calories = 310; protein_g = 20.0; carbs_g = 14.0; fat_g = 16.0; fiber_g = 2.0;
    category = "High Bioavailable Protein";
    allergens.push("egg");
    vitamins = ["Choline", "Vitamin D", "B12", "Lutein"];
  } else if (query.includes("chicken") || query.includes("fish") || query.includes("salmon") || query.includes("mutton")) {
    calories = 480; protein_g = 36.0; carbs_g = 32.0; fat_g = 15.0; fiber_g = 3.0;
    category = "Lean Poultry / Seafood";
    vitamins = ["Niacin", "Selenium", "Omega-3", "Vitamin B6"];
  }

  // 3. Indian Grains & Breads (Roti, Rice, Biryani, Poha, Idli, Dosa)
  if (query.includes("roti") || query.includes("chapati") || query.includes("phulka")) {
    carbs_g += 28.0;
    protein_g += 4.5;
    calories += 140;
    fiber_g += 3.5;
    allergens.push("gluten");
  } else if (query.includes("paratha") || query.includes("naan") || query.includes("bhatura") || query.includes("puri")) {
    carbs_g += 38.0;
    fat_g += 12.0;
    calories += 240;
    allergens.push("gluten");
  }

  if (query.includes("rice") || query.includes("biryani") || query.includes("pulao") || query.includes("khichdi")) {
    carbs_g += 42.0;
    calories += 180;
  }

  if (query.includes("poha") || query.includes("upma") || query.includes("idli") || query.includes("dosa") || query.includes("cheela")) {
    calories = 330; protein_g = 12.0; carbs_g = 54.0; fat_g = 7.5; fiber_g = 5.5;
    category = "Wholesome Breakfast / Fermented Grain";
  }

  // 4. Salads, Fruits & Fitness Foods
  if (query.includes("fruit") || query.includes("apple") || query.includes("banana") || query.includes("mango") || query.includes("papaya") || query.includes("orange")) {
    calories = 175; protein_g = 3.0; carbs_g = 42.0; fat_g = 0.8; fiber_g = 6.5; sugar_g = 24.0; sodium_mg = 15;
    category = "Fresh Fruit / Antioxidant Rich";
    vitamins = ["Vitamin C", "Potassium", "Flavonoids"];
  } else if (query.includes("salad") || query.includes("sprout") || query.includes("cucumber") || query.includes("broccoli") || query.includes("spinach")) {
    calories = 180; protein_g = 9.0; carbs_g = 26.0; fat_g = 3.5; fiber_g = 7.5; sugar_g = 4.0; sodium_mg = 160;
    category = "Micronutrient & Raw Fiber Superfood";
    vitamins = ["Vitamin K", "Vitamin A", "Folate", "Chlorophyll"];
  } else if (query.includes("oats") || query.includes("oatmeal") || query.includes("porridge") || query.includes("muesli")) {
    calories = 290; protein_g = 12.5; carbs_g = 48.0; fat_g = 6.0; fiber_g = 7.5; sugar_g = 3.0; sodium_mg = 90;
    category = "Beta-Glucan Whole Grain";
    vitamins = ["Beta-Glucan", "Manganese", "Phosphorus"];
  } else if (query.includes("protein bar") || query.includes("whey") || query.includes("protein shake")) {
    calories = 230; protein_g = 24.0; carbs_g = 20.0; fat_g = 5.0; fiber_g = 4.0; sugar_g = 2.0; sodium_mg = 180;
    category = "Targeted Protein Supplement";
    allergens.push("dairy");
    vitamins = ["BCAAs", "Glutamine", "Electrolytes"];
  }

  // 5. Junk / Fast Food & Sweets
  if (query.includes("pizza") || query.includes("burger") || query.includes("fries") || query.includes("chips") || query.includes("samosa") || query.includes("noodles") || query.includes("maggi")) {
    calories = 540; protein_g = 14.0; carbs_g = 68.0; fat_g = 24.0; fiber_g = 2.5; sugar_g = 9.0; sodium_mg = 780;
    category = "High-Calorie Refined Meal";
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

  // Score & Diet Fit Calculation
  const isHealthy = !query.includes("pizza") && !query.includes("burger") && !query.includes("chips") && !query.includes("cake") && !query.includes("soda") && !query.includes("fries");
  const isHighProtein = protein_g >= 16.0;

  let score = isHealthy ? (isHighProtein ? 8.8 : 8.0) : 5.2;
  const verdict = isHealthy ? "good_fit" : "modify";
  const badge_label = isHealthy ? `Good Choice — ${score}/10` : `Can Fit with Modification — ${score}/10`;

  let rationale = `AI analysis for "${foodName}": Provides ${calories} kcal and ${protein_g}g of protein. `;
  if (isHealthy) {
    rationale += `Rich in wholesome complex carbohydrates and micronutrients that support your fitness targets without sudden insulin spikes.`;
  } else {
    rationale += `Higher in refined carbohydrates, saturated fats, or sodium. Consider pairing with a fresh salad or lean protein to balance the daily profile.`;
  }

  const suggestions = isHealthy
    ? ["Great nutritional balance! Drink a glass of water to optimize digestion and nutrient uptake."]
    : [
        "Pair with raw cucumbers, carrots, or a bowl of curd to slow glucose absorption.",
        "Keep your subsequent meal higher in clean protein and lower in carbohydrates."
      ];

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
    macro_fit_summary: {
      protein_status: protein_g >= 18 ? "High Density" : protein_g >= 10 ? "Moderate" : "Low Protein",
      carb_status: carbs_g > 60 ? "High Glycemic Energy" : "Balanced Energy",
      fat_status: fat_g > 16 ? "Rich" : "Lean",
      calorie_impact: `${Math.round((calories / 2000) * 100)}% of daily baseline`
    },
    rationale,
    suggestions,
    health_highlights: [
      `Delivers ${protein_g}g bioavailable protein for cellular repair.`,
      `Contains ${fiber_g}g dietary fiber facilitating smooth gut digestion.`
    ]
  };
}
