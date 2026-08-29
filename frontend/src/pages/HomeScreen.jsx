import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, UtensilsCrossed, Plus, Droplets, ArrowRight, CheckCircle2, XCircle, Clock, Flame, Dumbbell, ShieldCheck, AlertTriangle, Edit3 } from 'lucide-react';
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
  const [liveCurrentTime, setLiveCurrentTime] = useState(new Date());

  // Real-time ticking clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenScanner = (mode = 'meal') => {
    setCameraMode(mode);
    setCameraModalOpen(true);
  };

  const handleScanCompleted = async ({ foodName, scanType, image, parsedData }) => {
    setCameraModalOpen(false);
    showToast("Analyzing scanned meal & nutrition profile... 🧠");
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

  // Determine current active meal based on live real-time clock
  const getActiveMealSlotId = () => {
    const hour = liveCurrentTime.getHours();
    const minutes = liveCurrentTime.getMinutes();
    const timeVal = hour * 60 + minutes;

    if (timeVal >= 300 && timeVal < 690) return 'breakfast'; // 5:00 AM - 11:30 AM
    if (timeVal >= 690 && timeVal < 930) return 'lunch';     // 11:30 AM - 3:30 PM
    if (timeVal >= 930 && timeVal < 1170) return 'snack';    // 3:30 PM - 7:30 PM
    return 'dinner';                                         // 7:30 PM - 5:00 AM
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

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Live Time & Date Status Pill */}
      <div className="flex items-center justify-between bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-700 uppercase tracking-wider font-extrabold text-[10px]">
            Live Sync
          </span>
          <span className="text-slate-700 font-extrabold">{formattedTimeStr}</span>
        </div>
        <span className="text-slate-500 text-[11px] font-semibold">{formattedDateStr}</span>
      </div>

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
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Live Input Actions
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
              <div className="text-[10px] text-slate-400 font-medium">Camera / OCR</div>
            </div>
          </button>

          {/* Type Meal Name Card */}
          <button
            onClick={() => setCurrentScreen('scan')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-teal-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800">Type Dish</div>
              <div className="text-[10px] text-slate-400 font-medium">AI Input</div>
            </div>
          </button>

          {/* Quick Water Button */}
          <button
            onClick={addWaterGlass}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-cyan-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800">+250ml Water</div>
              <div className="text-[10px] text-cyan-600 font-bold">1-Tap Log</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Live Today's Meal Schedule with Active Real-Time Highlight */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Live Meals Schedule
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-2">
              ({(todayLog.meals || []).filter(m => m.status === 'completed' || m.completed).length}/{(todayLog.meals || []).length} Logged)
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
            const isCompleted = meal.status === 'completed' || meal.completed;
            const isSkipped = meal.status === 'skipped';
            const isCurrentActiveTime = meal.id === activeSlotId && !isCompleted && !isSkipped;

            let cardBg = "bg-white border-slate-100 shadow-soft";
            if (isCompleted) cardBg = "bg-emerald-50/60 border-emerald-200";
            if (isSkipped) cardBg = "bg-rose-50/50 border-rose-200/80 opacity-75";
            if (isCurrentActiveTime) cardBg = "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md";

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
                        {isCurrentActiveTime && (
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded-full animate-pulse">
                            🟢 Active Meal Time
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                            Skipped (0 pts)
                          </span>
                        )}
                      </div>
                      <div
                        onClick={() => !isCompleted && !isSkipped && handleOpenScanner('meal')}
                        className={`text-xs font-bold cursor-pointer ${isSkipped ? 'line-through text-slate-400' : isCompleted ? 'text-slate-800' : 'text-slate-500 hover:text-emerald-700'}`}
                      >
                        {meal.name || `${meal.type} (Tap to Scan or Type Meal)`}
                      </div>
                    </div>
                  </div>

                  {/* Right side calories & action */}
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs font-extrabold text-slate-700">
                      {isCompleted ? `${meal.calories} kcal` : isSkipped ? '0 kcal' : '—'}
                    </div>
                    {!isCompleted && !isSkipped && (
                      <button
                        onClick={() => skipMeal(meal.id)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 mt-1"
                      >
                        Skip Meal
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-[9px] font-bold text-emerald-600 mt-0.5">
                        ✓ Recorded
                      </span>
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
