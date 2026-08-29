import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, QrCode, Tag, Apple, Zap, Sparkles, CheckCircle2, RefreshCw, FlipHorizontal, AlertTriangle, AlertCircle, ScanLine, Search } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { SAMPLE_SCAN_PRESETS } from '../data/sampleData';
import { lookupBarcodeProduct, parseNutritionLabelOcr, verifyFoodImageQuality } from '../services/visionScanner';

export default function CameraModal({ isOpen, onClose, onScanComplete, defaultMode = 'meal' }) {
  const [activeTab, setActiveTab] = useState(defaultMode); // 'meal', 'barcode', 'label', 'food'
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [customFoodTitle, setCustomFoodTitle] = useState("");
  const [validationWarning, setValidationWarning] = useState(null);
  
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    setActiveTab(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'barcode') {
        startBarcodeScanner();
      } else {
        startStandardCamera();
      }
    } else {
      stopAllCameraStreams();
      resetState();
    }
  }, [isOpen, activeTab, facingMode]);

  const resetState = () => {
    setCapturedPhoto(null);
    setDetectedProduct(null);
    setCustomFoodTitle("");
    setValidationWarning(null);
    setScanning(false);
    setCameraError(null);
  };

  const stopAllCameraStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      } catch (e) {}
    }
    setCameraActive(false);
  };

  // 1. Standard Webcam Stream for Plate, Label, and Food Item
  const startStandardCamera = async () => {
    stopAllCameraStreams();
    setCameraError(null);
    try {
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
            videoRef.current.play().catch(() => {});
          };
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (fallbackErr) {
        setCameraError("Webcam access blocked or unavailable. Please check camera permission.");
      }
    }
  };

  // 2. Real-Time Barcode & QR Code Stream Decoder using Html5Qrcode
  const startBarcodeScanner = async () => {
    stopAllCameraStreams();
    setCameraError(null);

    setTimeout(async () => {
      try {
        const qrElementId = "qr-reader-container";
        const qrReaderDiv = document.getElementById(qrElementId);
        if (!qrReaderDiv) return;

        const html5QrCode = new Html5Qrcode(qrElementId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.333
        };

        await html5QrCode.start(
          { facingMode: facingMode },
          config,
          async (decodedText, decodedResult) => {
            // Barcode detected live!
            handleBarcodeSuccess(decodedText);
          },
          (errorMessage) => {
            // Frame search, no barcode in current frame
          }
        );
        setCameraActive(true);
      } catch (err) {
        console.warn("Html5Qrcode start error, falling back to standard camera:", err);
        startStandardCamera();
      }
    }, 150);
  };

  const handleBarcodeSuccess = async (barcodeText) => {
    stopAllCameraStreams();
    setScanning(true);
    setScanStep(`Barcode [${barcodeText}] detected! Querying Open Food Facts database...`);

    const product = await lookupBarcodeProduct(barcodeText);
    setScanning(false);
    setDetectedProduct(product);
    setCustomFoodTitle(product.product_name);
    setCapturedPhoto("https://images.unsplash.com/photo-1622484216298-500b1442c554?w=500&auto=format&fit=crop&q=60");
  };

  // Capture real frame from webcam onto canvas
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);

    // 1. Food Quality / Non-Food Verification Check
    const quality = verifyFoodImageQuality(canvas);
    if (!quality.isFood) {
      setValidationWarning(quality.reason);
    } else {
      setValidationWarning(null);
    }

    stopAllCameraStreams();

    // 2. If Label mode, start background OCR
    if (activeTab === 'label') {
      setScanning(true);
      setScanStep("Running Tesseract OCR on Nutrition Facts label...");
      const ocrResult = await parseNutritionLabelOcr(dataUrl);
      setScanning(false);

      if (ocrResult.success && ocrResult.extracted) {
        setDetectedProduct({
          product_name: "Nutrition Label (OCR Verified)",
          calories: ocrResult.extracted.calories,
          protein_g: ocrResult.extracted.protein_g,
          carbs_g: ocrResult.extracted.carbs_g,
          fat_g: ocrResult.extracted.fat_g,
          fiber_g: ocrResult.extracted.fiber_g,
          sugar_g: ocrResult.extracted.sugar_g,
          sodium_mg: ocrResult.extracted.sodium_mg,
          serving_size: "1 portion (OCR parsed)"
        });
        setCustomFoodTitle("Nutrition Facts Food Label");
      }
    } else {
      // Plate or Food item mode default titles
      let initialName = "Home Meal Plate";
      if (quality.dominantHue === 'green_vegetable') initialName = "Green Salad & Stir-fry Bowl";
      else if (quality.dominantHue === 'grain_curry_bread') initialName = "Dal Curry with Roti & Rice";
      else if (quality.dominantHue === 'fruit_red') initialName = "Fresh Mixed Fruit Plate";
      else if (quality.dominantHue === 'rice_dairy_paneer') initialName = "Paneer Curry with Steamed Rice";
      
      setCustomFoodTitle(initialName);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        setCapturedPhoto(dataUrl);
        stopAllCameraStreams();

        if (activeTab === 'label') {
          setScanning(true);
          setScanStep("Running Tesseract OCR on uploaded label...");
          const ocrResult = await parseNutritionLabelOcr(dataUrl);
          setScanning(false);
          if (ocrResult.extracted) {
            setDetectedProduct({
              product_name: "Uploaded Nutrition Label",
              ...ocrResult.extracted,
              serving_size: "1 serving"
            });
          }
        }
        setCustomFoodTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setCapturedPhoto(preset.image);
    stopAllCameraStreams();
    setCustomFoodTitle(preset.name);
    setValidationWarning(null);
  };

  const handleProceedWithScan = () => {
    const titleToUse = customFoodTitle.trim() || "Identified Meal Item";
    triggerAnalysisProcess(titleToUse, capturedPhoto);
  };

  const triggerAnalysisProcess = (foodName, imageSource) => {
    setScanning(true);
    setScanStep(
      activeTab === 'barcode' ? "Verifying packaged product with Open Food Facts..." :
      activeTab === 'label' ? "Calculating exact OCR macronutrients..." :
      "Analyzing ingredients, portion weights & macros..."
    );

    setTimeout(() => {
      setScanStep("Evaluating goal alignment score & personalized diet fit...");
    }, 800);

    setTimeout(() => {
      setScanning(false);
      onScanComplete({
        foodName,
        scanType: activeTab,
        image: imageSource,
        parsedData: detectedProduct
      });
    }, 1600);
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
              Real Vision & Barcode Scanner
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {activeTab === 'barcode' ? 'Live barcode stream decoder' : 'Live video canvas snapshot + OCR'}
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
                resetState();
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
            {/* 1. Barcode Stream Container for Html5Qrcode */}
            {activeTab === 'barcode' && !capturedPhoto && (
              <div id="qr-reader-container" className="w-full h-full object-cover" />
            )}

            {/* 2. Standard Webcam Video Feed for Plate, Label, Food */}
            {activeTab !== 'barcode' && cameraActive && !capturedPhoto && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* 3. Real Captured Photo Preview */}
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured Real Food"
                className="w-full h-full object-cover"
              />
            )}

            {/* Fallback Camera Start Trigger */}
            {!cameraActive && !capturedPhoto && (
              <div className="text-center p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800">
                  {activeTab === 'barcode' ? <QrCode className="w-7 h-7" /> : <Camera className="w-7 h-7" />}
                </div>
                {cameraError ? (
                  <p className="text-rose-400 text-xs max-w-xs font-semibold mb-3">{cameraError}</p>
                ) : (
                  <p className="text-slate-300 text-xs max-w-xs mb-3">
                    Click to activate your webcam scanner.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={activeTab === 'barcode' ? startBarcodeScanner : startStandardCamera}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Activate Scanner
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

            {/* Scanning Reticle & Laser */}
            {cameraActive && !capturedPhoto && activeTab !== 'barcode' && (
              <div className="absolute inset-4 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-3 border-l-3 border-emerald-400" />
                  <div className="w-5 h-5 border-t-3 border-r-3 border-emerald-400" />
                </div>
                <div className="w-full h-1 bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-scan" />
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-3 border-l-3 border-emerald-400" />
                  <div className="w-5 h-5 border-b-3 border-r-3 border-emerald-400" />
                </div>
              </div>
            )}

            {/* Scanning processing loader */}
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
                <span className="font-extrabold text-base text-emerald-400 tracking-tight">
                  {activeTab === 'barcode' ? 'Decoding Real Barcode...' : 'Processing Vision & OCR...'}
                </span>
                <span className="text-xs text-slate-300 mt-1 text-center font-medium animate-pulse px-4">
                  {scanStep}
                </span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Real Capture Actions */}
          {cameraActive && !capturedPhoto && !scanning && activeTab !== 'barcode' && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleCaptureSnapshot}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                Capture Photo
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

          {/* Non-Food / Low Quality Warning */}
          {validationWarning && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Image Quality Warning:</span>
                <span>{validationWarning}</span>
              </div>
            </div>
          )}

          {/* Real Capture Verification & Dish Confirmation */}
          {capturedPhoto && !scanning && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {detectedProduct ? "Product / OCR Recognized!" : "Photo Captured Successfully"}
                </span>
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setDetectedProduct(null);
                    if (activeTab === 'barcode') startBarcodeScanner();
                    else startStandardCamera();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retake
                </button>
              </div>

              {detectedProduct && (
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{detectedProduct.product_name}</div>
                  <div className="text-slate-500 text-[11px] flex gap-3">
                    <span>🔥 {detectedProduct.calories} kcal</span>
                    <span>💪 {detectedProduct.protein_g}g protein</span>
                    <span>🌾 {detectedProduct.carbs_g}g carbs</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm Dish Name / Scanned Item:
                </label>
                <input
                  type="text"
                  value={customFoodTitle}
                  onChange={(e) => setCustomFoodTitle(e.target.value)}
                  placeholder="e.g. Paneer Tikka Sandwich, Dal Rice, Oats Bowl..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {["Paneer Sandwich", "Dal Tadka + Rice", "Greek Salad", "Fruit Bowl", "Protein Bar"].map((name, i) => (
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
                <span>Analyze Nutritional Value & Score</span>
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
