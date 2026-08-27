import React, { useState } from 'react';
import { Camera, Sparkles, UtensilsCrossed, Plus, Droplets, ArrowRight, CheckCircle2, Circle, Flame, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScoreGauge from '../components/ScoreGauge';
import MacroProgress from '../components/MacroProgress';
import CameraModal from '../components/CameraModal';
import FoodCard from '../components/FoodCard';
import { analyzeScannedFood } from '../services/api';

export default function HomeScreen() {
  const {
    userProfile,
    macroTargets,
    todayLog,
    toggleMealCompleted,
    addWaterGlass,
    setCurrentScreen,
    setActiveScanResult,
    showToast
  } = useApp();

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('meal');

  const handleOpenScanner = (mode = 'meal') => {
    setCameraMode(mode);
    setCameraModalOpen(true);
  };

  const handleScanCompleted = async ({ foodName, scanType, image }) => {
    setCameraModalOpen(false);
    showToast("Analyzing scanned meal... 🧠");
    try {
      const result = await analyzeScannedFood(foodName, userProfile, {
        calories: todayLog.consumed_calories,
        protein_g: todayLog.consumed_protein_g
      });
      result.scannedImage = image;
      setActiveScanResult(result);
      setCurrentScreen('food_analysis');
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* User Greeting Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {getTimeGreeting()}
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {userProfile.name || 'Niharika'} 👋
          </h2>
        </div>
        <button
          onClick={() => setCurrentScreen('profile')}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
        >
          {userProfile.name ? userProfile.name[0].toUpperCase() : 'N'}
        </button>
      </div>

      {/* 1. Today's Nutrition Score circular gauge */}
      <ScoreGauge
        score={todayLog.score || 78}
        delta={6}
        label="Today's Nutrition Score"
      />

      {/* 2. Today's Progress Rings & Bars */}
      <MacroProgress
        consumedProtein={todayLog.consumed_protein_g}
        targetProtein={macroTargets.target_protein_g}
        consumedWater={todayLog.water_ml}
        targetWater={macroTargets.target_water_ml}
        mealBalance={84}
      />

      {/* 3. Quick Action Cards */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Quick Actions
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Scan Food Card */}
          <button
            onClick={() => handleOpenScanner('meal')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-emerald-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800">Scan Food</div>
              <div className="text-[10px] text-slate-400 font-medium">Plate & Label</div>
            </div>
          </button>

          {/* Make My Meal Better Card */}
          <button
            onClick={() => setCurrentScreen('make_meal_better')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-soft hover:shadow-card hover:opacity-95 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black">Upgrade Meal</div>
              <div className="text-[10px] text-amber-100 font-semibold">Make it Better</div>
            </div>
          </button>

          {/* Diet Plan Card */}
          <button
            onClick={() => setCurrentScreen('diet_plan')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-emerald-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800">Diet Plan</div>
              <div className="text-[10px] text-slate-400 font-medium">Daily Schedule</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Hydration Quick Tracker */}
      <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/60 p-4 rounded-3xl border border-cyan-100/80 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Hydration Tracker</div>
            <div className="text-[11px] text-slate-500">
              {todayLog.water_ml} ml / {macroTargets.target_water_ml} ml logged today
            </div>
          </div>
        </div>

        <button
          onClick={addWaterGlass}
          className="px-3 py-1.5 rounded-xl bg-white text-cyan-700 font-extrabold text-xs border border-cyan-200 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          +250 ml
        </button>
      </div>

      {/* 5. Today's Meals Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Today's Meals
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-2">
              ({todayLog.meals.filter(m => m.completed).length}/{todayLog.meals.length} Completed)
            </span>
          </div>
          <button
            onClick={() => setCurrentScreen('diet_plan')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>Full Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {todayLog.meals.map((meal) => (
            <div
              key={meal.id}
              onClick={() => toggleMealCompleted(meal.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                meal.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                  : 'bg-white border-slate-100 shadow-soft hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMealCompleted(meal.id);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    meal.completed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 text-transparent hover:border-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {meal.type} • {meal.time}
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${meal.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {meal.name}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-extrabold text-slate-700">{meal.calories} kcal</div>
                <div className="text-[10px] font-semibold text-blue-600">{meal.protein}g protein</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Modal component */}
      <CameraModal
        isOpen={cameraModalOpen}
        defaultMode={cameraMode}
        onClose={() => setCameraModalOpen(false)}
        onScanComplete={handleScanCompleted}
      />
    </div>
  );
}
