import React, { useState } from 'react';
import { ChevronLeft, Edit2, Plus, Minus, Settings, Droplets, Sparkles, Check, Flame, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WaterTrackerScreen() {
  const { todayLog, macroTargets, addWaterAmount, removeWaterAmount, updateWaterTarget, setCurrentScreen, showToast } = useApp();

  const [selectedCapacity, setSelectedCapacity] = useState(500); // 100, 250, 300, 500
  const [editTargetModalOpen, setEditTargetModalOpen] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(macroTargets?.target_water_ml || 2500);

  const consumedWater = todayLog?.water_ml || 0;
  const targetWater = macroTargets?.target_water_ml || 2500;
  const fillPercent = Math.min(100, Math.max(0, Math.round((consumedWater / Math.max(1, targetWater)) * 100)));

  const handleAddWater = () => {
    addWaterAmount(selectedCapacity);
  };

  const handleRemoveWater = () => {
    if (consumedWater <= 0) {
      showToast("Water intake is already at 0 ml");
      return;
    }
    removeWaterAmount(selectedCapacity);
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    updateWaterTarget(Number(customTargetInput));
    setEditTargetModalOpen(false);
  };

  const cupOptions = [
    {
      id: 100,
      label: '100 ml',
      name: 'Small Cup',
      renderIcon: () => (
        <svg className="w-7 h-7 mx-auto" viewBox="0 0 24 24" fill="none">
          <path d="M4 8C4 13.5 7.5 17 12 17C16.5 17 20 13.5 20 8H4Z" fill="#0284c7" />
          <path d="M20 9C21.1 9 22 9.9 22 11C22 12.1 21.1 13 20 13" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 250,
      label: '250 ml',
      name: 'Medium Cup',
      renderIcon: () => (
        <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none">
          <path d="M3 7C3 14 7 18 12 18C17 18 21 14 21 7H3Z" fill="#0284c7" />
          <path d="M21 9C22.1 9 23 9.9 23 11C23 12.1 22.1 13 21 13" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 300,
      label: '300 ml',
      name: 'Glass',
      renderIcon: () => (
        <svg className="w-7 h-9 mx-auto" viewBox="0 0 24 24" fill="none">
          <path d="M5 4L7 20C7.2 21.1 8 22 9.1 22H14.9C16 22 16.8 21.1 17 20L19 4H5Z" fill="#0ea5e9" />
          <path d="M5 4H19" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 500,
      label: '500 ml',
      name: 'Bottle',
      renderIcon: () => (
        <svg className="w-6 h-10 mx-auto" viewBox="0 0 24 24" fill="none">
          <path d="M10 2H14V4H10V2Z" fill="#0284c7" />
          <path d="M9 4H15V6C16.1 6 17 6.9 17 8V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V8C7 6.9 7.9 6 9 6V4Z" fill="#0284c7" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 max-w-md mx-auto animate-fadeIn relative pb-28 transition-colors">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 -ml-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Water Tracker</h2>

          <button
            onClick={() => {
              setCustomTargetInput(targetWater);
              setEditTargetModalOpen(true);
            }}
            className="p-2 -mr-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Water Target"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Big Amount Title & Editable Target */}
        <div className="text-center mt-3">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-all duration-300">
            {consumedWater}<span className="text-2xl font-bold text-slate-700 dark:text-slate-300 ml-1">ml</span>
          </div>

          <div
            onClick={() => {
              setCustomTargetInput(targetWater);
              setEditTargetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors group"
          >
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Target: {targetWater} ml</span>
            <Edit2 className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* 🌊 Centerpiece: Big Animated Liquid Wave Sphere */}
      <div className="my-4 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative overflow-hidden bg-sky-50/80 dark:bg-slate-900/90 shadow-2xl border-[6px] border-white dark:border-slate-800 ring-8 ring-sky-100/50 dark:ring-cyan-900/30 flex flex-col justify-end">
          
          {/* Subtle percentage overlay in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <span className={`text-4xl font-black transition-colors duration-500 ${fillPercent > 55 ? 'text-white/95 drop-shadow-md' : 'text-sky-900/80'}`}>
              {fillPercent}%
            </span>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-500 ${fillPercent > 55 ? 'text-white/80' : 'text-sky-600'}`}>
              {fillPercent >= 100 ? 'Goal Reached 🏆' : 'Hydration Level'}
            </span>
          </div>

          {/* Liquid Container with Dynamic Height */}
          <div
            className="w-full relative transition-all duration-1000 ease-out"
            style={{ height: `${Math.max(6, Math.min(100, fillPercent))}%` }}
          >
            {/* Back Wave */}
            <div className="absolute -top-7 left-0 right-0 w-[200%] h-10 animate-wave-back opacity-50 pointer-events-none">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-sky-300">
                <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,-30 1200,30 L1200,120 L0,120 Z" />
              </svg>
            </div>

            {/* Front Wave */}
            <div className="absolute -top-7 left-0 right-0 w-[200%] h-10 animate-wave-front opacity-85 pointer-events-none">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-sky-400">
                <path d="M0,30 C150,-30 400,100 600,20 C800,-50 1050,70 1200,10 L1200,120 L0,120 Z" />
              </svg>
            </div>

            {/* Main Fluid Body Gradient */}
            <div className="w-full h-full bg-gradient-to-b from-sky-400 via-cyan-400 to-sky-500 relative overflow-hidden">
              {/* Floating Bubbles */}
              <div className="absolute bottom-2 left-1/4 w-2.5 h-2.5 bg-white/40 rounded-full animate-bubble-1" />
              <div className="absolute bottom-1 left-1/2 w-3.5 h-3.5 bg-white/40 rounded-full animate-bubble-2" />
              <div className="absolute bottom-3 left-3/4 w-2 h-2 bg-white/40 rounded-full animate-bubble-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: [-] and [+ 500 ml] */}
      <div className="flex items-center gap-3 px-2 mb-3">
        <button
          onClick={handleRemoveWater}
          className="w-14 h-14 rounded-2xl bg-sky-100/90 dark:bg-slate-800 text-sky-700 dark:text-cyan-400 hover:bg-sky-200 dark:hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center font-black text-2xl shadow-sm border border-sky-200 dark:border-slate-700"
          title="Remove water"
        >
          <Minus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={handleAddWater}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-500 to-sky-500 text-white font-black text-lg shadow-lg shadow-sky-500/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span>{selectedCapacity} ml</span>
        </button>
      </div>

      {/* Cup Capacity Selection Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">Cup Capacity</span>
          <span className="text-[11px] font-bold text-sky-600 dark:text-cyan-400">Select preset</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {cupOptions.map((cup) => {
            const isSelected = selectedCapacity === cup.id;
            return (
              <button
                key={cup.id}
                onClick={() => setSelectedCapacity(cup.id)}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-emerald-400 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-md scale-[1.03]'
                    : 'border border-slate-100 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-800 hover:border-sky-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="h-10 flex items-center justify-center">
                  {cup.renderIcon()}
                </div>
                <span className={`text-xs font-black mt-2 ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cup.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Edit Modal */}
      {editTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-cyan-900/50 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Set Daily Water Target</h3>
              </div>
              <button
                onClick={() => setEditTargetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your hydration goal based on your climate, activity level, and body weight.
            </p>

            <form onSubmit={handleSaveTarget} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target (in milliliters):
                </label>
                <input
                  type="number"
                  min={1000}
                  max={6000}
                  step={100}
                  required
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5">
                {[2000, 2500, 3000, 3500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCustomTargetInput(val)}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    {val} ml
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-400 to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-500/30 hover:opacity-95"
              >
                Save Water Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
