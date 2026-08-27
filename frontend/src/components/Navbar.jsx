import React from 'react';
import { Leaf, Sparkles, Smartphone, Monitor, ChevronLeft, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentScreen, setCurrentScreen, viewportMode, setViewportMode, resetTodayLog } = useApp();

  const isStandalone = ['welcome', 'auth', 'questionnaire', 'profile_created'].includes(currentScreen);

  const screenTitles = {
    home: 'NutriWise',
    profile: 'My Profile',
    diet_plan: 'Personalized Diet Plan',
    progress: 'Nutrition Progress',
    scan: 'Food & Meal Scanner',
    food_analysis: 'Nutritional Breakdown',
    make_meal_better: 'Make My Meal Better',
    auth: 'Welcome to NutriWise',
    questionnaire: 'Personalization Wizard',
    profile_created: 'Profile Created'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Side: Brand or Back Button */}
        <div className="flex items-center gap-2.5">
          {!['welcome', 'home'].includes(currentScreen) && (
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Go back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setCurrentScreen('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-base tracking-tight block leading-none">
                {currentScreen === 'home' || isStandalone ? 'NutriWise' : screenTitles[currentScreen] || 'NutriWise'}
              </span>
              {currentScreen === 'home' && (
                <span className="text-[10px] font-semibold text-emerald-600 tracking-wide">
                  Eat Better • Live Healthier
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2">
          {/* Quick "Make My Meal Better" shortcut */}
          {!isStandalone && currentScreen !== 'make_meal_better' && (
            <button
              onClick={() => setCurrentScreen('make_meal_better')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-sm shadow-orange-500/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Make Meal Better</span>
              <span className="sm:hidden">Upgrade</span>
            </button>
          )}

          {/* Viewport switch toggle (Mobile vs Desktop) */}
          <button
            onClick={() => setViewportMode(prev => prev === 'mobile' ? 'desktop' : 'mobile')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={viewportMode === 'mobile' ? 'Switch to Full Width Desktop View' : 'Switch to Mobile App Preview'}
          >
            {viewportMode === 'mobile' ? (
              <Monitor className="w-4 h-4 text-emerald-600" />
            ) : (
              <Smartphone className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Reset Demo State Button */}
          {currentScreen === 'home' && (
            <button
              onClick={resetTodayLog}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset today's test logs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
