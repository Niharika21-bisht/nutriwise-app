import React from 'react';
import { Dumbbell, Droplet, Sparkles } from 'lucide-react';

export default function MacroProgress({
  consumedProtein = 58.5,
  targetProtein = 95,
  consumedWater = 1750,
  targetWater = 2400,
  mealBalance = 82
}) {
  const proteinPercent = Math.min(100, Math.round((consumedProtein / Math.max(1, targetProtein)) * 100));
  const waterPercent = Math.min(100, Math.round((consumedWater / Math.max(1, targetWater)) * 100));

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Protein Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
            {proteinPercent}%
          </span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Protein</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {consumedProtein}g <span className="text-slate-400 font-normal text-xs">/ {targetProtein}g</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hydration Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Droplet className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded-md">
            {waterPercent}%
          </span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hydration</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {(consumedWater / 1000).toFixed(1)}L <span className="text-slate-400 font-normal text-xs">/ {(targetWater / 1000).toFixed(1)}L</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meal Balance Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            {mealBalance}%
          </span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Meal Balance</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            High Density
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${mealBalance}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
