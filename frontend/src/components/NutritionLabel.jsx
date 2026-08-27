import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function NutritionLabel({ foodItem }) {
  if (!foodItem) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-soft font-sans max-w-sm mx-auto text-slate-900">
      <div className="border-b-8 border-slate-900 pb-1 mb-2">
        <h2 className="text-2xl font-black tracking-tight leading-none">Nutrition Facts</h2>
        <div className="text-xs font-medium text-slate-600 mt-1">Serving size: {foodItem.serving_size}</div>
      </div>

      <div className="border-b-4 border-slate-900 py-1.5 flex justify-between items-baseline">
        <span className="font-extrabold text-sm">Amount Per Serving</span>
      </div>

      <div className="border-b-4 border-slate-900 py-1.5 flex justify-between items-baseline">
        <span className="text-xl font-black">Calories</span>
        <span className="text-3xl font-black">{foodItem.calories}</span>
      </div>

      <div className="text-right text-[11px] font-bold py-1 border-b border-slate-300">
        % Daily Value*
      </div>

      <div className="divide-y divide-slate-200 text-xs">
        <div className="py-1 flex justify-between">
          <span className="font-bold">Total Fat <span className="font-normal">{foodItem.fat_g}g</span></span>
          <span className="font-bold">{Math.round((foodItem.fat_g / 65) * 100)}%</span>
        </div>
        <div className="py-1 flex justify-between pl-4 text-slate-600">
          <span>Sodium <span className="font-normal">{foodItem.sodium_mg || 380}mg</span></span>
          <span className="font-bold">{Math.round(((foodItem.sodium_mg || 380) / 2300) * 100)}%</span>
        </div>
        <div className="py-1 flex justify-between">
          <span className="font-bold">Total Carbohydrate <span className="font-normal">{foodItem.carbs_g}g</span></span>
          <span className="font-bold">{Math.round((foodItem.carbs_g / 275) * 100)}%</span>
        </div>
        <div className="py-1 flex justify-between pl-4 text-slate-600">
          <span>Dietary Fiber {foodItem.fiber_g || 4.2}g</span>
          <span className="font-bold">{Math.round(((foodItem.fiber_g || 4.2) / 28) * 100)}%</span>
        </div>
        <div className="py-1 flex justify-between pl-4 text-slate-600">
          <span>Total Sugars {foodItem.sugar_g || 3.5}g</span>
        </div>
        <div className="py-1 flex justify-between border-t-2 border-slate-900">
          <span className="font-black text-sm">Protein <span className="font-normal">{foodItem.protein_g}g</span></span>
          <span className="font-black text-sm">{Math.round((foodItem.protein_g / 60) * 100)}%</span>
        </div>
      </div>

      {foodItem.allergens && foodItem.allergens.length > 0 && (
        <div className="mt-3 pt-2 border-t-2 border-dashed border-amber-300 bg-amber-50 -mx-4 -mb-4 p-3 rounded-b-xl flex items-center gap-2 text-xs font-semibold text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Allergen Warning: Contains {foodItem.allergens.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
