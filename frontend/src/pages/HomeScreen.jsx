import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, UtensilsCrossed, Plus, Droplets, ArrowRight, CheckCircle2, XCircle, Clock, Flame, Dumbbell, ShieldCheck, AlertTriangle, Edit3, RotateCcw, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScoreGauge from '../components/ScoreGauge';
import MacroProgress from '../components/MacroProgress';
import CameraModal from '../components/CameraModal';
import { analyzeScannedFood } from '../services/api';

export default function HomeScreen() {
  const {
    userProfile,
    macroTargets,
    dietPlan,
    todayLog,
    toggleMealCompleted,
    logPlannedMeal,
    unlogMeal,
    skipMeal,
    addWaterGlass,
    setCurrentScreen,
    setActiveScanResult,
    showToast
  } = useApp();

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('meal');
  const [targetSlotForScan, setTargetSlotForScan] = useState('lunch');
  const [liveCurrentTime, setLiveCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenScanner = (mode = 'meal', slotId = 'lunch') => {
    setCameraMode(mode);
    setTargetSlotForScan(slotId);
    setCameraModalOpen(true);
  };

  const handleScanCompleted = async ({ foodName, scanType, image, parsedData }) => {
    setCameraModalOpen(false);
    showToast(`Analyzing scanned ${targetSlotForScan}... 🧠`);
    try {
      const result = await analyzeScannedFood(
        foodName,
        userProfile,
        {
          calories: todayLog.consumed_calories,
          protein_g: todayLog.consumed_protein_g
        },
        parsedData
      );
      result.scannedImage = image;
      result.preferredSlot = targetSlotForScan;
      setActiveScanResult(result);
      setCurrentScreen('food_analysis');
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeGreeting = () => {
    const hour = liveCurrentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getActiveMealSlotId = () => {
    const hour = liveCurrentTime.getHours();
    const minutes = liveCurrentTime.getMinutes();
    const timeVal = hour * 60 + minutes;

    if (timeVal >= 300 && timeVal < 690) return 'breakfast';
    if (timeVal >= 690 && timeVal < 930) return 'lunch';
    if (timeVal >= 930 && timeVal < 1170) return 'snack';
    return 'dinner';
  };

  const activeSlotId = getActiveMealSlotId();

  const renderAvatar = () => {
    if (userProfile.profile_image) {
      if (userProfile.profile_image.startsWith('data:image') || userProfile.profile_image.startsWith('http')) {
        return <img src={userProfile.profile_image} alt="User" className="w-full h-full object-cover" />;
      }
      return <span className="text-xl">{userProfile.profile_image}</span>;
    }
    return <span className="font-extrabold">{userProfile.name ? userProfile.name[0].toUpperCase() : 'N'}</span>;
  };

  const formattedTimeStr = liveCurrentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDateStr = liveCurrentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Get planned meals from Day 1 of diet plan
  const plannedDayMeals = dietPlan?.days?.[0]?.meals || dietPlan?.meals || [];

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Live Time & Date Status Pill */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-extrabold text-[10px]">
            Live Sync
          </span>
          <span className="text-slate-700 dark:text-slate-200 font-extrabold">{formattedTimeStr}</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">{formattedDateStr}</span>
      </div>

      {/* User Greeting Bar with Avatar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {getTimeGreeting()}
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {userProfile.name || 'Niharika'} 👋
          </h2>
        </div>
        <button
          onClick={() => setCurrentScreen('profile')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform overflow-hidden border-2 border-white dark:border-slate-800"
        >
          {renderAvatar()}
        </button>
      </div>

      {/* 1. Today's Nutrition Score circular gauge */}
      <ScoreGauge
        score={todayLog.score || 0}
        delta={(todayLog.score || 0) > 0 ? (todayLog.score >= 75 ? 6 : -4) : 0}
        label="Today's Nutrition Score"
      />

      {/* 2. Today's Progress Rings & Bars */}
      <MacroProgress
        consumedProtein={todayLog.consumed_protein_g || 0}
        targetProtein={macroTargets.target_protein_g}
        consumedWater={todayLog.water_ml || 0}
        targetWater={macroTargets.target_water_ml}
        mealBalance={(todayLog.score || 0) >= 80 ? 88 : (todayLog.score || 0) > 0 ? 65 : 0}
      />

      {/* 3. Quick Action Cards */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Live Input Actions
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Scan Food Card */}
          <button
            onClick={() => handleOpenScanner('meal', activeSlotId)}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-emerald-200 dark:hover:border-emerald-600 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Scan Meal</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Camera / OCR</div>
            </div>
          </button>

          {/* Type Meal Name Card */}
          <button
            onClick={() => setCurrentScreen('scan')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-teal-200 dark:hover:border-teal-600 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Type Dish</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">AI Input</div>
            </div>
          </button>

          {/* Water Tracker Action Card */}
          <button
            onClick={() => setCurrentScreen('water_tracker')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-cyan-200 dark:hover:border-cyan-600 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Water Log</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Open Tracker ➔</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Live Today's Meal Schedule with Intelligent Action Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Live Meals Schedule
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-2">
              ({(todayLog.meals || []).filter(m => m.status === 'completed' && m.calories > 0).length}/{(todayLog.meals || []).length} Logged)
            </span>
          </div>
          <button
            onClick={() => setCurrentScreen('diet_plan')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>Weekly Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {(todayLog.meals || []).map((meal) => {
            const isCompleted = (meal.status === 'completed' || meal.completed) && meal.calories > 0;
            const isSkipped = meal.status === 'skipped';
            const isCurrentActiveTime = meal.id === activeSlotId && !isCompleted && !isSkipped;
            const plannedForThisSlot = plannedDayMeals.find(m => m.meal_type.toLowerCase() === meal.id.toLowerCase());

            let cardBg = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-soft";
            if (isCompleted) cardBg = "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800";
            if (isSkipped) cardBg = "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 opacity-75";
            if (isCurrentActiveTime) cardBg = "bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/50 shadow-md";

            return (
              <div
                key={meal.id}
                className={`p-4 rounded-3xl border transition-all space-y-2.5 ${cardBg}`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Status Circle Button */}
                    <button
                      onClick={() => toggleMealCompleted(meal.id)}
                      title={isCompleted ? "Click to reset" : "Click to log planned meal"}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : isSkipped
                          ? 'bg-rose-500 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      {isSkipped ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {meal.type} • {meal.time || userProfile.meal_timings?.[meal.id] || "Schedule"}
                        </span>
                        {isCurrentActiveTime && (
                          <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-200/80 dark:bg-emerald-900/80 px-1.5 py-0.2 rounded-full animate-pulse">
                            🟢 Active Time
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/80 px-1.5 py-0.2 rounded">
                            Skipped (0 pts)
                          </span>
                        )}
                      </div>

                      {/* Display Meal Title */}
                      <h4 className={`text-xs font-black mt-0.5 ${
                        isSkipped ? 'line-through text-slate-400 dark:text-slate-500' : isCompleted ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {isCompleted ? meal.name : plannedForThisSlot ? `Planned: ${plannedForThisSlot.title}` : `${meal.type} (Pending Log)`}
                      </h4>
                    </div>
                  </div>

                  {/* Right Calories */}
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {isCompleted ? `${meal.calories} kcal` : isSkipped ? '0 kcal' : plannedForThisSlot ? `${plannedForThisSlot.calories} kcal` : '—'}
                    </div>
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {meal.protein}g protein
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. STATE: COMPLETED MEAL */}
                {isCompleted && (
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{meal.fit_message || "Diet Plan Fit verified"}</span>
                    </div>
                    <button
                      onClick={() => unlogMeal(meal.id)}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                )}

                {/* 2. STATE: PENDING MEAL ACTIONS (Log Planned OR Scan/Type) */}
                {!isCompleted && !isSkipped && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex gap-2">
                      {/* 1-Tap Log Planned Meal Button */}
                      {plannedForThisSlot && (
                        <button
                          onClick={() => logPlannedMeal(meal.id)}
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-extrabold shadow-sm flex items-center justify-center gap-1 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Ate Planned ({plannedForThisSlot.calories} kcal)</span>
                        </button>
                      )}

                      {/* Scan or Type Custom Food */}
                      <button
                        onClick={() => handleOpenScanner('meal', meal.id)}
                        className="py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Scan / Type</span>
                      </button>

                      {/* Skip Meal */}
                      <button
                        onClick={() => skipMeal(meal.id)}
                        className="py-1.5 px-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-[11px] font-bold transition-all"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={cameraModalOpen}
        defaultMode={cameraMode}
        onClose={() => setCameraModalOpen(false)}
        onScanComplete={handleScanCompleted}
      />
    </div>
  );
}
