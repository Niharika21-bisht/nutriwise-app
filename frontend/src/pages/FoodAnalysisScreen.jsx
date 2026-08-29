import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Flame, Dumbbell, Sparkles, Plus, Eye, ShieldCheck, Ban, RefreshCw, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NutritionLabel from '../components/NutritionLabel';

export default function FoodAnalysisScreen() {
  const { activeScanResult, logCustomScannedMeal, evaluateDietPlanFit, setCurrentScreen, userProfile } = useApp();
  const [showFullLabel, setShowFullLabel] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('lunch');

  if (!activeScanResult) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-800">No active scan result</h3>
        <button
          onClick={() => setCurrentScreen('scan')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Scanner
        </button>
      </div>
    );
  }

  // 1. NON-FOOD OR REJECTED SCAN HANDLER
  if (activeScanResult.is_valid_food === false || activeScanResult.verdict === 'invalid') {
    return (
      <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('scan')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Scanner</span>
          </button>
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
            Unrecognized Item
          </span>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden border border-rose-200 shadow-soft p-5 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Ban className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">No Food Item Detected</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {activeScanResult.error_message || "The camera could not recognize an edible food plate, dish, or packaged nutrition label in this image."}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1.5 text-xs text-amber-900">
            <span className="font-bold block">💡 How to scan food accurately:</span>
            <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
              <li>Place your meal plate in good lighting.</li>
              <li>Point camera directly at the food (avoid faces, walls, laptops).</li>
              <li>For packaged foods, align the barcode or Nutrition Facts table.</li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentScreen('scan')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Take New Food Photo</span>
          </button>
        </div>
      </div>
    );
  }

  const { food_item, verdict, score, badge_label, rationale, suggestions, scannedImage } = activeScanResult;

  const currentFitEval = evaluateDietPlanFit(food_item, selectedSlot);

  let verdictBg = "bg-emerald-50 border-emerald-200 text-emerald-900";
  let scoreBadgeColor = "bg-emerald-600 text-white";
  let verdictIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;

  if (verdict === 'modify') {
    verdictBg = "bg-amber-50 border-amber-200 text-amber-900";
    scoreBadgeColor = "bg-amber-500 text-white";
    verdictIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  } else if (verdict === 'not_ideal') {
    verdictBg = "bg-rose-50 border-rose-200 text-rose-900";
    scoreBadgeColor = "bg-rose-600 text-white";
    verdictIcon = <XCircle className="w-5 h-5 text-rose-600" />;
  }

  const handleConfirmLog = () => {
    logCustomScannedMeal(food_item, selectedSlot);
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
          Analysis Result
        </span>
      </div>

      {/* Image Preview & Detected Name Banner */}
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

        {/* Verdict Badge */}
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

      {/* Diet Plan Fit Evaluation Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Diet Plan Fit Analysis
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentFitEval.color}`}>
            {currentFitEval.badge}
          </span>
        </div>

        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {currentFitEval.message}
        </p>

        {/* Slot Selection Pills */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
            Log this meal for which time slot?
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

      {/* Rationale & Actionable Advice */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Nutritional Rationale
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {rationale}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">
            💡 Recommended Improvement
          </span>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Toggle FDA Nutrition Facts */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowFullLabel(!showFullLabel)}
            className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{showFullLabel ? "Hide Detailed Nutrition Facts" : "View FDA Nutrition Facts Label"}</span>
          </button>

          {showFullLabel && (
            <div className="mt-3 animate-fadeIn">
              <NutritionLabel foodItem={food_item} />
            </div>
          )}
        </div>
      </div>

      {/* Action CTA: Log This Meal as Final Input */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleConfirmLog}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Confirm & Log as My {selectedSlot.toUpperCase()}</span>
        </button>

        <button
          onClick={() => setCurrentScreen('make_meal_better')}
          className="w-full py-3 px-6 rounded-2xl bg-white border border-slate-200 text-amber-700 font-bold text-xs hover:bg-amber-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Optimize in "Make My Meal Better"</span>
        </button>
      </div>
    </div>
  );
}
