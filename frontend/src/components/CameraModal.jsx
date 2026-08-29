import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, QrCode, Tag, Apple, Zap, Sparkles, CheckCircle2, RefreshCw, FlipHorizontal, AlertTriangle, AlertCircle, ScanLine, Utensils, Ban } from 'lucide-react';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';
import { lookupBarcodeProduct, parseNutritionLabelOcr } from '../services/visionScanner';
import { classifyFoodImage } from '../services/mlFoodClassifier';

export default function CameraModal({ isOpen, onClose, onScanComplete, defaultMode = 'meal' }) {
  const [activeTab, setActiveTab] = useState(defaultMode); // 'meal', 'barcode', 'label', 'food'
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [customFoodTitle, setCustomFoodTitle] = useState("");
  const [nonFoodError, setNonFoodError] = useState(null);
  
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  
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
        setCameraError("Webcam is not supported on this browser. Please upload a photo.");
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
      setCameraError("Could not access webcam. Please check browser permissions or upload an image.");
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

  // Real ML Food Classification Trigger
  const handleCaptureButtonClick = async () => {
    setNonFoodError(null);
    const snap = takeSnapshot();
    if (!snap) return;

    const { dataUrl, canvas } = snap;

    // 1. Label OCR Mode
    if (activeTab === 'label') {
      setScanning(true);
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
    // 3. Plate & Food Item Mode: Run Real TensorFlow.js ML Classification
    else {
      setScanning(true);
      setScanStep("Running Machine Learning food & non-food classification...");
      
      const mlResult = await classifyFoodImage(canvas);
      setScanning(false);

      if (!mlResult.is_valid_food) {
        // Strict Rejection for human faces, pets, walls, furniture, devices!
        setNonFoodError(mlResult.error_message || "🚫 No Food Detected in camera frame. Please point towards your meal plate or food dish.");
      } else {
        // Valid Food Classified!
        setDetectedProduct(mlResult.food_data);
        setCustomFoodTitle(mlResult.detected_title || mlResult.food_data.name);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setCapturedPhoto(dataUrl);
        setNonFoodError(null);

        const img = new Image();
        img.onload = async () => {
          if (activeTab === 'label') {
            setScanning(true);
            setScanStep("Running OCR on nutrition label...");
            const ocrResult = await parseNutritionLabelOcr(dataUrl);
            setScanning(false);
            if (ocrResult.hasNutritionKeywords && ocrResult.extracted) {
              setDetectedProduct({
                product_name: "Uploaded Nutrition Label",
                ...ocrResult.extracted,
                serving_size: "1 portion"
              });
              setCustomFoodTitle("Nutrition Facts Food Label");
            } else {
              setNonFoodError("🚫 No Nutrition Label Detected in this photo. Please upload a clear image of a nutrition facts table.");
            }
          } else {
            setScanning(true);
            setScanStep("Classifying image with ML vision...");
            const mlResult = await classifyFoodImage(img);
            setScanning(false);

            if (!mlResult.is_valid_food) {
              setNonFoodError(mlResult.error_message);
            } else {
              setDetectedProduct(mlResult.food_data);
              setCustomFoodTitle(mlResult.detected_title);
            }
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setCapturedPhoto(preset.image);
    setCustomFoodTitle(preset.name);
    setNonFoodError(null);
  };

  const handleProceedWithScan = () => {
    if (nonFoodError) return;
    const titleToUse = customFoodTitle.trim() || "Identified Meal Item";
    triggerAnalysisProcess(titleToUse, capturedPhoto);
  };

  const triggerAnalysisProcess = (foodName, imageSource) => {
    setScanning(true);
    setScanStep("Analyzing portion weights, glycemic response & daily goals...");

    setTimeout(() => {
      setScanning(false);
      onScanComplete({
        foodName,
        scanType: activeTab,
        image: imageSource,
        parsedData: detectedProduct,
        is_valid_food: !nonFoodError
      });
    }, 1200);
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
              ML Food & Barcode Vision Scanner
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Trained on Indian & global foods • Real non-food filter
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
            { id: 'label', label: '🏷️ Label OCR' },
            { id: 'food', label: '🍎 Item' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCapturedPhoto(null);
                setDetectedProduct(null);
                setNonFoodError(null);
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
            {/* 1. Permanent Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${capturedPhoto ? 'hidden' : 'block'}`}
            />

            {/* 2. Real Captured Photo Preview */}
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured Real Food"
                className="w-full h-full object-cover"
              />
            )}

            {/* Camera Error Message Overlay */}
            {cameraError && !capturedPhoto && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">Camera Access Required</h4>
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
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {/* Scanning Reticle & Laser */}
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

            {/* Camera Switch / Flip Button */}
            {!capturedPhoto && !cameraError && (
              <button
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition-colors shadow-md z-10"
                title="Switch Camera (Front/Back)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Scanning processing loader */}
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
                <span className="font-extrabold text-base text-emerald-400 tracking-tight">
                  Analyzing Frame with ML...
                </span>
                <span className="text-xs text-slate-300 mt-1 text-center font-medium animate-pulse px-4">
                  {scanStep}
                </span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Real Capture Actions */}
          {!capturedPhoto && !scanning && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleCaptureButtonClick}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                {activeTab === 'barcode' ? "Scan Barcode / QR Frame" : "Capture Photo"}
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

          {/* 🚫 NON-FOOD / PERSON DETECTION WARNING BANNER */}
          {nonFoodError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Ban className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-rose-900 block text-sm">No Food Item Recognized</span>
                  <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">{nonFoodError}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200 flex gap-2">
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setNonFoodError(null);
                    startCamera();
                  }}
                  className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:bg-rose-500"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50"
                >
                  Upload Dish Image
                </button>
              </div>
            </div>
          )}

          {/* ✅ VALID FOOD CONFIRMATION & MACROS DISPLAY */}
          {capturedPhoto && !scanning && !nonFoodError && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Food Recognized: {detectedProduct?.category || "Indian Dish"}
                </span>
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
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{detectedProduct.name || detectedProduct.product_name}</div>
                  <div className="text-slate-500 text-[11px] flex gap-3 font-semibold">
                    <span>🔥 {detectedProduct.calories} kcal</span>
                    <span>💪 {detectedProduct.protein_g}g protein</span>
                    <span>🌾 {detectedProduct.carbs_g}g carbs</span>
                    <span>🥑 {detectedProduct.fat_g}g fat</span>
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

              {/* Popular Indian Food Quick Pickers */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Dal Tadka + Rice", "Paneer Bhurji + Roti", "Rajma Chawal", "Veg Poha", "Moong Cheela", "Fruit Bowl"].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomFoodTitle(name)}
                    className="text-[10px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold hover:bg-emerald-100/60"
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
                <span>View Full Nutritional Breakdown & Fit</span>
              </button>
            </div>
          )}

          {/* Quick Demo Test Presets */}
          {!capturedPhoto && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Or Test Sample Library
                </span>
                <span className="text-[10px] font-bold text-emerald-600">Instant Test</span>
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
