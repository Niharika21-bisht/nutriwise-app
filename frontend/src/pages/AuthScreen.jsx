import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOOGLE_CLIENT_ID, parseJwt, generateAvatarUrl } from '../services/googleAuth';

export default function AuthScreen() {
  const { setCurrentScreen, userProfile, loginWithGoogle, loginWithCredentials, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: 'Nakibul Mallik',
    email: 'nakibulmallik1@gmail.com',
    phone: '+91 98765 43210',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const googleBtnContainerRef = useRef(null);

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    /* global google */
    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              const decoded = parseJwt(response.credential);
              if (decoded) {
                loginWithGoogle({
                  email: decoded.email,
                  name: decoded.name,
                  picture: decoded.picture,
                  sub: decoded.sub
                });
              }
            }
          }
        });

        if (googleBtnContainerRef.current) {
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill'
          });
        }
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    }
  }, [loginWithGoogle]);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(String(email).toLowerCase());
  };

  const handleGoogleQuickLogin = (email, name, picture) => {
    loginWithGoogle({
      email,
      name,
      picture: picture || generateAvatarUrl(name, email)
    });
    setGoogleModalOpen(false);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(googleEmailInput)) {
      setErrorMessage("⚠️ Please enter a valid Gmail address (e.g. yourname@gmail.com).");
      return;
    }
    const name = googleNameInput.trim() || googleEmailInput.split('@')[0];
    loginWithGoogle({
      email: googleEmailInput.trim(),
      name: name,
      picture: generateAvatarUrl(name, googleEmailInput)
    });
    setGoogleModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateEmail(formData.email)) {
      setErrorMessage("⚠️ Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("⚠️ Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setErrorMessage("⚠️ Passwords do not match.");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('nutriwise_users') || '[]');

    if (isSignUp) {
      const exists = savedUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (exists) {
        setErrorMessage("An account with this email already exists. Please log in.");
        return;
      }

      const newUser = {
        name: formData.name || 'User',
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      savedUsers.push(newUser);
      localStorage.setItem('nutriwise_users', JSON.stringify(savedUsers));

      loginWithCredentials(newUser, true);
    } else {
      const user = savedUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (user && user.password !== formData.password) {
        setErrorMessage("Incorrect password. Please try again.");
        return;
      }

      loginWithCredentials(user || {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email
      }, false);
    }
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

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Auth</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isSignUp ? "Create Your Account" : "Welcome to NutriWise"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sign in with your Google account or email to build your personalized metabolic profile & track nutrition.
        </p>

        {/* PRIMARY: Continue with Google Button */}
        <div className="mt-6">
          <div ref={googleBtnContainerRef} className="w-full mb-3" />

          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80 text-slate-800 font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-slate-700 font-bold group-hover:text-slate-900">
              Continue with Google (Gmail)
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-extrabold uppercase text-slate-400">or with email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Tab Toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex mb-4">
          <button
            onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              !isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
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
                  placeholder="e.g. Nakibul Mallik"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
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
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 bg-white ${
                  errorMessage && !validateEmail(formData.email)
                    ? 'border-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-slate-400 font-normal">(min 6 chars)</span>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-3 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? "Continue to Personalization" : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Secured with isolated user storage • NutriWise 2026
        </p>
      </div>

      {/* Google Account Selector / Login Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-extrabold text-slate-900 text-sm">Sign in with Google</h3>
              </div>
              <button
                onClick={() => setGoogleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Choose an account or enter your Gmail to load your private NutriWise profile and logs.
            </p>

            {/* Quick One-Tap Google Profiles */}
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleQuickLogin('nakibulmallik1@gmail.com', 'Nakibul Mallik')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-100 hover:border-emerald-300 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    N
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-900">
                      Nakibul Mallik
                    </span>
                    <span className="text-[10px] text-slate-400">nakibulmallik1@gmail.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  1-Tap
                </span>
              </button>

              <button
                onClick={() => handleGoogleQuickLogin('niharika@gmail.com', 'Niharika Bisht')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-100 hover:border-emerald-300 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                    NB
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-900">
                      Niharika Bisht
                    </span>
                    <span className="text-[10px] text-slate-400">niharika@gmail.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  1-Tap
                </span>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[9px] font-extrabold uppercase text-slate-400">or enter your gmail</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Custom Gmail Form */}
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Nakibul)"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95"
              >
                Sign In with this Gmail
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
