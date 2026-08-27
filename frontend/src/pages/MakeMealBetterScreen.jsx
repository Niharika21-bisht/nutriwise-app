import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, TrendingDown, TrendingUp, Flame, Dumbbell, ShieldCheck, ChefHat, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_MEAL_IMPROVEMENT_PROMPTS } from '../data/sampleData';
import { improveMealApi } from '../services/api';

export default function MakeMealBetterScreen() {
  const { userProfile, activeMealUpgrade, setActiveMealUpgrade, showToast } = useApp();
  const [mealInput, setMealInput] = useState("Pizza + Cold Drink");
  const [loading, setLoading] = useState(false);

  const handleImproveMeal = async (queryText) => {
    const text = queryText || mealInput;
    if (!text.trim()) return;

    setLoading(true);
    showToast("Analyzing meal composition & generating optimal upgrade... ✨");
    try {
      const result = await improveMealApi(text, userProfile);
      setActiveMealUpgrade(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-black mb-2 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Meal Optimization Engine
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Make My Meal Better
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Craving something specific? Enter your meal plan, and we'll upgrade it with smarter ingredients and balanced macros without losing taste.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
          What are you planning to eat?
        </label>
        <div className="relative">
          <input
            type="text"
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="e.g. Pizza + Cold Drink, Samosa + Chai, Burger..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Or pick a popular combination:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_MEAL_IMPROVEMENT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setMealInput(prompt);
                  handleImproveMeal(prompt);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                  mealInput === prompt
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleImproveMeal(mealInput)}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing Nutritional Balance...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Improve My Meal</span>
            </>
          )}
        </button>
      </div>

      {/* Upgrade Result View */}
      {activeMealUpgrade && (
        <div className="space-y-4 animate-fadeIn">
          {/* Side by Side / Comparative Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Original Meal */}
            <div className="bg-slate-100/90 p-4 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Standard Version
                </span>
                <span className="text-xs font-black text-slate-700">
                  {activeMealUpgrade.original_macros.calories} kcal
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {activeMealUpgrade.original_meal}
              </h4>
              <div className="flex gap-3 text-xs text-slate-500 mt-2">
                <span>P: {activeMealUpgrade.original_macros.protein}g</span>
                <span>C: {activeMealUpgrade.original_macros.carbs}g</span>
                <span>F: {activeMealUpgrade.original_macros.fat}g</span>
                {activeMealUpgrade.original_macros.sugar !== undefined && (
                  <span className="text-rose-600 font-bold">Sugar: {activeMealUpgrade.original_macros.sugar}g</span>
                )}
              </div>
            </div>

            {/* Improved Version */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 p-4 rounded-3xl border-2 border-emerald-500 shadow-soft">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  NutriWise Upgraded Version
                </span>
                <span className="text-xs font-black text-emerald-800">
                  {activeMealUpgrade.improved_macros.calories} kcal
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {activeMealUpgrade.improved_meal}
              </h4>
              <div className="flex gap-3 text-xs text-emerald-900 font-bold mt-2">
                <span>P: {activeMealUpgrade.improved_macros.protein}g</span>
                <span>C: {activeMealUpgrade.improved_macros.carbs}g</span>
                <span>F: {activeMealUpgrade.improved_macros.fat}g</span>
                <span>Fiber: {activeMealUpgrade.improved_macros.fiber}g</span>
              </div>
            </div>
          </div>

          {/* Macro Improvement Metric Badges */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(activeMealUpgrade.macro_improvements).map(([key, val], idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-soft text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase block capitalize">
                  {key} Impact
                </span>
                <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Key Changes Breakdown */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Key Nutritional Swaps
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {activeMealUpgrade.key_changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* "Why?" Rationale */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-3xl shadow-soft space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why We Recommend This?</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {activeMealUpgrade.why_explanation}
            </p>
          </div>

          {/* Chef / Prep Tips */}
          {activeMealUpgrade.recipe_tips && activeMealUpgrade.recipe_tips.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-3xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <ChefHat className="w-4 h-4 text-amber-700" />
                <span>Kitchen & Cooking Tip</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1">
                {activeMealUpgrade.recipe_tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
