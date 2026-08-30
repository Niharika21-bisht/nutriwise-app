import React from 'react';
import { Dumbbell, Droplet, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MacroProgress({
  consumedProtein = 58.5,
  targetProtein = 95,
  consumedWater = 1750,
  targetWater = 2400,
  mealBalance = 82
}) {
  const { setCurrentScreen } = useApp();

  const proteinPercent = Math.min(100, Math.round((consumedProtein / Math.max(1, targetProtein)) * 100));
  const waterPercent = Math.min(100, Math.round((consumedWater / Math.max(1, targetWater)) * 100));

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* 🏋️ Interactive Protein Card (Opens Protein Tracker Screen on Tap) */}
      <div
        onClick={() => setCurrentScreen('protein_tracker')}
        className="bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-600 shadow-soft hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-95 relative overflow-hidden"
        title="Tap to open Animated Protein & Muscle Tracker"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Dumbbell className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/80 px-1.5 py-0.5 rounded-md">
            {proteinPercent}%
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Protein</span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">Track ➔</span>
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
            {consumedProtein}g <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px]">/ {targetProtein}g</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 💧 Interactive Hydration Card (Opens Water Tracker Screen on Tap) */}
      <div
        onClick={() => setCurrentScreen('water_tracker')}
        className="bg-gradient-to-b from-white to-sky-50/50 dark:from-slate-900 dark:to-cyan-950/30 p-3 rounded-2xl border border-sky-100 dark:border-cyan-900/40 hover:border-sky-300 dark:hover:border-cyan-600 shadow-soft hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-95 relative overflow-hidden"
        title="Tap to open Animated Water Tracker"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Droplet className="w-3.5 h-3.5 fill-cyan-500 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-900/80 px-1.5 py-0.5 rounded-md">
            {waterPercent}%
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hydration</span>
            <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">Track ➔</span>
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
            {(consumedWater / 1000).toFixed(1)}L <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px]">/ {(targetWater / 1000).toFixed(1)}L</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ✨ Interactive Meal Balance Card (Opens Meal Balance Screen on Tap) */}
      <div
        onClick={() => setCurrentScreen('meal_balance')}
        className="bg-gradient-to-b from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-soft hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-95 relative overflow-hidden"
        title="Tap to open Meal Balance & Golden Ratio Screen"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/80 px-1.5 py-0.5 rounded-md">
            {mealBalance}%
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meal Balance</span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">View ➔</span>
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
            {mealBalance >= 80 ? 'Golden Ratio' : 'High Density'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
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
