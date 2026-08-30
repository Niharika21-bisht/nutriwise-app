import React from 'react';
import { Leaf, Sparkles, Smartphone, Monitor, ChevronLeft, LogIn, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentScreen, setCurrentScreen, viewportMode, setViewportMode, userProfile, isLoggedIn, currentUser, theme, toggleTheme } = useApp();

  const isStandalone = ['welcome', 'auth', 'questionnaire', 'profile_created'].includes(currentScreen);

  const screenTitles = {
    home: 'NutriWise',
    profile: 'My Profile',
    diet_plan: 'Next Week Diet Plan',
    progress: 'Nutrition Calendar',
    scan: 'Food & Barcode Scanner',
    food_analysis: 'Nutritional Breakdown',
    make_meal_better: 'Make My Meal Better',
    water_tracker: 'Water Tracker',
    protein_tracker: 'Protein Tracker',
    meal_balance: 'Meal Balance & Golden Ratio',
    auth: 'Welcome to NutriWise',
    questionnaire: 'Personalization Wizard',
    profile_created: 'Profile Created'
  };

  const renderNavAvatar = () => {
    if (userProfile.profile_image) {
      if (userProfile.profile_image.startsWith('data:image') || userProfile.profile_image.startsWith('http')) {
        return <img src={userProfile.profile_image} alt="User" className="w-full h-full object-cover" />;
      }
      return <span className="text-xs">{userProfile.profile_image}</span>;
    }
    const initial = (userProfile.name || currentUser?.name || 'U')[0].toUpperCase();
    return <span className="text-xs font-black">{initial}</span>;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Side: Brand or Back Button */}
        <div className="flex items-center gap-2.5">
          {!['welcome', 'home', 'auth'].includes(currentScreen) && (
            <button
              onClick={() => setCurrentScreen(isLoggedIn ? 'home' : 'welcome')}
              className="p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setCurrentScreen(isLoggedIn ? 'home' : 'welcome')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight block leading-none">
                {currentScreen === 'home' || isStandalone ? 'NutriWise' : screenTitles[currentScreen] || 'NutriWise'}
              </span>
              {currentScreen === 'home' && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
                  Eat Better • Live Healthier
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick "Make My Meal Better" shortcut */}
          {!isStandalone && isLoggedIn && currentScreen !== 'make_meal_better' && (
            <button
              onClick={() => setCurrentScreen('make_meal_better')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-sm shadow-orange-500/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}

          {/* ☀️ / 🌙 Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Viewport switch toggle (Mobile vs Desktop) */}
          <button
            onClick={() => setViewportMode(prev => prev === 'mobile' ? 'desktop' : 'mobile')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={viewportMode === 'mobile' ? 'Switch to Desktop View' : 'Switch to Mobile View'}
          >
            {viewportMode === 'mobile' ? (
              <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          {/* User Profile / Auth Button */}
          {isLoggedIn ? (
            <button
              onClick={() => setCurrentScreen('profile')}
              className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center overflow-hidden border border-emerald-300 dark:border-emerald-500 shadow-sm relative group"
              title={`${userProfile.name || 'User'} (${userProfile.email || ''})`}
            >
              {renderNavAvatar()}
            </button>
          ) : (
            currentScreen !== 'auth' && (
              <button
                onClick={() => setCurrentScreen('auth')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
