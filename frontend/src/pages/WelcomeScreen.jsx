import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Camera, HeartPulse, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WelcomeScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-1/3 left-0 w-60 h-60 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -ml-20" />

      {/* Top Header / Brand Logo */}
      <div className="pt-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold mb-4 border border-emerald-200/50">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Next-Gen Nutrition Intelligence
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Eat better.<br />
          Understand better.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            Live healthier.
          </span>
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Personalized nutrition engine tailored to your body, goals, and daily plate. Scan meals, get smart upgrades, and track your daily score.
        </p>
      </div>

      {/* Center Visual Showcase / Feature Cards */}
      <div className="my-8 space-y-3 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            🎯
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Personalized Diet Blueprint</h4>
            <p className="text-[11px] text-slate-500">Auto-tailored for General users & Athletes</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            📸
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Instant Meal & Label Scanner</h4>
            <p className="text-[11px] text-slate-500">Plate recognition + Packaged food OCR</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ✨
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Make My Meal Better</h4>
            <p className="text-[11px] text-slate-500">Transform regular meals into nutrient powerhouses</p>
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="pb-6 space-y-3 relative z-10">
        <button
          onClick={() => setCurrentScreen('questionnaire')}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => setCurrentScreen('auth')}
          className="w-full py-3.5 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
}
