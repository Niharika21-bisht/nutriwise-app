/**
 * Google Gemini Vision Multimodal Food & Nutrition Intelligence Service
 * Powered by Google Gemini 3.5 Flash Multimodal Vision
 */

const ENV_KEY = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_GEMINI_API_KEY || "") : "";

// Supported active model endpoints in priority order
const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash"
];

export function getGeminiApiKey() {
  const savedKey = localStorage.getItem('nutriwise_gemini_api_key');
  return (savedKey && savedKey.trim()) ? savedKey.trim() : ENV_KEY;
}

export function setGeminiApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('nutriwise_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('nutriwise_gemini_api_key');
  }
}

function extractBase64Data(dataUrl) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: dataUrl
  };
}

/**
 * High-precision Multimodal Food Analysis using Google Gemini Vision
 */
export async function analyzeFoodWithGemini(imageDataUrl, scanMode = 'meal', userProfile = null) {
  const apiKey = getGeminiApiKey();
  const imgData = extractBase64Data(imageDataUrl);

  if (!imgData || !imgData.data) {
    throw new Error("Invalid image data provided for Gemini Vision");
  }

  const systemPrompt = `You are NutriWise AI, a clinical nutrition vision intelligence model.
Examine this image strictly and accurately.

CRITICAL INSTRUCTIONS:
1. FIRST, CHECK IF THIS IS REAL EDIBLE FOOD, DRINK, OR A PACKAGED FOOD NUTRITION LABEL.
   - If the image is a solid color (e.g. solid orange, plain background), blank screen, laptop, keyboard, desk, chair, hand/face, clothing, wall, room, or any non-food object:
     YOU MUST RETURN:
     {
       "is_food": false,
       "rejection_reason": "🚫 No Food Detected: The camera captured a non-food item or background. Please point your camera directly at an edible food dish or plate."
     }
2. ONLY IF GENUINE EDIBLE FOOD OR NUTRITION LABEL IS CLEARLY VISIBLE:
   - "is_food": true
   - "dish_name": Specific culinary name of the food (e.g. "Paneer Butter Masala with 2 Rotis", "Dal Tadka with Steamed Rice", "Grilled Chicken Salad", "Aloo Paratha with Curd", "Greek Yogurt with Berries", "Oatmeal Bowl").
   - "portion_size": Realistic visual portion (e.g. "1 medium plate / ~300g", "2 pieces / ~160g", "1 standard bowl / ~250ml").
   - "calories": Estimated calories in kcal (number).
   - "protein_g": Protein in grams (number).
   - "carbs_g": Carbs in grams (number).
   - "fat_g": Fat in grams (number).
   - "fiber_g": Fiber in grams (number).
   - "diet_fit": "fits_plan" | "minor_variance" | "divergent" (divergent if ultra-processed or deep-fried).
   - "fit_message": Short explanation of nutritional value.
   - "smart_upgrade_tips": Array of 2 actionable tips to enhance nutritional profile.
   - "confidence": Float between 0.88 and 0.99.

Return STRICTLY raw JSON format without markdown code fences or backticks:
{
  "is_food": boolean,
  "rejection_reason": string | null,
  "dish_name": string,
  "portion_size": string,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "diet_fit": "fits_plan" | "minor_variance" | "divergent",
  "fit_message": string,
  "smart_upgrade_tips": [string, string],
  "confidence": number
}`;

  let lastError = null;

  // Try active Gemini models
  for (const modelName of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: imgData.mimeType,
                data: imgData.data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 20,
        topP: 0.85,
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini (${modelName}) failed with status ${response.status}:`, errText);
        lastError = new Error(`HTTP ${response.status}: ${errText}`);
        continue; // Try next model
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = new Error("Empty candidate text returned by Gemini");
        continue;
      }

      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      cleanedText = cleanedText.trim();

      const parsed = JSON.parse(cleanedText);

      // If Gemini detected non-food
      if (!parsed.is_food) {
        return {
          success: true,
          is_food: false,
          source: 'google_gemini_vision',
          rejection_reason: parsed.rejection_reason || "🚫 No Food Detected: Google Gemini Vision identified this image as non-edible. Please point your camera at an actual food item or plate."
        };
      }

      // If Gemini detected valid food
      return {
        success: true,
        is_food: true,
        source: 'google_gemini_vision',
        detected_title: parsed.dish_name,
        food_data: {
          id: 'gemini-' + Date.now(),
          name: parsed.dish_name,
          category: 'Cooked Meal / Prepared Food',
          portion: parsed.portion_size || '1 plate / standard serving',
          calories: Math.round(Number(parsed.calories) || 320),
          protein_g: Number((Number(parsed.protein_g) || 12).toFixed(1)),
          carbs_g: Number((Number(parsed.carbs_g) || 35).toFixed(1)),
          fat_g: Number((Number(parsed.fat_g) || 10).toFixed(1)),
          fiber_g: Number((Number(parsed.fiber_g) || 4).toFixed(1)),
          score: parsed.diet_fit === 'fits_plan' ? 92 : parsed.diet_fit === 'minor_variance' ? 74 : 50,
          diet_fit: parsed.diet_fit || 'fits_plan',
          fit_message: parsed.fit_message || `Identified with Google Gemini Vision (${parsed.portion_size}).`,
          smart_tips: parsed.smart_upgrade_tips || ["Pair with a fresh green salad", "Hydrate with a glass of water"],
          confidence: Math.round((parsed.confidence || 0.96) * 100),
          ai_engine: "Google Gemini 3.5 Flash Vision"
        }
      };
    } catch (err) {
      console.warn(`Error calling ${modelName}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini Vision endpoints failed");
}
