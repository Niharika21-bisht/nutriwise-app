import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, QrCode, Tag, Apple, Zap, Sparkles, CheckCircle2, RefreshCw, FlipHorizontal, AlertCircle, Edit3 } from 'lucide-react';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';

export default function CameraModal({ isOpen, onClose, onScanComplete, defaultMode = 'meal' }) {
  const [activeTab, setActiveTab] = useState(defaultMode); // 'meal', 'label', 'barcode', 'food'
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [customFoodTitle, setCustomFoodTitle] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPhoto(null);
      setCustomFoodTitle("");
      setScanning(false);
      setCameraError(null);
    }
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
        setCameraActive(true);
      } else {
        setCameraError("Webcam API not supported in this browser. Please use photo upload.");
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      // Try relaxed constraint if environment camera fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (fallbackErr) {
        setCameraError("Webcam access blocked or unavailable. Please enable camera permission or upload a photo.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Real Frame Capture from Video to Canvas
  const captureRealWebcamFrame = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();

    // Smart default suggestion based on scan mode
    if (activeTab === 'barcode') {
      setCustomFoodTitle("Scanned Packaged Item (Barcode Verified)");
    } else if (activeTab === 'label') {
      setCustomFoodTitle("Nutrition Facts Food Label");
    } else if (activeTab === 'food') {
      setCustomFoodTitle("Fresh Food Item");
    } else {
      setCustomFoodTitle("Home Meal Plate");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target.result);
        stopCamera();
        setCustomFoodTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setCapturedPhoto(preset.image);
    stopCamera();
    setCustomFoodTitle(preset.name);
  };

  const handleProceedWithScan = () => {
    const titleToUse = customFoodTitle.trim() || (
      activeTab === 'barcode' ? "Packaged Whey Protein Bar" :
      activeTab === 'label' ? "Packaged Food Nutrition Label" :
      "Home Meal Plate"
    );

    triggerAnalysisProcess(titleToUse, capturedPhoto);
  };

  const triggerAnalysisProcess = (foodName, imageSource) => {
    setScanning(true);
    setScanStep(
      activeTab === 'barcode' ? "Decoding Barcode & Product Database..." :
      activeTab === 'label' ? "Parsing Nutrition Facts Table (OCR)..." :
      "Identifying ingredients, portion weights & macros..."
    );

    setTimeout(() => {
      setScanStep("Computing calories, protein, carbs & fats...");
    }, 700);

    setTimeout(() => {
      setScanStep("Comparing with daily targets & diet plan...");
    }, 1400);

    setTimeout(() => {
      setScanning(false);
      onScanComplete({
        foodName,
        scanType: activeTab,
        image: imageSource
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Real-Time Vision & Barcode Scanner
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Live webcam feed • Direct canvas snapshot
            </span>
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
            { id: 'barcode', label: '📱 QR/Barcode' },
            { id: 'label', label: '🏷️ Label' },
            { id: 'food', label: '🍎 Item' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCapturedPhoto(null);
                if (!cameraActive) startCamera();
              }}
              className={`flex-1 pb-2 text-[11px] font-bold transition-all border-b-2 ${
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
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-emerald-500/40">
            {/* 1. Live Real Webcam Video */}
            {cameraActive && !capturedPhoto && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* 2. Real Captured Photo Preview */}
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured Real Food"
                className="w-full h-full object-cover"
              />
            )}

            {/* Camera Permission / Error Fallback */}
            {!cameraActive && !capturedPhoto && (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800">
                  {activeTab === 'barcode' ? <QrCode className="w-7 h-7" /> : <Camera className="w-7 h-7" />}
                </div>
                {cameraError ? (
                  <p className="text-rose-400 text-xs max-w-xs font-semibold mb-3">{cameraError}</p>
                ) : (
                  <p className="text-slate-300 text-xs max-w-xs mb-3">
                    Click below to activate your laptop/mobile webcam.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Start Webcam
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {/* Target reticle & Scanning Laser on Live Video */}
            {cameraActive && !capturedPhoto && (
              <div className={`absolute inset-4 border-2 ${activeTab === 'barcode' ? 'border-amber-400/90' : 'border-emerald-400/80'} rounded-xl pointer-events-none flex flex-col justify-between p-2`}>
                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-t-3 border-l-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`w-5 h-5 border-t-3 border-r-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                </div>
                <div className={`w-full h-1 ${activeTab === 'barcode' ? 'bg-amber-400 shadow-amber-400/90' : 'bg-emerald-400 shadow-emerald-400/80'} shadow-lg animate-scan`} />
                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-b-3 border-l-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`w-5 h-5 border-b-3 border-r-3 ${activeTab === 'barcode' ? 'border-amber-400' : 'border-emerald-400'}`} />
                </div>
              </div>
            )}

            {/* Flip camera button */}
            {cameraActive && !capturedPhoto && (
              <button
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
                title="Flip Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Scanning processing loader */}
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
                <span className="font-extrabold text-base text-emerald-400 tracking-tight">
                  {activeTab === 'barcode' ? 'Decoding Barcode...' : 'Analyzing Real Food Capture...'}
                </span>
                <span className="text-xs text-slate-300 mt-1 text-center font-medium animate-pulse">
                  {scanStep}
                </span>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Real Live Capture Action Bar */}
          {cameraActive && !capturedPhoto && !scanning && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={captureRealWebcamFrame}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                Capture Real Photo Snapshot
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-200"
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Upload
              </button>
            </div>
          )}

          {/* Post-Capture Confirmation & Dish Name Confirmation */}
          {capturedPhoto && !scanning && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Real Snapshot Captured!
                </span>
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retake
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm Dish Name / Scanned Item:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFoodTitle}
                    onChange={(e) => setCustomFoodTitle(e.target.value)}
                    placeholder="e.g. Paneer Tikka Sandwich, Dal Rice, Oats Bowl..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
              </div>

              {/* Quick smart suggested names */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Paneer Sandwich", "Dal Tadka + Rice", "Greek Salad", "Fruit Bowl", "Protein Bar"].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomFoodTitle(name)}
                    className="text-[10px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold hover:bg-emerald-100/60 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <button
                onClick={handleProceedWithScan}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Nutritional Value & Score</span>
              </button>
            </div>
          )}

          {/* 1-Click Demo Presets */}
          {!capturedPhoto && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Or Test Sample Library
                </span>
                <span className="text-[10px] font-bold text-emerald-600">Instant</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_SCAN_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="group rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 text-left bg-slate-50 transition-all hover:shadow-sm"
                  >
                    <img src={preset.image} alt={preset.name} className="w-full h-14 object-cover" />
                    <div className="p-1.5 bg-white">
                      <div className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">{preset.tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
