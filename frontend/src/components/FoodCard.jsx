import React, { useState } from 'react';
import { Flame, Dumbbell, Check, Sparkles, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, MapPin } from 'lucide-react';

export default function FoodCard({
  mealType = "Breakfast",
  title,
  description,
  calories,
  protein,
  carbs,
  fat,
  ingredients = [],
  alternatives = [],
  completed = false,
  onToggle,
  onSwapMeal
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeMealTitle, setActiveMealTitle] = useState(title);
  const [activeCalories, setActiveCalories] = useState(calories);
  const [activeProtein, setActiveProtein] = useState(protein);
  const [activeCarbs, setActiveCarbs] = useState(carbs);
  const [activeFat, setActiveFat] = useState(fat);
  const [activeIngredients, setActiveIngredients] = useState(ingredients);
  const [activeDescription, setActiveDescription] = useState(description);

  const handleSelectAlternative = (alt) => {
    setActiveMealTitle(alt.title);
    setActiveCalories(alt.calories);
    setActiveProtein(alt.protein_g);
    setActiveCarbs(alt.carbs_g);
    setActiveFat(alt.fat_g);
    if (alt.ingredients) setActiveIngredients(alt.ingredients);
    if (alt.description) setActiveDescription(alt.description);

    if (onSwapMeal) {
      onSwapMeal(mealType, alt);
    }
  };

  const altList = alternatives && alternatives.length > 0 ? alternatives : [];

  return (
    <div className={`p-4 rounded-3xl border transition-all duration-200 ${
      completed
        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card'
    }`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
            mealType === 'Breakfast' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
            mealType === 'Lunch' ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' :
            mealType === 'Snack' ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300' :
            'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
          }`}>
            {mealType}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local & In-Season</span>
          </span>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-full border transition-all ${
              completed
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Main Title & Description */}
      <h4 className={`text-sm font-black text-slate-800 dark:text-white leading-snug ${completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
        {activeMealTitle}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
        {activeDescription}
      </p>

      {/* Macro Numbers */}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1 font-extrabold text-slate-700 dark:text-slate-200">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{activeCalories} <span className="font-normal text-[10px] text-slate-400 dark:text-slate-500">kcal</span></span>
        </div>
        <div className="flex items-center gap-1 font-extrabold text-blue-600 dark:text-blue-400">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{activeProtein}g <span className="font-normal text-[10px] text-slate-400 dark:text-slate-500">protein</span></span>
        </div>
        {activeCarbs !== undefined && (
          <div className="text-slate-500 dark:text-slate-400 font-bold">
            {activeCarbs}g <span className="text-[10px] text-slate-400 dark:text-slate-500">carbs</span>
          </div>
        )}
        {activeFat !== undefined && (
          <div className="text-slate-500 dark:text-slate-400 font-bold">
            {activeFat}g <span className="text-[10px] text-slate-400 dark:text-slate-500">fat</span>
          </div>
        )}
      </div>

      {/* Ingredients Pills */}
      {activeIngredients && activeIngredients.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {activeIngredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200/60 dark:border-slate-700">
              {ing}
            </span>
          ))}
          {activeIngredients.length > 3 && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-md font-semibold border border-slate-200/60 dark:border-slate-700">
              +{activeIngredients.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 🔄 Seasonal & Local Equivalent Options Drawer */}
      {altList.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 text-[11px] font-bold flex items-center justify-between transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{altList.length} In-Season & Local Market Options</span>
            </div>
            {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAlternatives && (
            <div className="mt-2 space-y-2 animate-fadeIn">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                Practical, seasonal alternatives from local Mandi & Kirana:
              </span>
              {altList.map((alt, altIdx) => {
                const isCurrent = alt.title === activeMealTitle;
                return (
                  <div
                    key={altIdx}
                    onClick={() => handleSelectAlternative(alt)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                          <span className={`text-xs font-black ${isCurrent ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-100'}`}>
                            {alt.title}
                          </span>
                        </div>
                        {alt.local_availability && (
                          <span className="inline-block mt-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded">
                            {alt.local_availability}
                          </span>
                        )}
                        {alt.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{alt.description}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex-shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                      }`}>
                        {isCurrent ? "✓ Active" : "Swap"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <span className="text-amber-700 dark:text-amber-400 font-black">🔥 {alt.calories} kcal</span>
                      <span className="text-blue-700 dark:text-blue-400 font-black">💪 {alt.protein_g}g protein</span>
                      {alt.carbs_g && <span className="text-slate-500 dark:text-slate-400">🌾 {alt.carbs_g}g carbs</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
