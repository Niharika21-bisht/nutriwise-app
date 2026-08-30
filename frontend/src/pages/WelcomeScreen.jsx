import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Camera, HeartPulse, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WelcomeScreen() {
  const { setCurrentScreen, loginWithGoogle } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden animate-fadeIn">
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
      <div className="my-6 space-y-3 relative z-10">
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
      <div className="pb-6 space-y-2.5 relative z-10">
        {/* Google 1-Tap CTA */}
        <button
          onClick={() => setCurrentScreen('auth')}
          className="w-full py-3.5 px-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign In with Google (Gmail)</span>
        </button>

        <button
          onClick={() => setCurrentScreen('auth')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
