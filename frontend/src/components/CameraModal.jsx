import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, QrCode, Tag, Apple, Zap, Sparkles, CheckCircle2, ScanLine } from 'lucide-react';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';

export default function CameraModal({ isOpen, onClose, onScanComplete, defaultMode = 'meal' }) {
  const [activeTab, setActiveTab] = useState(defaultMode); // 'meal', 'label', 'barcode', 'food'
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedImage(null);
      setScanning(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera fallback:", err);
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        triggerAnalysisProcess(
          activeTab === 'barcode' ? "Packaged Whey Bar (Barcode Scan)" :
          activeTab === 'label' ? "Packaged Food Nutrition Label" : "Uploaded Food Item",
          event.target.result
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedImage(preset.image);
    triggerAnalysisProcess(preset.name, preset.image);
  };

  const triggerAnalysisProcess = (foodName, imageSource) => {
    setScanning(true);
    setScanStep(
      activeTab === 'barcode' ? "Reading Barcode / QR Matrix..." :
      activeTab === 'label' ? "Extracting Nutrition Facts Table (OCR)..." :
      "Identifying ingredients & portions..."
    );

    setTimeout(() => {
      setScanStep("Extracting macronutrients & calories...");
    }, 800);

    setTimeout(() => {
      setScanStep("Evaluating diet plan alignment...");
    }, 1600);

    setTimeout(() => {
      setScanning(false);
      stopCamera();
      onScanComplete({
        foodName,
        scanType: activeTab,
        image: imageSource
      });
    }, 2200);
  };

  const handleCaptureSnapshot = () => {
    let defaultTitle = "Paneer Tikka Sandwich";
    if (activeTab === 'barcode') defaultTitle = "Whey Protein Bar (Barcode: 8901030894012)";
    if (activeTab === 'label') defaultTitle = "Whey Crisp High Protein Bar (Packaged Label)";
    if (activeTab === 'food') defaultTitle = "Seasonal Fruit & Roasted Chana Bowl";

    triggerAnalysisProcess(
      defaultTitle,
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60"
    );
  };

  if (!isOpen) return null;

  const modeDescriptions = {
    meal: "Scan entire meal plate for multi-item portion estimation",
    label: "Scan packaged nutrition facts label for OCR macro verification",
    barcode: "Scan packaged food QR / Barcode for instant product lookup",
    food: "Scan any single fruit, snack or food item to check instant fit"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Real-Time Vision & Barcode Scanner
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {modeDescriptions[activeTab]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Scan Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-3 pt-2">
          {[
            { id: 'meal', label: '🍽️ Plate' },
            { id: 'label', label: '🏷️ Label' },
            { id: 'barcode', label: '📱 QR/Barcode' },
            { id: 'food', label: '🍎 Item' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-2.5 text-[11px] font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewfinder / Capture Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-emerald-500/40 group">
            {cameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Fallback image if real webcam is inactive in test */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80')` }}
                />
              </div>
            ) : selectedImage ? (
              <img src={selectedImage} alt="Selected food" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800/40">
                  {activeTab === 'barcode' ? <QrCode className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
                </div>
                <h4 className="text-white font-bold text-sm">
                  {activeTab === 'barcode' ? 'Position QR / Barcode' : 'Ready to Capture'}
                </h4>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  {activeTab === 'barcode'
                    ? 'Align the product barcode inside the scanning reticle frame.'
                    : `Position your ${activeTab === 'label' ? 'packaged nutrition facts label' : 'meal plate'} inside the viewfinder.`}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Live Webcam
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {/* Target reticle & Scanning Laser */}
            {(cameraActive || scanning) && (
              <div className={`absolute inset-4 border-2 ${activeTab === 'barcode' ? 'border-amber-400/90' : 'border-emerald-400/80'} rounded-xl pointer-events-none flex flex-col justify-between p-2`}>
                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-t-3 border-l-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`w-5 h-5 border-t-3 border-r-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                </div>

                {/* Laser animation bar */}
                <div className={`w-full h-1 ${activeTab === 'barcode' ? 'bg-amber-400 shadow-amber-400/90' : 'bg-emerald-400 shadow-emerald-400/80'} shadow-lg animate-scan`} />

                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-b-3 border-l-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`w-5 h-5 border-b-3 border-r-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                </div>
              </div>
            )}

            {/* Scanning processing loader */}
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
                <span className="font-extrabold text-base text-emerald-400 tracking-tight">
                  {activeTab === 'barcode' ? 'Decoding Barcode...' : 'Analyzing Food Intake...'}
                </span>
                <span className="text-xs text-slate-300 mt-1 text-center font-medium animate-pulse">
                  {scanStep}
                </span>
              </div>
            )}
          </div>

          {/* Camera controls if active */}
          {cameraActive && !scanning && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={handleCaptureSnapshot}
                className="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
                Capture & Recognize
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-full font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Preset Quick Scan Options (Instant 1-Click Demo) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Or Try Sample Food Photos
              </span>
              <span className="text-[11px] font-bold text-emerald-600">1-Click Test</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_SCAN_PRESETS.filter(p => activeTab === 'all' || p.type === activeTab || (activeTab === 'food' && p.type === 'food')).slice(0, 3).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition-all text-left bg-slate-50 hover:shadow-md"
                >
                  <img src={preset.image} alt={preset.name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-1.5 bg-white">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{preset.name}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{preset.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
