import React, { useState } from 'react';
import { Camera, Tag, Apple, QrCode, Sparkles, Upload, ArrowRight, Zap } from 'lucide-react';
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

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Top Header */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Visual & Barcode Intelligence
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          What would you like to scan?
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select a mode to scan plate meals, verify packaged nutrition labels, decode QR/barcodes, or analyze single items.
        </p>
      </div>

      {/* 4 Main Scan Option Cards */}
      <div className="space-y-2.5">
        {/* Option 1: Scan My Meal / Plate */}
        <button
          onClick={() => openScanMode('meal')}
          className="w-full p-3.5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-emerald-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan Meal Plate</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Plate Analysis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Take a photo of your entire plate to evaluate portion and macro balance.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 2: QR & Barcode Scanner */}
        <button
          onClick={() => openScanMode('barcode')}
          className="w-full p-3.5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-amber-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan QR / Barcode</h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Instant Product
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan packaged food barcodes for verified product ingredients.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 3: Food Label Scanner (OCR) */}
        <button
          onClick={() => openScanMode('label')}
          className="w-full p-3.5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-blue-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan Food Label</h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  OCR Table
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan packaged nutrition facts table to detect hidden sugars.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Option 4: Scan Single Food Item */}
        <button
          onClick={() => openScanMode('food')}
          className="w-full p-3.5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card hover:border-teal-300 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform p-2.5">
              🍎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Scan Single Food</h3>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Single Item
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Identify a fruit, snack, beverage or individual dish.
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
          {SAMPLE_SCAN_PRESETS.slice(0, 4).map((preset) => (
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
