import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Sparkles, Flame, Dumbbell, Droplet } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileCreatedScreen() {
  const { userProfile, macroTargets, setCurrentScreen } = useApp();

  useEffect(() => {
    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Banner */}
      <div className="pt-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          You're All Set! 🎉
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
          We've built your custom metabolic blueprint and personalized nutrition schedule.
        </p>
      </div>

      {/* Summary Profile Card */}
      <div className="my-6 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
        {/* User Identity Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800">{userProfile.name || 'Niharika'}</h3>
            <span className="text-xs font-semibold text-emerald-600 capitalize">
              {userProfile.user_type === 'athlete' ? `🏃‍♀️ Athlete (${userProfile.sport || 'Sports'})` : '👤 General User'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">BMI Score</span>
            <span className="text-sm font-black text-slate-800">{macroTargets.bmi} ({macroTargets.bmi_category})</span>
          </div>
        </div>

        {/* Selected Preferences Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-base">🎯</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Primary Goal</span>
              <span className="font-bold text-slate-800 capitalize truncate block">
                {userProfile.goal?.replace('_', ' ') || 'Overall Fitness'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-base">🥗</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Diet Style</span>
              <span className="font-bold text-slate-800 capitalize truncate block">
                {userProfile.dietary_preference?.replace('_', ' ') || 'Vegetarian'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-base">🍽️</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Frequency</span>
              <span className="font-bold text-slate-800 capitalize truncate block">
                {userProfile.meal_frequency?.replace('_', ' ') || '3 Meals / Day'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-base">📏</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Body Stats</span>
              <span className="font-bold text-slate-800 truncate block">
                {userProfile.height_cm} cm • {userProfile.weight_kg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Daily Calculated Targets */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-around">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
              <Flame className="w-3 h-3" />
              <span>Target</span>
            </div>
            <div className="text-base font-extrabold mt-0.5">{macroTargets.target_calories}</div>
            <div className="text-[9px] text-emerald-200 uppercase">kcal/day</div>
          </div>

          <div className="w-[1px] h-8 bg-emerald-400/40" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
              <Dumbbell className="w-3 h-3" />
              <span>Protein</span>
            </div>
            <div className="text-base font-extrabold mt-0.5">{macroTargets.target_protein_g}g</div>
            <div className="text-[9px] text-emerald-200 uppercase">Daily</div>
          </div>

          <div className="w-[1px] h-8 bg-emerald-400/40" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
              <Droplet className="w-3 h-3" />
              <span>Water</span>
            </div>
            <div className="text-base font-extrabold mt-0.5">{(macroTargets.target_water_ml / 1000).toFixed(1)}L</div>
            <div className="text-[9px] text-emerald-200 uppercase">Target</div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pb-6">
        <button
          onClick={() => setCurrentScreen('home')}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Home Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
