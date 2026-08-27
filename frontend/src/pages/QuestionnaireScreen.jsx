import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, Heart, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SPORTS_LIST, GOALS_LIST, MEAL_FREQUENCIES, DIETARY_PREFERENCES, ALLERGY_OPTIONS } from '../data/sampleData';

export default function QuestionnaireScreen() {
  const { userProfile, updateProfile, setCurrentScreen } = useApp();
  const [step, setStep] = useState(1);

  const [persona, setPersona] = useState(userProfile.user_type || 'general'); // 'general' | 'athlete'
  const [sport, setSport] = useState(userProfile.sport || 'running');
  const [goal, setGoal] = useState(userProfile.goal || 'overall_fitness');
  const [customGoal, setCustomGoal] = useState(userProfile.custom_goal || '');
  const [mealFreq, setMealFreq] = useState(userProfile.meal_frequency || '3_meals');
  
  // Body stats
  const [age, setAge] = useState(userProfile.age || 24);
  const [heightCm, setHeightCm] = useState(userProfile.height_cm || 165);
  const [weightKg, setWeightKg] = useState(userProfile.weight_kg || 59);

  // Diet & allergies
  const [dietPref, setDietPref] = useState(userProfile.dietary_preference || 'vegetarian');
  const [allergies, setAllergies] = useState(userProfile.allergies || []);

  // Real-time BMI calculation
  const heightM = heightCm / 100;
  const computedBmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let bmiCategory = "Normal weight";
  let bmiColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (computedBmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (computedBmi >= 25 && computedBmi < 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "bg-orange-100 text-orange-800 border-orange-300";
  } else if (computedBmi >= 30) {
    bmiCategory = "Obesity";
    bmiColor = "bg-rose-100 text-rose-800 border-rose-300";
  }

  const toggleAllergy = (allergyId) => {
    if (allergyId === 'none') {
      setAllergies([]);
      return;
    }
    setAllergies(prev => {
      const filtered = prev.filter(a => a !== 'none');
      if (filtered.includes(allergyId)) {
        return filtered.filter(a => a !== allergyId);
      } else {
        return [...filtered, allergyId];
      }
    });
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Save full profile and advance
      updateProfile({
        user_type: persona,
        sport: persona === 'athlete' ? sport : null,
        goal,
        custom_goal: customGoal,
        meal_frequency: mealFreq,
        age: Number(age),
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        dietary_preference: dietPref,
        allergies
      });
      setCurrentScreen('profile_created');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between pt-2 mb-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Step {step} of 5
            </span>
          </div>

          <button
            onClick={() => {
              updateProfile({
                user_type: persona,
                sport: persona === 'athlete' ? sport : null,
                goal,
                meal_frequency: mealFreq,
                age,
                height_cm: heightCm,
                weight_kg: weightKg,
                dietary_preference: dietPref,
                allergies
              });
              setCurrentScreen('profile_created');
            }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Skip
          </button>
        </div>

        {/* Step indicator pills */}
        <div className="grid grid-cols-5 gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Persona */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Tell us about yourself
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Which category best describes your daily routine and training?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setPersona('general')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  persona === 'general'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-extrabold text-sm text-slate-800">General User</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Healthy living, everyday work & active routines
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPersona('athlete')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  persona === 'athlete'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-3xl mb-2">🏃‍♀️</div>
                <div className="font-extrabold text-sm text-slate-800">Sports / Athlete</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Training for endurance, performance & athletic sports
                </div>
              </button>
            </div>

            {/* Sport selector if Athlete selected */}
            {persona === 'athlete' && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-soft">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  What primary sport do you practice?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPORTS_LIST.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        sport === s.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Primary Focus / Goal */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              What's your primary focus?
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Select your main nutrition and health objective:
            </p>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {GOALS_LIST.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    goal === g.id
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                      {g.icon}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-800">{g.title}</div>
                      <div className="text-[11px] text-slate-500">{g.desc}</div>
                    </div>
                  </div>
                  {goal === g.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Meal Pattern */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Meal Schedule & Pattern
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              How many meals do you prefer to eat throughout the day?
            </p>

            <div className="space-y-3">
              {MEAL_FREQUENCIES.map((mf) => (
                <button
                  key={mf.id}
                  type="button"
                  onClick={() => setMealFreq(mf.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    mealFreq === mf.id
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{mf.icon}</span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-800">{mf.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{mf.desc}</div>
                    </div>
                  </div>
                  {mealFreq === mf.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Body Metrics & Auto BMI */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Body & Metabolic Stats
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              We calculate your exact BMR and daily caloric baseline:
            </p>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic BMI Card */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Calculated BMI
                  </div>
                  <div className="text-2xl font-black tracking-tight mt-0.5">
                    {computedBmi}{' '}
                    <span className="text-xs font-normal text-slate-300">kg/m²</span>
                  </div>
                </div>
                <div className={`text-xs font-extrabold px-3 py-1 rounded-full border ${bmiColor}`}>
                  {bmiCategory}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Dietary Preference & Allergies */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Diet & Food Restrictions
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              What type of diet and food sensitivities do you follow?
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-slate-700">Dietary Style</label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_PREFERENCES.map((dp) => (
                  <button
                    key={dp.id}
                    type="button"
                    onClick={() => setDietPref(dp.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      dietPref === dp.id
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{dp.icon}</span>
                    <div>
                      <div className="font-extrabold text-xs text-slate-800">{dp.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies Checklist */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Food Allergies or Intolerances
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALLERGY_OPTIONS.map((opt) => {
                  const isChecked = allergies.includes(opt.id) || (opt.id === 'none' && allergies.length === 0);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleAllergy(opt.id)}
                      className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Continue Button */}
      <div className="pt-6 pb-2">
        <button
          onClick={handleNext}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{step === 5 ? "Generate My Nutrition Blueprint" : "Next Step"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
