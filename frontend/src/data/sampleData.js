// NutriWise Sample Data & Presets

export const DEFAULT_USER_PROFILE = {
  name: "Niharika",
  email: "niharika@example.com",
  age: 24,
  gender: "female",
  user_type: "general", // "general" | "athlete"
  sport: "Running",
  goal: "overall_fitness", // "overall_fitness", "calorie_awareness", "protein_focused", "hydration", "vitamins_minerals", "muscle_strength", "weight_management"
  custom_goal: "",
  meal_frequency: "3_meals", // "2_meals", "3_meals", "3_meals_snacks", "other"
  height_cm: 165,
  weight_kg: 59,
  dietary_preference: "vegetarian", // "vegetarian", "non_vegetarian", "vegan", "eggetarian"
  allergies: [], // ["dairy", "nuts", "gluten"]
};

export const SPORTS_LIST = [
  { id: "running", name: "Running / Athletics", icon: "🏃‍♀️" },
  { id: "weightlifting", name: "Gym & Weightlifting", icon: "🏋️‍♂️" },
  { id: "boxing", name: "Boxing / Combat Sports", icon: "🥊" },
  { id: "swimming", name: "Swimming", icon: "🏊‍♀️" },
  { id: "gymnastics", name: "Gymnastics / Yoga", icon: "🤸‍♀️" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "football", name: "Football / Soccer", icon: "⚽" },
  { id: "other", name: "Other Sports", icon: "🏅" }
];

export const GOALS_LIST = [
  { id: "overall_fitness", title: "Overall Fitness & Energy", desc: "Balanced macros, vitality, and gut health", icon: "🔥", color: "from-emerald-500 to-teal-600" },
  { id: "calorie_awareness", title: "Calorie & Weight Control", desc: "Manage caloric density and portion sizes", icon: "⚡", color: "from-amber-500 to-orange-600" },
  { id: "protein_focused", title: "High Protein Intake", desc: "Muscle repair, satiety, and athletic power", icon: "💪", color: "from-blue-500 to-indigo-600" },
  { id: "hydration", title: "Hydration & Detox", desc: "Optimal electrolyte and fluid equilibrium", icon: "💧", color: "from-cyan-500 to-blue-500" },
  { id: "vitamins_minerals", title: "Vitamins & Micronutrients", desc: "Immunity, antioxidant defenses & vitality", icon: "🥬", color: "from-green-500 to-emerald-600" },
  { id: "muscle_strength", title: "Muscle Hypertrophy", desc: "Slight surplus with optimal protein timing", icon: "🏋️", color: "from-purple-500 to-indigo-600" },
  { id: "weight_management", title: "Lean Body Composition", desc: "Sustained fat loss with preserved lean mass", icon: "⚖️", color: "from-rose-500 to-pink-600" }
];

export const MEAL_FREQUENCIES = [
  { id: "2_meals", title: "2 Meals / Day", desc: "Intermittent fasting style (e.g. Brunch + Dinner)", icon: "🍽️" },
  { id: "3_meals", title: "3 Meals / Day", desc: "Classic Breakfast, Lunch, and Dinner pattern", icon: "🍽️" },
  { id: "3_meals_snacks", title: "3 Meals + Snacks", desc: "Evenly spaced meals with pre/post snack boosts", icon: "🍱" },
  { id: "other", title: "Flexible Grazing", desc: "Multiple small portions tailored to workout times", icon: "🥗" }
];

export const DIETARY_PREFERENCES = [
  { id: "vegetarian", title: "Vegetarian", desc: "Plant-based foods + dairy products (Paneer, Curd, Ghee)", icon: "🥦" },
  { id: "non_vegetarian", title: "Non-Vegetarian", desc: "Includes eggs, poultry, fish, seafood & meats", icon: "🍗" },
  { id: "vegan", title: "100% Vegan", desc: "Purely plant foods (No dairy, eggs, honey or gelatin)", icon: "🌱" },
  { id: "eggetarian", title: "Eggetarian", desc: "Vegetarian diet supplemented with farm-fresh eggs", icon: "🥚" }
];

export const ALLERGY_OPTIONS = [
  { id: "none", label: "None / No known allergies" },
  { id: "dairy", label: "Lactose / Dairy sensitive" },
  { id: "nuts", label: "Tree Nuts & Peanuts" },
  { id: "gluten", label: "Gluten / Wheat sensitive" },
  { id: "soy", label: "Soy & Soy derivatives" },
  { id: "shellfish", label: "Shellfish / Seafood" }
];

export const SAMPLE_SCAN_PRESETS = [
  {
    id: "paneer-sandwich",
    type: "meal",
    name: "Paneer Tikka Sandwich",
    tag: "Plate Scan",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Grilled multigrain sandwich with spiced paneer, mint chutney & bell peppers"
  },
  {
    id: "dal-rice",
    type: "meal",
    name: "Dal Tadka with Steamed Rice & Sabzi",
    tag: "Plate Scan",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Yellow toor dal with steamed basmati rice and roasted spiced vegetables"
  },
  {
    id: "greek-salad",
    type: "meal",
    name: "Mediterranean Greek Salad with Feta",
    tag: "Plate Scan",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Cucumbers, cherry tomatoes, kalamata olives, red onion & crumbled feta"
  },
  {
    id: "protein-bar-label",
    type: "label",
    name: "Whey Crisp High Protein Bar (Packaged Label)",
    tag: "Label OCR",
    image: "https://images.unsplash.com/photo-1622484216298-500b1442c554?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Packaged nutrition facts label showing 20g protein, 2g sugar"
  },
  {
    id: "potato-chips-label",
    type: "label",
    name: "Classic Salted Potato Chips (Packaged Label)",
    tag: "Label OCR",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Packaged snack food label showing high sodium and saturated fats"
  },
  {
    id: "fruit-bowl",
    type: "food",
    name: "Seasonal Fruit & Roasted Chana Bowl",
    tag: "Food Item",
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Fresh sliced apples, papaya, pomegranate and roasted chickpeas"
  }
];

export const SAMPLE_MEAL_IMPROVEMENT_PROMPTS = [
  "Pizza + Cold Drink",
  "Burger + French Fries",
  "Samosa + Masala Chai",
  "Chicken Biryani + Gulab Jamun",
  "Instant Fried Noodles + Cold Soda",
  "Chole Bhature + Lassi"
];
