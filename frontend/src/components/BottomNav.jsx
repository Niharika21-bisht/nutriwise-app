import React from 'react';
import { Home, Camera, Sparkles, CalendarDays, User, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan', icon: Camera, highlight: true },
    { id: 'diet_plan', label: 'Diet Plan', icon: UtensilsCrossed },
    { id: 'progress', label: 'Progress', icon: CalendarDays },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Don't show bottom nav on welcome, auth, questionnaire, profile_created
  const hideOnScreens = ['welcome', 'auth', 'questionnaire', 'profile_created'];
  if (hideOnScreens.includes(currentScreen)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
      <nav className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-floating px-3 py-2 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3.5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-active:scale-95 transition-all duration-200 flex items-center justify-center">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 mt-1">Scan</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
