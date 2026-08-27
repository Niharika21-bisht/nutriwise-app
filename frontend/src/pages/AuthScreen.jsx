import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { setCurrentScreen, userProfile, updateProfile, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: userProfile.name || 'Niharika',
    email: userProfile.email || 'niharika@example.com',
    phone: '9876543210',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name || 'Niharika',
      email: formData.email || 'niharika@example.com'
    });
    if (isSignUp) {
      showToast("Account created! Let's personalize your plan 🚀");
      setCurrentScreen('questionnaire');
    } else {
      showToast("Welcome back, " + (formData.name || 'Niharika') + "! 👋");
      setCurrentScreen('home');
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Niharika Bisht',
      email: 'niharika@nutriwise.app',
      phone: '+91 98765 43210',
      password: 'demoPassword123',
      confirmPassword: 'demoPassword123'
    });
    showToast("Filled demo credentials ✨");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              NW
            </div>
            <span className="font-extrabold text-slate-800 text-lg">NutriWise</span>
          </div>

          <button
            onClick={handleDemoFill}
            className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-200/80 transition-colors"
          >
            ⚡ Quick Fill Demo
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              !isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Log In
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isSignUp ? "Let's create your account" : "Welcome back to NutriWise"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSignUp
            ? "Your journey to balanced, effortless nutrition starts here."
            : "Sign in to access your nutrition score, logged meals, and diet plan."}
        </p>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Niharika Bisht"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? "Continue to Personalization" : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-[11px] text-slate-400">
          By continuing, you agree to NutriWise's Terms & Health Guidelines.
        </p>
      </div>
    </div>
  );
}
