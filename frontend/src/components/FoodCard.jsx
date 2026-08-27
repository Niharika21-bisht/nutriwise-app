import React from 'react';
import { Clock, Flame, Dumbbell, Check, CheckCircle2 } from 'lucide-react';

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
  completed = false,
  onToggle
}) {
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 ${
      completed
        ? 'bg-emerald-50/60 border-emerald-200'
        : 'bg-white border-slate-100 shadow-soft hover:shadow-card'
    }`}>
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
            {prepTime}
          </span>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-full border transition-all ${
              completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 text-transparent hover:border-emerald-500'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>

      <h4 className={`text-sm font-bold text-slate-800 ${completed ? 'line-through text-slate-500' : ''}`}>
        {title}
      </h4>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Macro Pills */}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 font-bold text-slate-700">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{calories} <span className="font-normal text-[10px] text-slate-400">kcal</span></span>
        </div>
        <div className="flex items-center gap-1 font-bold text-blue-600">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{protein}g <span className="font-normal text-[10px] text-slate-400">protein</span></span>
        </div>
        {carbs !== undefined && (
          <div className="text-slate-500 font-medium">
            {carbs}g <span className="text-[10px] text-slate-400">carbs</span>
          </div>
        )}
        {fat !== undefined && (
          <div className="text-slate-500 font-medium">
            {fat}g <span className="text-[10px] text-slate-400">fat</span>
          </div>
        )}
      </div>

      {ingredients && ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
              {ing}
            </span>
          ))}
          {ingredients.length > 3 && (
            <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
              +{ingredients.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
