import React, { useState } from 'react';
import { Camera, Sparkles, UtensilsCrossed, Plus, Droplets, ArrowRight, CheckCircle2, XCircle, Clock, Flame, Dumbbell, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScoreGauge from '../components/ScoreGauge';
import MacroProgress from '../components/MacroProgress';
import CameraModal from '../components/CameraModal';
import { analyzeScannedFood } from '../services/api';

export default function HomeScreen() {
  const {
    userProfile,
    macroTargets,
    todayLog,
    toggleMealCompleted,
    skipMeal,
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

  const renderAvatar = () => {
    if (userProfile.profile_image) {
      if (userProfile.profile_image.startsWith('data:image') || userProfile.profile_image.startsWith('http')) {
        return <img src={userProfile.profile_image} alt="User" className="w-full h-full object-cover" />;
      }
      return <span className="text-xl">{userProfile.profile_image}</span>;
    }
    return <span className="font-extrabold">{userProfile.name ? userProfile.name[0].toUpperCase() : 'N'}</span>;
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* User Greeting Bar with Avatar */}
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
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform overflow-hidden border-2 border-white"
        >
          {renderAvatar()}
        </button>
      </div>

      {/* 1. Today's Nutrition Score circular gauge */}
      <ScoreGauge
        score={todayLog.score || 75}
        delta={todayLog.score >= 75 ? 6 : -4}
        label="Today's Nutrition Score"
      />

      {/* 2. Today's Progress Rings & Bars */}
      <MacroProgress
        consumedProtein={todayLog.consumed_protein_g}
        targetProtein={macroTargets.target_protein_g}
        consumedWater={todayLog.water_ml}
        targetWater={macroTargets.target_water_ml}
        mealBalance={todayLog.score >= 80 ? 88 : 72}
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
              <div className="text-xs font-bold text-slate-800">Scan Meal</div>
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
              <div className="text-[10px] text-amber-100 font-semibold">Make Better</div>
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
              <div className="text-[10px] text-slate-400 font-medium">3-Day Plan</div>
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
            <div className="text-xs font-bold text-slate-800">Hydration Intake</div>
            <div className="text-[11px] text-slate-500">
              {todayLog.water_ml} ml / {macroTargets.target_water_ml} ml target
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

      {/* 5. Today's Meals Timeline with Diet Fit Status & Skip option */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Today's Meals Schedule
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-2">
              ({todayLog.meals.filter(m => m.status === 'completed' || m.completed).length}/{todayLog.meals.length} Logged)
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

        <div className="space-y-3">
          {todayLog.meals.map((meal) => {
            const isCompleted = meal.status === 'completed' || meal.completed;
            const isSkipped = meal.status === 'skipped';

            let cardBg = "bg-white border-slate-100 shadow-soft";
            if (isCompleted) cardBg = "bg-emerald-50/60 border-emerald-200";
            if (isSkipped) cardBg = "bg-rose-50/50 border-rose-200/80 opacity-75";

            return (
              <div
                key={meal.id}
                className={`p-3.5 rounded-2xl border transition-all ${cardBg}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMealCompleted(meal.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : isSkipped
                          ? 'bg-rose-500 text-white'
                          : 'border-2 border-slate-300 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      {isSkipped ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {meal.type} • {meal.time || userProfile.meal_timings?.[meal.id] || "Schedule"}
                        </span>
                        {isSkipped && (
                          <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                            Skipped (0 pts)
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-bold ${isSkipped ? 'line-through text-slate-400' : isCompleted ? 'text-slate-800' : 'text-slate-800'}`}>
                        {meal.name}
                      </div>
                    </div>
                  </div>

                  {/* Right side calories & action */}
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs font-extrabold text-slate-700">
                      {isSkipped ? '0' : meal.calories} kcal
                    </div>
                    {!isCompleted && !isSkipped && (
                      <button
                        onClick={() => skipMeal(meal.id)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 mt-1"
                      >
                        Skip Meal
                      </button>
                    )}
                  </div>
                </div>

                {/* Diet Plan Fit Evaluation Status Banner */}
                {isCompleted && meal.diet_fit && (
                  <div className={`mt-2.5 pt-2 border-t text-[11px] font-semibold flex items-center gap-1.5 ${
                    meal.diet_fit === 'fits_plan'
                      ? 'border-emerald-200 text-emerald-800'
                      : meal.diet_fit === 'minor_variance'
                      ? 'border-amber-200 text-amber-800'
                      : 'border-rose-200 text-rose-800'
                  }`}>
                    {meal.diet_fit === 'fits_plan' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{meal.fit_message || "Diet Plan Fit verified"}</span>
                  </div>
                )}
              </div>
            );
          })}
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
