import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Flame, Dumbbell, Sparkles, ChevronDown, ChevronUp, Plus, ShieldCheck, Eye, EyeOff, Ban, RefreshCw, Check, ArrowRight, MapPin, Zap } from 'lucide-react';
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
    verdict = "good_fit",
    score = 7.8,
    badge_label = "Good Choice",
    rationale = "Nutritional analysis complete.",
    suggestions = [],
    scannedImage
  } = activeScanResult;

  // Run in-depth Diet Plan Suitability & Explained Alternatives Engine
  const suitabilityAnalysis = evaluateDietPlanSuitabilityAndAlternatives(
    food_item,
    selectedSlot,
    dietPlan,
    userProfile
  );

  let verdictBg = "bg-emerald-50 border-emerald-200 text-emerald-900";
  let scoreBadgeColor = "bg-emerald-600 text-white";
  let verdictIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;

  if (suitabilityAnalysis.suitability === 'partially_suitable') {
    verdictBg = "bg-amber-50 border-amber-200 text-amber-900";
    scoreBadgeColor = "bg-amber-500 text-white";
    verdictIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  } else if (suitabilityAnalysis.suitability === 'not_suitable') {
    verdictBg = "bg-rose-50 border-rose-200 text-rose-900";
    scoreBadgeColor = "bg-rose-600 text-white";
    verdictIcon = <XCircle className="w-5 h-5 text-rose-600" />;
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
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-4 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('scan')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scanner</span>
        </button>
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          AI Nutrition Intelligence
        </span>
      </div>

      {/* 1. Image Preview & Food Title */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft">
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
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
              {food_item.category}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{food_item.name}</h3>
            <span className="text-xs text-slate-500 font-medium">{food_item.serving_size}</span>
          </div>
        )}

        {/* Suitability Badge */}
        <div className={`p-4 border-t border-b ${verdictBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            {verdictIcon}
            <div>
              <div className="text-xs font-black">{badge_label}</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {userProfile.user_type === 'athlete'
                  ? `Evaluated for ${userProfile.sport || 'Athletic'} Energy & Macro Targets`
                  : `Evaluated against your Daily Calorie & Macronutrient Targets`}
              </div>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-sm ${scoreBadgeColor}`}>
            {score} / 10
          </div>
        </div>

        {/* Macro Numbers Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 text-center bg-white">
          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Calories</span>
            <span className="text-sm font-black text-slate-800">{food_item.calories}</span>
            <span className="text-[9px] text-slate-400 block">kcal</span>
          </div>

          <div className="p-2 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900">
            <span className="text-[10px] font-bold text-blue-500 uppercase block">Protein</span>
            <span className="text-sm font-black text-blue-700">{food_item.protein_g}g</span>
            <span className="text-[9px] text-blue-400 block">Density</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Carbs</span>
            <span className="text-sm font-black text-slate-800">{food_item.carbs_g}g</span>
            <span className="text-[9px] text-slate-400 block">Energy</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Fat</span>
            <span className="text-sm font-black text-slate-800">{food_item.fat_g}g</span>
            <span className="text-[9px] text-slate-400 block">Lipids</span>
          </div>
        </div>
      </div>

      {/* 2. 🎯 Personalized Diet Plan Suitability Card with In-Depth Explanation */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Diet Plan Suitability Evaluation
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${suitabilityAnalysis.badgeColor}`}>
            {suitabilityAnalysis.badgeText}
          </span>
        </div>

        {/* Detailed Suitability Explanation */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 leading-relaxed space-y-2">
          <p>{suitabilityAnalysis.explanation}</p>
        </div>

        {/* Slot Selection Buttons */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 💡 Recommended Equivalent Alternatives with Explanations */}
      {suitabilityAnalysis.alternatives && suitabilityAnalysis.alternatives.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {suitabilityAnalysis.suitability === 'not_suitable'
                  ? "Better Alternatives for This Meal Window"
                  : "Nutritionally Equivalent Local Alternatives"}
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              In-Season
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            {suitabilityAnalysis.suitability === 'not_suitable'
              ? "Since this food diverges from your goals, here are practical, locally sourced meals that perfectly match your targets:"
              : "Prefer something else? These local seasonal dishes provide equivalent macro density:"}
          </p>

          <div className="space-y-2.5">
            {suitabilityAnalysis.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-black text-slate-900">{alt.name}</h5>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-600">
                      <span className="text-amber-700 font-black">🔥 {alt.calories} kcal</span>
                      <span className="text-blue-700 font-black">💪 {alt.protein_g}g protein</span>
                      <span className="text-slate-400">⏱️ {alt.prep_time}</span>
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
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>Why this is better:</span>
                  </div>
                  <p className="leading-relaxed">{alt.why_better}</p>
                </div>

                {alt.local_availability && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <MapPin className="w-2.5 h-2.5 text-emerald-600" />
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
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Confirm & Log "{food_item.name}" for {selectedSlot.toUpperCase()}</span>
        </button>

        <button
          onClick={() => setCurrentScreen('scan')}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          Scan / Type a Different Food Item
        </button>
      </div>
    </div>
  );
}
