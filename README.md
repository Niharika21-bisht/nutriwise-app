# 🥗 NutriWise — Smart Nutrition & Recommendation System

> **"Eat better. Understand better. Live healthier."**

NutriWise is an intelligent, personalized nutrition intelligence and diet recommendation web application. It bridges the gap between daily dietary habits and clinical metabolic goals through a multi-layer architecture:

```
UI → User Profile → Nutrition Engine → Diet Plan → Recommendation Engine → Food/Meal Analysis → Progress Dashboard
```

---

## 🌟 Key Features

### 1. 📱 Complete 10-Screen User Journey
- **Screen 1: Welcome & Onboarding**: Clean, fresh branding, value props, and quick entry.
- **Screen 2: Sign Up & Log In**: Fast authentication with 1-click demo credential filling.
- **Screen 3: 5-Step Personalization Wizard**:
  - *Step 1*: User Type (General vs Sports / Athlete with sport selector: Running, Weightlifting, Boxing, Swimming, Cricket, Football, etc.)
  - *Step 2*: Primary Focus (Overall Fitness, Calorie Control, Protein-focused, Hydration, Vitamins, Muscle Gain, Weight Management)
  - *Step 3*: Meal Frequency (2 meals, 3 meals, 3 meals + snacks, Grazing)
  - *Step 4*: Body Metrics (Age, Height, Weight with **Instant Real-Time BMI Calculation**)
  - *Step 5*: Dietary Preference (Vegetarian, Non-Veg, Vegan, Eggetarian) & Food Allergies (Dairy, Gluten, Nuts, Soy, etc.)
- **Screen 4: Profile Created Celebration**: Dynamic confetti celebration, target summary card, and instant target review.
- **Screen 5: Home Dashboard**: Circular animated Nutrition Score Gauge (e.g. 78/100, +6% vs yesterday), Macro & Hydration progress bars, Quick action shortcuts, Today's Meals Timeline with check-off logging, and a Quick Water intake logger (+250ml).
- **Screen 6: Profile & Settings**: Personal data, body stats, and an interactive **Edit Profile Modal** that dynamically recalculates diet plans and macro targets in real-time.
- **Screen 7: Progress & Analytics**: Interactive **August 2026 Monthly Calendar** with color-coded daily score badges, weekly score trend chart, and AI behavioral insights.
- **Screen 8: Personalized Diet Plan**: Rule-based meal schedule (Breakfast, Lunch, Snack, Dinner) with macro splits, ingredients, preparation times, and scientific **"Why this plan?"** rationale.
- **Screen 9: 3-Mode Food Scanner & Food Analysis**:
  - 🍽️ *Scan My Meal / Plate* (Multi-item portion estimation)
  - 🏷️ *Scan Food Label* (Packaged food OCR & hidden sugar/allergen detection)
  - 🍎 *Scan Single Food* (Instant macro breakdown & goal fit scoring)
  - Live Camera Viewfinder, Photo Upload, and 1-Click Test Presets.
  - Verdict Badges: 🟢 Good Choice (8.4/10), 🟡 Can Fit with Modification (6.2/10), 🔴 Not Ideal (3.8/10).
  - One-click *Log to Today's Dashboard* button.
- **Screen 10: "Make My Meal Better" Engine**:
  - Input any meal (e.g. *"Pizza + Cold Drink"*, *"Burger + Fries"*, *"Samosa + Chai"*).
  - Side-by-side comparison with upgraded versions, macro improvements (*Calories -38%, Protein +33%, Sugar -91%*), key ingredient swaps, and clinical reasoning.

---

## 🏗️ Architecture & Tech Stack

```
             ┌──────────────────────────────────────────────┐
             │       Frontend: React 18 + Vite + Tailwind   │
             │   (Lucide Icons, Recharts, Canvas Confetti)  │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │         User Profile & State Engine          │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │      Nutrition Engine (BMR, TDEE, Macros)    │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │        Dynamic Diet Plan Generator           │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │        Food Scanner & Recommendation Engine  │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │          Make My Meal Better Engine          │
             └──────────────────────┬───────────────────────┘
                                    │
                                    ▼
             ┌──────────────────────────────────────────────┐
             │        Backend: Python + FastAPI + Pytest    │
             └──────────────────────────────────────────────┘
```

---

## 🚀 How to Run Locally

### 1. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000` (or the port displayed in the terminal).

### 2. Run the Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Run Backend Engine Tests
```bash
cd backend
python test_engine.py
```

---

## 📦 How to Push this Project to GitHub

Pushing your completed project to GitHub is straightforward:

### Step 1: Initialize Git & Stage All Files
```bash
# In the root folder (nutriwise-app)
git init
git add .
git commit -m "feat: complete NutriWise MVP with 10 screens, scanner, and recommendation engine"
```

### Step 2: Create a New Repository on GitHub
1. Go to [github.com](https://github.com) and click **New Repository**.
2. Name it `nutriwise` (or your preferred name).
3. Do **not** check "Add a README" or ".gitignore" (we already included them).
4. Click **Create repository**.

### Step 3: Link & Push
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## 🛡️ License
MIT License. Built for the NutriWise Health & Wellness Platform.
