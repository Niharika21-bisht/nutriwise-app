import React, { useState } from 'react';
import { Camera, Tag, Apple, QrCode, Sparkles, Upload, ArrowRight, Zap, Edit3, Search, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CameraModal from '../components/CameraModal';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';
import { analyzeScannedFood } from '../services/api';
import { validateFoodInput } from '../services/foodIntelligence';

export default function ScanScreen() {
  const { userProfile, todayLog, setActiveScanResult, setCurrentScreen, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScanMode, setSelectedScanMode] = useState('meal');
  const [quickMealInput, setQuickMealInput] = useState("");
  const [inputError, setInputError] = useState(null);

  const openScanMode = (mode) => {
    setSelectedScanMode(mode);
    setModalOpen(true);
  };

  const handleScanDone = async ({ foodName, scanType, image, parsedData }) => {
    setModalOpen(false);
    showToast("Analyzing nutritional profile & diet fit... 🧠");
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

  const handleQuickMealSubmit = async (e) => {
    e.preventDefault();
    setInputError(null);

    const validation = validateFoodInput(quickMealInput);
    if (!validation.isValid) {
      setInputError(validation.reason);
      return;
    }

    showToast(`Analyzing "${validation.cleanQuery}" with AI... 🧠`);
    const result = await analyzeScannedFood(
      validation.cleanQuery,
      userProfile,
      {
        calories: todayLog.consumed_calories,
        protein_g: todayLog.consumed_protein_g
      }
    );
    result.scannedImage = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60";
    setActiveScanResult(result);
    setCurrentScreen('food_analysis');
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-4 animate-fadeIn transition-colors">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/80 dark:to-teal-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 mb-1">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Google Gemini Vision Enabled</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          AI Food & Meal Scanner
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Capture food photos or scan labels for instant calories & macro breakdown.
        </p>
      </div>

      {/* ✏️ Direct AI Food Search & Manual Input Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">Type Meal / Dish Name Directly</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">AI automatically verifies food & computes exact score</p>
          </div>
        </div>

        <form onSubmit={handleQuickMealSubmit} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              required
              value={quickMealInput}
              onChange={(e) => {
                setQuickMealInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="e.g. Dal Tadka + Rice, Paneer Paratha, 2 Boiled Eggs..."
              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>Analyze</span>
            </button>
          </div>

          {inputError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {/* Quick Popular Picks */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {["Dal Rice", "Paneer Roti", "Moong Cheela", "Egg Toast", "Fruit Bowl"].map((item, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setQuickMealInput(item)}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 px-2 py-0.5 rounded-md font-semibold transition-colors border border-slate-200/50 dark:border-slate-700"
              >
                {item}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 4 Main Scan Option Cards */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
          Open Live Camera / Upload Image
        </span>

        {/* Option 1: Scan My Meal / Plate */}
        <button
          onClick={() => openScanMode('meal')}
          className="w-full p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-emerald-950/70 dark:to-teal-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Scan Meal Plate</h3>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Capture your plate to recognize Indian thalis, dishes & portion balance.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 2: Scan Single Food Item */}
        <button
          onClick={() => openScanMode('food')}
          className="w-full p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-teal-300 dark:hover:border-teal-700 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🍎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Scan Single Food</h3>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/70 px-2 py-0.5 rounded-full">
                  Item Vision
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identify a fruit, snack, beverage, or individual ingredient.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 3: QR & Barcode Scanner */}
        <button
          onClick={() => openScanMode('barcode')}
          className="w-full p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Scan QR / Barcode</h3>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
                  OpenFoodFacts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scan packaged food barcodes for verified manufacturer macros.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 4: Food Label Scanner (OCR) */}
        <button
          onClick={() => openScanMode('label')}
          className="w-full p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Scan Food Label</h3>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/70 px-2 py-0.5 rounded-full">
                  Gemini OCR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scan packaged nutrition facts tables to extract exact calories & sugar.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Camera Modal component */}
      <CameraModal
        isOpen={modalOpen}
        defaultMode={selectedScanMode}
        onClose={() => setModalOpen(false)}
        onScanComplete={handleScanDone}
      />
    </div>
  );
}
