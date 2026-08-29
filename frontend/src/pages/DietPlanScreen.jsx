import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, RefreshCw, Flame, Dumbbell, Clock, Info, CheckCircle2, ShoppingBag, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/FoodCard';

export default function DietPlanScreen() {
  const { userProfile, macroTargets, dietPlan, loadingDietPlan, updateProfile, showToast } = useApp();
  const [selectedDayTab, setSelectedDayTab] = useState(1); // 1, 2, 3

  const handleRegenerate = () => {
    showToast("Re-optimizing 3-day diet blueprint... 🔄");
    updateProfile({ ...userProfile });
  };

  const daysList = dietPlan?.days || [
    {
      day_number: 1,
      day_label: "Day 1 (Today)",
      tagline: "Metabolic Kickstart & Balanced Glycemic Energy",
      meals: dietPlan?.meals || [],
      total_calories: 1445,
      total_protein_g: 68.5,
      why_this_plan: `Designed for ${userProfile.name} to establish steady insulin balance and sustain ${userProfile.goal?.replace('_', ' ')} goals.`
    }
  ];

  const activeDay = daysList.find(d => d.day_number === selectedDayTab) || daysList[0];
  const meals = activeDay.meals || [];

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            3-Day Advance Schedule
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Personalized Diet Plan
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

      {/* 3-Day Tab Switcher */}
      <div className="bg-slate-100 p-1 rounded-2xl flex">
        {daysList.map((day) => (
          <button
            key={day.day_number}
            onClick={() => setSelectedDayTab(day.day_number)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center ${
              selectedDayTab === day.day_number
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{day.day_label.split(' ')[0]} {day.day_label.split(' ')[1]}</span>
            <span className="text-[10px] font-medium opacity-75">{day.day_label.includes('Today') ? 'Today' : day.day_label.includes('Tomorrow') ? 'Tomorrow' : 'Day 3'}</span>
          </button>
        ))}
      </div>

      {/* Plan Macro Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-card flex items-center justify-around">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
            <Flame className="w-3.5 h-3.5" />
            <span>Target Energy</span>
          </div>
          <div className="text-xl font-black mt-0.5">{activeDay.total_calories}</div>
          <div className="text-[10px] text-emerald-200 uppercase">kcal / day</div>
        </div>

        <div className="w-[1px] h-9 bg-emerald-400/40" />

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Target Protein</span>
          </div>
          <div className="text-xl font-black mt-0.5">{activeDay.total_protein_g}g</div>
          <div className="text-[10px] text-emerald-200 uppercase">High Density</div>
        </div>

        <div className="w-[1px] h-9 bg-emerald-400/40" />

        <div className="text-center">
          <div className="text-[11px] font-semibold text-emerald-100">Meals</div>
          <div className="text-xl font-black mt-0.5">{meals.length}</div>
          <div className="text-[10px] text-emerald-200 uppercase">Planned</div>
        </div>
      </div>

      {/* Day Rationale Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-3xl space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{activeDay.tagline || 'Nutritional Objective'}</span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
          {activeDay.why_this_plan ||
            `Designed specifically for ${userProfile.name} (${userProfile.dietary_preference || 'Vegetarian'}) to support ${userProfile.goal?.replace('_', ' ') || 'overall fitness'}.`}
        </p>
      </div>

      {/* Meal Items Schedule */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          {activeDay.day_label} Schedule
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

      {/* Advance Grocery & Prep List for 3 Days */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>3-Day Advance Grocery Checklist</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">Smart Prep</span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-600">
          {(dietPlan?.advance_grocery_list || [
            "Thick Poha & Rolled Oats",
            "Yellow Moong Dal & Red Kidney Beans (Rajma)",
            "Fresh Artisanal Paneer / Tofu (400g)",
            "Probiotic Curd (500g)",
            "Spinach, Bell Peppers, Carrots & Cucumbers",
            "Dry Roasted Chana & Makhana"
          ]).map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prep Ahead Tips */}
      <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-black text-amber-900">
          <Calendar className="w-4 h-4 text-amber-700" />
          <span>Advance Meal Preparation Tips</span>
        </div>
        <ul className="space-y-1.5 text-xs text-amber-800">
          {(dietPlan?.advance_prep_tips || [
            "Soak Rajma (Kidney beans) tonight in water for tomorrow's high-protein lunch.",
            "Start sprouting green moong beans today for Day 3 live enzyme snack.",
            "Keep curd refrigerated and set aside multigrain flour for fresh evening rotis."
          ]).map((tip, i) => (
            <li key={i}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
