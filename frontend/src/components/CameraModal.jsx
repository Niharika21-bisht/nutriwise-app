import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, QrCode, Tag, Apple, Zap, Sparkles, CheckCircle2, RefreshCw, FlipHorizontal, AlertTriangle, AlertCircle, ScanLine, Utensils, Ban, Edit3, Search, BrainCircuit, KeyRound } from 'lucide-react';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';
import { lookupBarcodeProduct, parseNutritionLabelOcr } from '../services/visionScanner';
import { classifyFoodImage } from '../services/mlFoodClassifier';
import { validateFoodInput } from '../services/foodIntelligence';
import { analyzeFoodWithGemini, getGeminiApiKey, setGeminiApiKey } from '../services/geminiVision';

export default function CameraModal({ isOpen, onClose, onScanComplete, defaultMode = 'meal' }) {
  const [activeTab, setActiveTab] = useState(defaultMode); // 'meal', 'barcode', 'label', 'food'
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [customFoodTitle, setCustomFoodTitle] = useState("");
  const [nonFoodError, setNonFoodError] = useState(null);
  const [manualInputMode, setManualInputMode] = useState(false);
  const [manualTextInput, setManualTextInput] = useState("");
  
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [aiEngineUsed, setAiEngineUsed] = useState("Google Gemini 2.0 Flash Vision");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const barcodeIntervalRef = useRef(null);

  useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const resetState = () => {
    setCapturedPhoto(null);
    setDetectedProduct(null);
    setCustomFoodTitle("");
    setNonFoodError(null);
    setManualInputMode(false);
    setManualTextInput("");
    setScanning(false);
    setCameraError(null);
  };

  const stopCamera = () => {
    if (barcodeIntervalRef.current) {
      clearInterval(barcodeIntervalRef.current);
      barcodeIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Webcam is not supported on this browser. Please upload a photo or type meal name.");
        return;
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e1) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(() => {});
          };
        }
      }

      setCameraActive(true);
      setCameraError(null);

      if (activeTab === 'barcode') {
        startLiveBarcodeDetection();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setCameraError("Could not access webcam. Please check browser permissions, upload a photo, or type meal name.");
    }
  };

  // Live Barcode Detection Loop
  const startLiveBarcodeDetection = () => {
    if (barcodeIntervalRef.current) clearInterval(barcodeIntervalRef.current);

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'data_matrix']
        });

        barcodeIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || capturedPhoto) return;

          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                clearInterval(barcodeIntervalRef.current);
                handleBarcodeDetected(code);
              }
            }
          } catch (e) {}
        }, 300);
      } catch (err) {
        console.warn("BarcodeDetector error:", err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'barcode' && cameraActive && !capturedPhoto) {
      startLiveBarcodeDetection();
    } else if (barcodeIntervalRef.current) {
      clearInterval(barcodeIntervalRef.current);
      barcodeIntervalRef.current = null;
    }
  }, [activeTab, cameraActive, capturedPhoto]);

  const handleBarcodeDetected = async (barcodeText) => {
    takeSnapshot();
    setScanning(true);
    setScanStep(`Decoded Barcode: [${barcodeText}] — Querying Open Food Facts database...`);

    const product = await lookupBarcodeProduct(barcodeText);
    setScanning(false);
    setDetectedProduct(product);
    setCustomFoodTitle(product.product_name);
    setAiEngineUsed("Open Food Facts & Barcode Vision");
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    return { dataUrl, canvas };
  };

  // Google Gemini Vision Multimodal Food Classification Trigger on Snapshot
  const handleCaptureButtonClick = async () => {
    setNonFoodError(null);
    const snap = takeSnapshot();
    if (!snap) return;

    const { dataUrl, canvas } = snap;

    // 1. Label OCR Mode
    if (activeTab === 'label') {
      setScanning(true);
      setScanStep("Analyzing Nutrition Facts label with Google Gemini Vision OCR...");
      try {
        const geminiResult = await analyzeFoodWithGemini(dataUrl, 'label');
        setScanning(false);
        if (geminiResult.is_food) {
          setDetectedProduct(geminiResult.food_data);
          setCustomFoodTitle(geminiResult.detected_title);
          setAiEngineUsed("Google Gemini 2.0 Flash Vision");
          return;
        }
      } catch (geminiErr) {
        console.warn("Gemini Vision fallback to Tesseract:", geminiErr);
      }

      setScanStep("Running Tesseract OCR on Nutrition Facts label...");
      const ocrResult = await parseNutritionLabelOcr(dataUrl);
      setScanning(false);

      if (ocrResult.success && ocrResult.hasNutritionKeywords && ocrResult.extracted) {
        setDetectedProduct({
          product_name: "Nutrition Facts Food Label",
          ...ocrResult.extracted,
          serving_size: "1 portion (OCR parsed)"
        });
        setCustomFoodTitle("Nutrition Facts Food Label");
        setAiEngineUsed("Tesseract OCR & Nutrition Parser");
      } else {
        setNonFoodError("🚫 No Nutrition Label Detected: Could not detect a valid Nutrition Facts table. Please frame the nutrition panel on the back of the packet.");
      }
    } 
    // 2. Barcode Mode
    else if (activeTab === 'barcode') {
      if ('BarcodeDetector' in window) {
        setScanning(true);
        setScanStep("Searching frame for barcodes...");
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'upc_a', 'code_128'] });
          const codes = await detector.detect(canvas);
          setScanning(false);
          if (codes && codes.length > 0) {
            handleBarcodeDetected(codes[0].rawValue);
            return;
          }
        } catch (e) {}
        setScanning(false);
      }
      setNonFoodError("🚫 No Barcode or QR Code Detected: Please align a valid packaged food barcode inside the frame.");
    } 
    // 3. Plate & Food Item Mode: Run Google Gemini 3.5 Flash Multimodal Vision API
    else {
      setScanning(true);
      setScanStep("✨ Connecting to Google Gemini 3.5 Flash Multimodal AI...");
      
      try {
        setScanStep("🧠 Google Gemini analyzing food plate & verifying real nutrition...");
        const geminiResult = await analyzeFoodWithGemini(dataUrl, activeTab);
        setScanning(false);

        if (!geminiResult.is_food) {
          setNonFoodError(geminiResult.rejection_reason || "🚫 No Food Detected: The camera captured a non-food item or plain background. Please point camera directly at your meal plate.");
        } else {
          setDetectedProduct(geminiResult.food_data);
          setCustomFoodTitle(geminiResult.detected_title || geminiResult.food_data.name);
          setAiEngineUsed("Google Gemini 3.5 Flash Vision");
        }
      } catch (geminiError) {
        console.warn("Gemini Vision error:", geminiError);
        setScanning(false);
        setNonFoodError("🚫 Could not detect food: Please ensure the meal plate is clearly visible inside the camera frame, or type the meal name below.");
      }
    }
  };

  // Manual Food Name Input Submission with AI validation
  const handleManualInputSubmit = (e) => {
    if (e) e.preventDefault();
    setNonFoodError(null);

    const validation = validateFoodInput(manualTextInput);
    if (!validation.isValid) {
      setNonFoodError(`⚠️ ${validation.reason}`);
      return;
    }

    setCustomFoodTitle(validation.cleanQuery);
    triggerAnalysisProcess(
      validation.cleanQuery,
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setCapturedPhoto(dataUrl);
        setNonFoodError(null);

        // Run Google Gemini 3.5 Flash Multimodal Vision on uploaded file
        setScanning(true);
        setScanStep("✨ Google Gemini 3.5 Flash analyzing uploaded image...");

        try {
          const geminiResult = await analyzeFoodWithGemini(dataUrl, activeTab);
          setScanning(false);

          if (!geminiResult.is_food) {
            setNonFoodError(geminiResult.rejection_reason || "🚫 No Food Detected in this photo. Please upload a clear image of a meal plate or food item.");
          } else {
            setDetectedProduct(geminiResult.food_data);
            setCustomFoodTitle(geminiResult.detected_title || geminiResult.food_data.name);
            setAiEngineUsed("Google Gemini 3.5 Flash Vision");
          }
        } catch (err) {
          console.warn("Gemini upload error:", err);
          setScanning(false);
          setNonFoodError("🚫 Could not identify food in this photo. Please upload a clear photo of an edible meal plate or food item.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setCapturedPhoto(preset.image);
    setCustomFoodTitle(preset.name);
    setNonFoodError(null);
  };

  const triggerAnalysisProcess = (title, image) => {
    stopCamera();
    onScanComplete({
      foodName: title,
      scanType: activeTab,
      image: image || capturedPhoto,
      parsedData: detectedProduct
    });
  };

  const handleProceedWithScan = () => {
    if (!customFoodTitle.trim()) {
      setNonFoodError("Please confirm or enter the meal/food name.");
      return;
    }
    triggerAnalysisProcess(customFoodTitle.trim(), capturedPhoto);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                Google Gemini Vision Scanner
              </h3>
              <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Multimodal AI
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
              Instant plate recognition, portion sizes & macro calculation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Scan Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-3 pt-2">
          {[
            { id: 'meal', label: '🍽️ Plate' },
            { id: 'food', label: '🍎 Item' },
            { id: 'barcode', label: '📱 QR/Barcode' },
            { id: 'label', label: '🏷️ Label OCR' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCapturedPhoto(null);
                setDetectedProduct(null);
                setNonFoodError(null);
                setManualInputMode(false);
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
          {/* Manual Input Drawer Toggle for Plate & Item Modes */}
          {(activeTab === 'meal' || activeTab === 'food') && (
            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">
                  {manualInputMode ? "Typing Meal Mode" : "Prefer typing food name?"}
                </span>
              </div>
              <button
                onClick={() => {
                  setManualInputMode(!manualInputMode);
                  setNonFoodError(null);
                }}
                className="px-3 py-1 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-100/60 transition-colors"
              >
                {manualInputMode ? "Open Camera" : "✏️ Type Name Instead"}
              </button>
            </div>
          )}

          {/* 1. MANUAL FOOD TEXT INPUT VIEW */}
          {manualInputMode ? (
            <form onSubmit={handleManualInputSubmit} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Enter Meal or Food Item Name:
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Our AI will verify the food, fetch accurate macros, and evaluate its contribution to your nutrition score.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={manualTextInput}
                    onChange={(e) => {
                      setManualTextInput(e.target.value);
                      if (nonFoodError) setNonFoodError(null);
                    }}
                    placeholder="e.g. Paneer Butter Masala with 2 Rotis, Dal Chawal, Egg Bhurji..."
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
              </div>

              {/* Quick Popular Indian Dishes */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Popular Indian Dishes (1-Tap):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Dal Tadka with Steamed Rice",
                    "Paneer Bhurji with 2 Rotis",
                    "Rajma Chawal + Salad",
                    "Chole Bhature",
                    "Veg Poha + Curd",
                    "Moong Dal Cheela",
                    "Egg Bhurji + Toast",
                    "Seasonal Fruit Bowl"
                  ].map((dish, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setManualTextInput(dish)}
                      className="text-[10px] bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {dish}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify Food & Fetch AI Nutritional Breakdown</span>
              </button>
            </form>
          ) : (
            /* 2. CAMERA VIEWFINDER */
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-emerald-500/40">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${capturedPhoto ? 'hidden' : 'block'}`}
              />

              {capturedPhoto && (
                <img
                  src={capturedPhoto}
                  alt="Captured Real Food"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Camera Error Overlay */}
              {cameraError && !capturedPhoto && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                  <h4 className="text-white font-bold text-sm mb-1">Camera Access</h4>
                  <p className="text-slate-300 text-xs max-w-xs mb-4">{cameraError}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Reticle */}
              {!capturedPhoto && !cameraError && (
                <div className="absolute inset-4 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
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

              {/* Flip Button */}
              {!capturedPhoto && !cameraError && (
                <button
                  onClick={toggleCameraFacing}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition-colors shadow-md z-10"
                  title="Switch Camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}

              {/* Loader */}
              {scanning && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20 animate-fadeIn">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce mb-3">
                    <Sparkles className="w-7 h-7 text-white animate-spin" />
                  </div>
                  <span className="font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
                    Google Gemini Multimodal AI
                  </span>
                  <span className="text-xs text-slate-300 mt-2 text-center font-medium animate-pulse px-4">
                    {scanStep}
                  </span>
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Real Capture Actions */}
          {!capturedPhoto && !scanning && !manualInputMode && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCaptureButtonClick}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>{activeTab === 'barcode' ? "Scan Barcode" : "Capture with Gemini Vision"}</span>
              </button>
              <button
                onClick={() => setManualInputMode(true)}
                className="px-3.5 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50"
              >
                <Edit3 className="w-4 h-4 inline mr-1 text-emerald-600" />
                Type
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-200"
                title="Upload Photo"
              >
                <Upload className="w-4 h-4 inline" />
              </button>
            </div>
          )}

          {/* 🚫 NON-FOOD / GIBBERISH WARNING BANNER */}
          {nonFoodError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold space-y-2.5 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Ban className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-rose-900 block text-sm">Item Not Recognized as Food</span>
                  <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">{nonFoodError}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200 flex gap-2">
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setNonFoodError(null);
                    setManualInputMode(true);
                  }}
                  className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:bg-rose-500"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Type Correct Food Name</span>
                </button>
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setNonFoodError(null);
                    setManualInputMode(false);
                    startCamera();
                  }}
                  className="px-3 py-2 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {/* ✅ VALID FOOD CONFIRMATION DISPLAY (GEMINI DETECTED) */}
          {capturedPhoto && !scanning && !nonFoodError && !manualInputMode && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 block leading-tight">
                      {detectedProduct?.name || customFoodTitle}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      ⚡ {aiEngineUsed} ({detectedProduct?.confidence || 96}% confidence)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setDetectedProduct(null);
                    setNonFoodError(null);
                    startCamera();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake
                </button>
              </div>

              {detectedProduct && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex justify-between items-center text-slate-600 text-[11px] font-bold">
                    <span>Portion: {detectedProduct.portion || "1 plate / standard serving"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                      {detectedProduct.diet_fit === 'fits_plan' ? '✅ Fits Nutrition Goal' : '⚠️ Moderate Variance'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-bold block">CALORIES</span>
                      <span className="font-black text-xs text-slate-800">{detectedProduct.calories} kcal</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-bold block">PROTEIN</span>
                      <span className="font-black text-xs text-emerald-700">{detectedProduct.protein_g}g</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-bold block">CARBS</span>
                      <span className="font-black text-xs text-blue-700">{detectedProduct.carbs_g}g</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-bold block">FAT</span>
                      <span className="font-black text-xs text-amber-700">{detectedProduct.fat_g}g</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm Dish Name:
                </label>
                <input
                  type="text"
                  value={customFoodTitle}
                  onChange={(e) => setCustomFoodTitle(e.target.value)}
                  placeholder="e.g. Dal Tadka + Rice, Paneer Bhurji, Poha..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <button
                onClick={handleProceedWithScan}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Log to Today's Tracker & Recalculate Score</span>
              </button>
            </div>
          )}
        </div>

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
