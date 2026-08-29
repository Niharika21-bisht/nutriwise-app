import React, { useState } from 'react';
import { Clock, Flame, Dumbbell, Check, Sparkles, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function FoodCard({
  mealType = "Breakfast",
  title,
  description,
  calories,
  protein,
  carbs,
  fat,
  prepTime = "15 mins",
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
  const [activePrepTime, setActivePrepTime] = useState(prepTime);
  const [activeIngredients, setActiveIngredients] = useState(ingredients);
  const [activeDescription, setActiveDescription] = useState(description);

  const handleSelectAlternative = (alt) => {
    setActiveMealTitle(alt.title);
    setActiveCalories(alt.calories);
    setActiveProtein(alt.protein_g);
    setActiveCarbs(alt.carbs_g);
    setActiveFat(alt.fat_g);
    if (alt.prep_time) setActivePrepTime(alt.prep_time);
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
        ? 'bg-emerald-50/60 border-emerald-200'
        : 'bg-white border-slate-100 shadow-soft hover:shadow-card'
    }`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
            mealType === 'Breakfast' ? 'bg-amber-100 text-amber-800' :
            mealType === 'Lunch' ? 'bg-emerald-100 text-emerald-800' :
            mealType === 'Snack' ? 'bg-purple-100 text-purple-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {mealType}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3 h-3" />
            {activePrepTime}
          </span>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-full border transition-all ${
              completed
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'border-slate-300 text-transparent hover:border-emerald-500'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Main Title & Description */}
      <h4 className={`text-sm font-black text-slate-800 leading-snug ${completed ? 'line-through text-slate-500' : ''}`}>
        {activeMealTitle}
      </h4>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
        {activeDescription}
      </p>

      {/* Macro Numbers */}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 font-extrabold text-slate-700">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{activeCalories} <span className="font-normal text-[10px] text-slate-400">kcal</span></span>
        </div>
        <div className="flex items-center gap-1 font-extrabold text-blue-600">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{activeProtein}g <span className="font-normal text-[10px] text-slate-400">protein</span></span>
        </div>
        {activeCarbs !== undefined && (
          <div className="text-slate-500 font-bold">
            {activeCarbs}g <span className="text-[10px] text-slate-400">carbs</span>
          </div>
        )}
        {activeFat !== undefined && (
          <div className="text-slate-500 font-bold">
            {activeFat}g <span className="text-[10px] text-slate-400">fat</span>
          </div>
        )}
      </div>

      {/* Ingredients Pills */}
      {activeIngredients && activeIngredients.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {activeIngredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              {ing}
            </span>
          ))}
          {activeIngredients.length > 3 && (
            <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-semibold">
              +{activeIngredients.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 🔄 Interactive Meal Alternative Options Drawer */}
      {altList.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>{altList.length} Equivalent Nutrient Options Available</span>
            </div>
            {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAlternatives && (
            <div className="mt-2 space-y-2 animate-fadeIn">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                Tap to Swap into your plan:
              </span>
              {altList.map((alt, altIdx) => {
                const isCurrent = alt.title === activeMealTitle;
                return (
                  <div
                    key={altIdx}
                    onClick={() => handleSelectAlternative(alt)}
                    className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                          <span className={`text-xs font-black ${isCurrent ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {alt.title}
                          </span>
                        </div>
                        {alt.description && (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{alt.description}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}>
                        {isCurrent ? "Selected" : "Select"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1.5 text-[10px] font-bold text-slate-600">
                      <span className="text-amber-700">🔥 {alt.calories} kcal</span>
                      <span className="text-blue-700">💪 {alt.protein_g}g protein</span>
                      {alt.carbs_g && <span className="text-slate-500">🌾 {alt.carbs_g}g carbs</span>}
                      {alt.prep_time && <span className="text-slate-400">⏱️ {alt.prep_time}</span>}
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
