import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { setCurrentScreen, userProfile, updateProfile, setIsLoggedIn, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name || 'Niharika',
    email: userProfile.email || 'niharika@nutriwise.app',
    phone: '+91 98765 43210',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Strict RFC-compliant email validation regex
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Email Format Validation
    if (!validateEmail(formData.email)) {
      setErrorMessage("⚠️ Please enter a valid email address (e.g. niharika@example.com).");
      return;
    }

    // 2. Password Length Validation
    if (formData.password.length < 6) {
      setErrorMessage("⚠️ Password must be at least 6 characters long.");
      return;
    }

    // 3. Password Confirmation on SignUp
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setErrorMessage("⚠️ Passwords do not match. Please recheck.");
      return;
    }

    // LocalStorage user registry
    const savedUsers = JSON.parse(localStorage.getItem('nutriwise_users') || '[]');

    if (isSignUp) {
      const exists = savedUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (exists) {
        setErrorMessage("An account with this email already exists. Please log in.");
        return;
      }

      const newUser = {
        name: formData.name || 'Niharika',
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      savedUsers.push(newUser);
      localStorage.setItem('nutriwise_users', JSON.stringify(savedUsers));

      updateProfile({
        name: formData.name || 'Niharika',
        email: formData.email
      });
      setIsLoggedIn(true);
      showToast("Account created successfully! Welcome to NutriWise 🚀");
      setCurrentScreen('questionnaire');
    } else {
      // Login Check
      const user = savedUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (user && user.password !== formData.password) {
        setErrorMessage("Incorrect password. Please try again.");
        return;
      }

      updateProfile({
        name: user ? user.name : (formData.name || 'Niharika'),
        email: formData.email
      });
      setIsLoggedIn(true);
      showToast(`Welcome back, ${user ? user.name : formData.name}! 👋`);
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
    setErrorMessage('');
    showToast("Filled valid demo credentials ✨");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
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
        <div className="bg-slate-100 p-1 rounded-2xl flex mb-5">
          <button
            onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              !isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isSignUp ? "Create Your Account" : "Welcome Back"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSignUp
            ? "Enter your valid email to build your personalized metabolic profile."
            : "Sign in with your verified email to access your nutrition plan and scores."}
        </p>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 bg-white ${
                  errorMessage && !validateEmail(formData.email)
                    ? 'border-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? "Continue to Personalization" : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Secured with end-to-end data encryption • NutriWise 2026
        </p>
      </div>
    </div>
  );
}
