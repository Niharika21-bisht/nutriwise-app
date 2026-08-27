import React from 'react';
import { UtensilsCrossed, Sparkles, RefreshCw, Flame, Dumbbell, Clock, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/FoodCard';

export default function DietPlanScreen() {
  const { userProfile, macroTargets, dietPlan, loadingDietPlan, updateProfile, setCurrentScreen, showToast } = useApp();

  const handleRegenerate = () => {
    showToast("Re-optimizing diet blueprint... 🔄");
    // Trigger plan refresh with slight variation
    updateProfile({ ...userProfile });
  };

  const meals = dietPlan?.meals || [
    {
      meal_type: "Breakfast",
      title: "Spiced Vegetable Poha + Low-Fat Curd",
      description: "Flattened pressed rice tossed with carrots, green peas, peanuts and turmeric, paired with probiotic curd.",
      calories: 330,
      protein_g: 12.5,
      carbs_g: 50.0,
      fat_g: 8.0,
      fiber_g: 5.0,
      prep_time: "15 mins",
      ingredients: ["Thick Poha", "Fresh Curd", "Green Peas & Carrots", "Roasted Peanuts", "Curry Leaves"]
    },
    {
      meal_type: "Lunch",
      title: "Dal Tadka + Steamed Basmati Rice + Paneer Bhurji & Mixed Greens",
      description: "High-protein midday thali providing complete amino acid profile and steady complex carbohydrates.",
      calories: 520,
      protein_g: 26.0,
      carbs_g: 74.0,
      fat_g: 13.0,
      fiber_g: 8.5,
      prep_time: "25 mins",
      ingredients: ["Toor Dal Lentils", "Steamed Basmati Rice", "Fresh Paneer (120g)", "Cucumber Salad"]
    },
    {
      meal_type: "Snack",
      title: "Seasonal Papaya / Apple + Dry Roasted Spiced Chana",
      description: "Low-glycemic afternoon snack rich in soluble fiber and clean plant protein.",
      calories: 195,
      protein_g: 8.0,
      carbs_g: 34.0,
      fat_g: 3.0,
      fiber_g: 6.8,
      prep_time: "5 mins",
      ingredients: ["Fresh Apple / Papaya", "Roasted Chickpeas (Chana)", "Chaat Masala"]
    },
    {
      meal_type: "Dinner",
      title: "Multigrain Rotis (2) + Palak Paneer & Mixed Vegetable Stir-Fry",
      description: "Light and digestible dinner rich in calcium, iron, and magnesium to facilitate overnight tissue repair.",
      calories: 440,
      protein_g: 22.0,
      carbs_g: 48.0,
      fat_g: 17.5,
      fiber_g: 7.5,
      prep_time: "20 mins",
      ingredients: ["Multigrain Phulkas (2)", "Baby Spinach Palak Puree", "Paneer Cubes", "Steamed Veggies"]
    }
  ];

  const totalCalories = dietPlan?.total_calories || meals.reduce((a, b) => a + b.calories, 0);
  const totalProtein = dietPlan?.total_protein_g || Number(meals.reduce((a, b) => a + b.protein_g, 0).toFixed(1));

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Personalized Blueprint
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Today's Diet Plan
          </h2>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={loadingDietPlan}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loadingDietPlan ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Plan Macro Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-card flex items-center justify-around">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
            <Flame className="w-3.5 h-3.5" />
            <span>Total Energy</span>
          </div>
          <div className="text-xl font-black mt-0.5">{totalCalories}</div>
          <div className="text-[10px] text-emerald-200 uppercase">kcal / day</div>
        </div>

        <div className="w-[1px] h-9 bg-emerald-400/40" />

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Target Protein</span>
          </div>
          <div className="text-xl font-black mt-0.5">{totalProtein}g</div>
          <div className="text-[10px] text-emerald-200 uppercase">High Density</div>
        </div>

        <div className="w-[1px] h-9 bg-emerald-400/40" />

        <div className="text-center">
          <div className="text-[11px] font-semibold text-emerald-100">Meals</div>
          <div className="text-xl font-black mt-0.5">{meals.length}</div>
          <div className="text-[10px] text-emerald-200 uppercase">Scheduled</div>
        </div>
      </div>

      {/* "Why this plan?" Scientific Explanation Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Why this plan fits you?
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
          {dietPlan?.why_this_plan ||
            `Designed specifically for ${userProfile.name} (${userProfile.dietary_preference || 'Vegetarian'}) to maximize your ${userProfile.goal?.replace('_', ' ') || 'overall fitness'} goals. It ensures steady glycogen balance and distributes ${totalProtein}g of high-value protein across waking hours.`}
        </p>
      </div>

      {/* Meal Items Schedule */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Meal Breakdown
        </span>

        {meals.map((meal, index) => (
          <FoodCard
            key={index}
            mealType={meal.meal_type}
            title={meal.title}
            description={meal.description}
            calories={meal.calories}
            protein={meal.protein_g}
            carbs={meal.carbs_g}
            fat={meal.fat_g}
            prepTime={meal.prep_time}
            ingredients={meal.ingredients}
          />
        ))}
      </div>

      {/* Lifestyle & Hydration Guidelines */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Dietary Best Practices</span>
        </div>

        <ul className="space-y-2 text-xs text-slate-600">
          {(dietPlan?.lifestyle_tips || [
            `Maintain a steady hydration target of ${(macroTargets.target_water_ml / 1000).toFixed(1)}L today.`,
            "Conclude dinner at least 2.5 hours before sleep to support melatonin release.",
            "Add a splash of fresh lemon over your greens to maximize non-heme iron absorption."
          ]).map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
