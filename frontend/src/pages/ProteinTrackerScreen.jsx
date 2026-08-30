import React, { useState } from 'react';
import { ChevronLeft, Edit2, Plus, Minus, Settings, Dumbbell, Sparkles, Flame, CheckCircle2, Zap, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProteinTrackerScreen() {
  const { todayLog, macroTargets, userProfile, addProteinAmount, removeProteinAmount, updateProteinTarget, setCurrentScreen, showToast } = useApp();

  const [selectedProteinG, setSelectedProteinG] = useState(24); // 6g, 12g, 24g, 30g
  const [editTargetModalOpen, setEditTargetModalOpen] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(macroTargets?.target_protein_g || 117);

  const consumedProtein = Number((todayLog?.consumed_protein_g || 0).toFixed(1));
  const targetProtein = Number(macroTargets?.target_protein_g || 117);
  const fillPercent = Math.min(100, Math.max(0, Math.round((consumedProtein / Math.max(1, targetProtein)) * 100)));
  const remainingProtein = Math.max(0, Number((targetProtein - consumedProtein).toFixed(1)));

  // Calculate protein per kg body weight
  const userWeight = userProfile?.weight_kg || 65;
  const proteinPerKg = (consumedProtein / userWeight).toFixed(2);

  const handleAddProtein = () => {
    addProteinAmount(selectedProteinG);
  };

  const handleRemoveProtein = () => {
    if (consumedProtein <= 0) {
      showToast("Protein intake is already at 0g");
      return;
    }
    removeProteinAmount(selectedProteinG);
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    updateProteinTarget(Number(customTargetInput));
    setEditTargetModalOpen(false);
  };

  const proteinOptions = [
    {
      id: 6,
      amount: 6,
      label: '+6g',
      name: 'Boiled Egg / Milk',
      subtext: '1 Egg or Glass',
      icon: '🥚'
    },
    {
      id: 12,
      amount: 12,
      label: '+12g',
      name: 'Paneer / Yogurt',
      subtext: '100g Paneer/Curd',
      icon: '🧀'
    },
    {
      id: 24,
      amount: 24,
      label: '+24g',
      name: 'Whey Scoop / Soya',
      subtext: '1 Scoop / 50g Soya',
      icon: '🥛'
    },
    {
      id: 30,
      amount: 30,
      label: '+30g',
      name: 'Protein Meal',
      subtext: 'Thali / Chicken',
      icon: '🥗'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 max-w-md mx-auto animate-fadeIn relative pb-28 transition-colors">
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

          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Protein Tracker</h2>
          </div>

          <button
            onClick={() => {
              setCustomTargetInput(targetProtein);
              setEditTargetModalOpen(true);
            }}
            className="p-2 -mr-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Protein Target"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Big Amount Title & Target Display */}
        <div className="text-center mt-3">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-all duration-300">
            {consumedProtein}<span className="text-2xl font-bold text-blue-600 dark:text-blue-400 ml-1">g</span>
          </div>

          <div
            onClick={() => {
              setCustomTargetInput(targetProtein);
              setEditTargetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Target: {targetProtein}g daily</span>
            <Edit2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* 🏋️ Centerpiece: Animated Muscle Protein Synthesis Orb */}
      <div className="my-4 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 shadow-2xl border-[6px] border-white dark:border-slate-800 ring-8 ring-blue-100/60 dark:ring-blue-900/30 flex items-center justify-center p-6 text-center">
          
          {/* Animated Ambient Pulsing Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-blue-400/30 animate-spin" style={{ animationDuration: '24s' }} />
          <div className="absolute inset-5 rounded-full border border-blue-500/20" />

          {/* Glowing Radial Energy Core */}
          <div
            className="absolute inset-0 bg-radial from-blue-500/20 via-transparent to-transparent opacity-80 animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          {/* Center Info Content */}
          <div className="relative z-20 space-y-1 text-white">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-[10px] font-black tracking-wider uppercase text-blue-300">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Muscle Synthesis</span>
            </div>

            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-cyan-200 tracking-tight drop-shadow-md">
              {fillPercent}%
            </div>

            <div className="text-xs font-bold text-blue-200">
              {fillPercent >= 100 ? (
                <span className="text-emerald-400 font-extrabold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved!
                </span>
              ) : (
                <span>Need <strong className="text-white font-black">{remainingProtein}g</strong> more</span>
              )}
            </div>

            <div className="text-[10px] text-blue-300/80 font-medium pt-1">
              Current: {proteinPerKg}g per kg bodyweight
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: [-] and [+ 24g Protein] */}
      <div className="flex items-center gap-3 px-2 mb-3">
        <button
          onClick={handleRemoveProtein}
          className="w-14 h-14 rounded-2xl bg-blue-100/90 dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center font-black text-2xl shadow-sm border border-blue-200 dark:border-slate-700"
          title="Remove protein log"
        >
          <Minus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={handleAddProtein}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white font-black text-lg shadow-lg shadow-blue-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform" />
          <span>+ {selectedProteinG}g Protein</span>
        </button>
      </div>

      {/* High-Protein Quick Presets Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">Quick Protein Fuel</span>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Select source</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {proteinOptions.map((opt) => {
            const isSelected = selectedProteinG === opt.amount;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedProteinG(opt.amount)}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 shadow-md scale-[1.03]'
                    : 'border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/70 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className={`text-xs font-black mt-1.5 ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[65px]">
                  {opt.name}
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
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Set Daily Protein Target</h3>
              </div>
              <button
                onClick={() => setEditTargetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized target based on your bodyweight ({userWeight} kg) and fitness goals.
            </p>

            <form onSubmit={handleSaveTarget} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target (in grams):
                </label>
                <input
                  type="number"
                  min={30}
                  max={300}
                  step={5}
                  required
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5">
                {[80, 100, 120, 140].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCustomTargetInput(val)}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    {val}g
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/30 hover:opacity-95"
              >
                Save Protein Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
