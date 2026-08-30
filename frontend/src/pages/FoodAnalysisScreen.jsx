import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Flame, Dumbbell, Sparkles, ChevronDown, ChevronUp, Plus, ShieldCheck, Eye, EyeOff, Ban, RefreshCw, Check, ArrowRight, MapPin, Zap, AlertOctagon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { evaluateDietPlanSuitabilityAndAlternatives } from '../services/foodIntelligence';

export default function FoodAnalysisScreen() {
  const { activeScanResult, setCurrentScreen, logCustomScannedMeal, userProfile, dietPlan, showToast } = useApp();
  const [selectedSlot, setSelectedSlot] = useState(activeScanResult?.preferredSlot || 'lunch');
  const [showFullLabel, setShowFullLabel] = useState(false);

  // If scan resulted in non-food / rejection or invalid item
  if (!activeScanResult || activeScanResult.is_valid_food === false) {
    return (
      <div className="pb-28 px-4 pt-4 max-w-md mx-auto space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('scan')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Scanner</span>
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Ban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-rose-900">Food Item Not Recognized</h3>
            <p className="text-xs text-rose-800 mt-2 leading-relaxed font-medium">
              {activeScanResult?.error_message || "The scanned frame or entered text is not recognized as an edible food item on the internet/database."}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setCurrentScreen('scan')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-enter / Scan Valid Food</span>
            </button>
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full py-2.5 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    food_item = { name: "Scanned Meal", calories: 380, protein_g: 15.0, carbs_g: 54.0, fat_g: 12.0, category: "Balanced Meal", serving_size: "1 portion" },
    scannedImage
  } = activeScanResult;

  // Run in-depth Diet Plan Suitability & Explained Alternatives Engine
  const suitabilityAnalysis = evaluateDietPlanSuitabilityAndAlternatives(
    food_item,
    selectedSlot,
    dietPlan,
    userProfile
  );

  const isNotSuitable = suitabilityAnalysis.suitability === 'not_suitable';
  const isPartiallySuitable = suitabilityAnalysis.suitability === 'partially_suitable';

  let verdictBg = "bg-emerald-50 border-emerald-300 text-emerald-950";
  let scoreBadgeColor = "bg-emerald-600 text-white";
  let verdictIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
  let displayScore = isNotSuitable ? 3.8 : isPartiallySuitable ? 6.5 : 8.8;

  if (isPartiallySuitable) {
    verdictBg = "bg-amber-50 border-amber-300 text-amber-950";
    scoreBadgeColor = "bg-amber-500 text-white";
    verdictIcon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
  } else if (isNotSuitable) {
    verdictBg = "bg-rose-50 border-rose-300 text-rose-950";
    scoreBadgeColor = "bg-rose-600 text-white";
    verdictIcon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
  }

  const handleConfirmLogScanned = () => {
    logCustomScannedMeal(food_item, selectedSlot);
  };

  const handleSwapToAlternativeAndLog = (alt) => {
    logCustomScannedMeal(
      {
        name: alt.name,
        calories: alt.calories,
        protein_g: alt.protein_g,
        carbs_g: alt.carbs_g,
        fat_g: alt.fat_g,
        category: "Healthy Plan Alternative",
        serving_size: "1 balanced portion"
      },
      selectedSlot
    );
    showToast(`Logged healthy alternative "${alt.name}" for ${selectedSlot}! 🥗`);
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-4 animate-fadeIn transition-colors">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('scan')}
          className="p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scanner</span>
        </button>
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          AI Nutrition Intelligence
        </span>
      </div>

      {/* 1. Image Preview & Food Title */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-soft">
        {scannedImage && (
          <div className="relative h-44 w-full bg-slate-900">
            <img src={scannedImage} alt={food_item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                {food_item.category}
              </span>
              <h3 className="text-lg font-black leading-tight drop-shadow-sm">{food_item.name}</h3>
              <span className="text-xs text-slate-300 font-medium">{food_item.serving_size}</span>
            </div>
          </div>
        )}

        {!scannedImage && (
          <div className={`p-4 border-b ${isNotSuitable ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950/40 border-emerald-100 dark:border-slate-800'}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${isNotSuitable ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {food_item.category}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{food_item.name}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{food_item.serving_size}</span>
          </div>
        )}

        {/* Master Suitability Status Banner */}
        <div className={`p-4 border-t border-b ${verdictBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            {verdictIcon}
            <div>
              <div className="text-xs font-black">{suitabilityAnalysis.badgeText}</div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {isNotSuitable
                  ? "Exceeds calorie/fat budget with low protein density"
                  : `Evaluated against your Daily Calorie & Macronutrient Targets`}
              </div>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-sm flex-shrink-0 ${scoreBadgeColor}`}>
            {displayScore} / 10
          </div>
        </div>

        {/* Macro Numbers Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 text-center bg-white dark:bg-slate-900">
          <div className={`p-2 rounded-2xl border ${isNotSuitable && food_item.calories > 450 ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100'}`}>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Calories</span>
            <span className="text-sm font-black">{food_item.calories}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">kcal</span>
          </div>

          <div className={`p-2 rounded-2xl border ${food_item.protein_g < 8 ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' : 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-200'}`}>
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase block">Protein</span>
            <span className="text-sm font-black">{food_item.protein_g}g</span>
            <span className="text-[9px] text-blue-400 dark:text-blue-300 block">{food_item.protein_g < 8 ? 'Low' : 'Density'}</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Carbs</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{food_item.carbs_g}g</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Energy</span>
          </div>

          <div className={`p-2 rounded-2xl border ${food_item.fat_g > 20 ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100'}`}>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Fat</span>
            <span className="text-sm font-black">{food_item.fat_g}g</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">{food_item.fat_g > 20 ? 'High' : 'Lipids'}</span>
          </div>
        </div>
      </div>

      {/* 2. 🎯 Personalized Diet Plan Suitability Card with In-Depth Explanation */}
      <div className={`p-4 rounded-3xl border shadow-soft space-y-3 ${isNotSuitable ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Diet Plan Suitability Evaluation
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${suitabilityAnalysis.badgeColor}`}>
            {suitabilityAnalysis.badgeText}
          </span>
        </div>

        {/* Detailed Suitability Explanation */}
        <div className={`p-3.5 rounded-2xl border text-xs font-medium leading-relaxed space-y-2 ${isNotSuitable ? 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
          <p>{suitabilityAnalysis.explanation}</p>
        </div>

        {/* Slot Selection Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
            Evaluating suitability for meal window:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {['breakfast', 'lunch', 'snack', 'dinner'].map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                  selectedSlot === slot
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 💡 Recommended Seasonal Alternatives with Explanations */}
      {suitabilityAnalysis.alternatives && suitabilityAnalysis.alternatives.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {isNotSuitable
                  ? "Healthier Seasonal Alternatives (Recommended)"
                  : "Nutritionally Equivalent Local Alternatives"}
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800">
              In-Season
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isNotSuitable
              ? `Instead of "${food_item.name}", here are practical, delicious local options that will keep your daily score high:`
              : "Prefer something else? These local seasonal dishes provide equivalent macro density:"}
          </p>

          <div className="space-y-2.5">
            {suitabilityAnalysis.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">{alt.name}</h5>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <span className="text-amber-700 dark:text-amber-400 font-black">🔥 {alt.calories} kcal</span>
                      <span className="text-blue-700 dark:text-blue-400 font-black">💪 {alt.protein_g}g protein</span>
                    </div>
                  </div>

                  {/* 1-Tap Swap & Log Button */}
                  <button
                    onClick={() => handleSwapToAlternativeAndLog(alt)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-sm flex items-center gap-1 active:scale-95 transition-all flex-shrink-0"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Swap & Log</span>
                  </button>
                </div>

                {/* Explanation of Why This Alternative is Better */}
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Why this is better:</span>
                  </div>
                  <p className="leading-relaxed">{alt.why_better}</p>
                </div>

                {alt.local_availability && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{alt.local_availability}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleConfirmLogScanned}
          className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
            isNotSuitable
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30 hover:opacity-95'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isNotSuitable ? `Log "${food_item.name}" Anyway (Reduces Score)` : `Confirm & Log "${food_item.name}" for ${selectedSlot.toUpperCase()}`}</span>
        </button>

        <button
          onClick={() => setCurrentScreen('scan')}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
        >
          Scan / Type a Different Food Item
        </button>
      </div>
    </div>
  );
}
