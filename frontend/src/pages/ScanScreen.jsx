import React, { useState } from 'react';
import { Camera, Tag, Apple, Sparkles, Upload, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CameraModal from '../components/CameraModal';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';
import { analyzeScannedFood } from '../services/api';

export default function ScanScreen() {
  const { userProfile, todayLog, setActiveScanResult, setCurrentScreen, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScanMode, setSelectedScanMode] = useState('meal');

  const openScanMode = (mode) => {
    setSelectedScanMode(mode);
    setModalOpen(true);
  };

  const handleScanDone = async ({ foodName, scanType, image }) => {
    setModalOpen(false);
    showToast("Analyzing nutritional profile... 🧠");
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

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Top Header */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Visual Intelligence
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          What would you like to scan?
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Take a photo or upload an image to extract macros, verify nutrition labels, and score fit with your goal.
        </p>
      </div>

      {/* 3 Main Scan Cards */}
      <div className="space-y-3">
        {/* Option 1: Scan My Meal */}
        <button
          onClick={() => openScanMode('meal')}
          className="w-full p-4 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-emerald-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-3">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan My Meal / Plate</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Multi-Item
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Take a photo of your entire plate to estimate calories & portion balance.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 2: Food Label Scanner */}
        <button
          onClick={() => openScanMode('label')}
          className="w-full p-4 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-blue-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-3">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan Food Label</h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  OCR Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan packaged food nutrition facts & detect hidden sugars or allergens.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 3: Scan Single Food */}
        <button
          onClick={() => openScanMode('food')}
          className="w-full p-4 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-amber-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-3">
              🍎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan Food Item</h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Instant Look
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Identify a fruit, snack, beverage or single dish to check goal suitability.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Preset Quick Scan Library */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Presets</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">1-Click Test</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SAMPLE_SCAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleScanDone({ foodName: preset.name, scanType: preset.type, image: preset.image })}
              className="p-2 rounded-2xl border border-slate-100 hover:border-emerald-400 bg-slate-50/50 hover:bg-white text-left transition-all group"
            >
              <img
                src={preset.image}
                alt={preset.name}
                className="w-full h-20 rounded-xl object-cover group-hover:scale-[1.02] transition-transform"
              />
              <div className="mt-1.5 px-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {preset.tag}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {preset.name}
                </span>
              </div>
            </button>
          ))}
        </div>
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
