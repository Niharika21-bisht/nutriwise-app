import React, { useState, useRef } from 'react';
import { User, Edit3, Settings, ShieldCheck, ChevronRight, UtensilsCrossed, CalendarDays, Award, Heart, Flame, Sparkles, Check, LogOut, Camera, Bell, Droplet, Clock, Upload, Trash2, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SPORTS_LIST, GOALS_LIST, MEAL_FREQUENCIES, DIETARY_PREFERENCES, ALLERGY_OPTIONS, AVATAR_OPTIONS } from '../data/sampleData';

export default function ProfileScreen() {
  const { userProfile, macroTargets, todayLog, updateProfile, setCurrentScreen, logout, showToast, triggerNotification, get7DayWaterData, get7DayStepData, addSteps, updateStepTarget, theme, setThemeMode, toggleTheme } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [selectedWaterDayIndex, setSelectedWaterDayIndex] = useState(6); // Default today (30/08)
  const [stepTimeframe, setStepTimeframe] = useState('Week'); // Week, Month, Year
  const [manualStepsInput, setManualStepsInput] = useState(1500);

  const water7DayList = get7DayWaterData ? get7DayWaterData() : [];
  const step7DayList = get7DayStepData ? get7DayStepData() : [];
  const selectedWaterDay = water7DayList[selectedWaterDayIndex] || water7DayList[water7DayList.length - 1] || { amount: 0, fullDate: '30/08/2026' };

  // Edit form state
  const [formData, setFormData] = useState({ ...userProfile });
  const fileInputRef = useRef(null);

  const handleOpenEdit = () => {
    setFormData({ ...userProfile });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      age: Number(formData.age),
      height_cm: Number(formData.height_cm),
      weight_kg: Number(formData.weight_kg)
    });
    setEditModalOpen(false);
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image size must be under 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ profile_image: event.target.result });
        setAvatarModalOpen(false);
        showToast("Profile picture updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatarEmoji = (emoji) => {
    updateProfile({ profile_image: emoji });
    setAvatarModalOpen(false);
    showToast(`Avatar updated to ${emoji}! ✨`);
  };

  const handleRemoveProfileImage = () => {
    updateProfile({ profile_image: null });
    setAvatarModalOpen(false);
    showToast("Profile picture removed");
  };

  const toggleNotifications = () => {
    const nextState = !userProfile.notifications_enabled;
    updateProfile({ notifications_enabled: nextState });
    if (nextState) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            triggerNotification("🔔 Notifications Activated", "You'll receive timely meal & hydration reminders!");
          }
        });
      } else {
        showToast("In-app meal reminders enabled! 🔔");
      }
    } else {
      showToast("Reminders turned off");
    }
  };

  const handleTestNotification = () => {
    triggerNotification("💧 Hydration & Meal Alert", "Time for your 250ml water boost & daily nutrition log!");
  };

  const handleTimingChange = (mealKey, timeValue) => {
    const currentTimings = userProfile.meal_timings || { breakfast: "08:30", lunch: "13:15", snack: "16:30", dinner: "20:00" };
    updateProfile({
      meal_timings: {
        ...currentTimings,
        [mealKey]: timeValue
      }
    });
  };

  const renderAvatarContent = () => {
    if (userProfile.profile_image) {
      if (userProfile.profile_image.startsWith('data:image') || userProfile.profile_image.startsWith('http')) {
        return <img src={userProfile.profile_image} alt={userProfile.name} className="w-full h-full object-cover" />;
      }
      return <span className="text-3xl">{userProfile.profile_image}</span>;
    }
    return <span className="text-2xl font-black">{userProfile.name ? userProfile.name[0].toUpperCase() : 'N'}</span>;
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-900 dark:to-emerald-950/30 p-5 rounded-3xl border border-emerald-100/80 dark:border-emerald-900/40 shadow-soft flex items-center justify-between relative overflow-hidden transition-colors">
        <div className="flex items-center gap-3.5">
          {/* Avatar with edit badge */}
          <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden border-2 border-white dark:border-slate-800">
              {renderAvatarContent()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md text-[10px] group-hover:scale-110 transition-transform">
              <Camera className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {userProfile.name || 'Niharika'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full capitalize">
                {userProfile.user_type === 'athlete' ? `🏃‍♀️ Athlete (${userProfile.sport || 'Sports'})` : '👤 General User'}
              </span>
              {userProfile.auth_provider === 'google' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google Verified
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block truncate max-w-[170px]">
              {userProfile.email || 'user@gmail.com'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <button
            onClick={handleOpenEdit}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Body & Metabolic Stats */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Body & Metabolic Stats
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            BMI: {macroTargets.bmi} ({macroTargets.bmi_category})
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Age</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{userProfile.age} yrs</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Height</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{userProfile.height_cm} cm</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Weight</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{userProfile.weight_kg} kg</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">BMR</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{macroTargets.bmr}</span>
          </div>
        </div>
      </div>

      {/* 💧 1. 7-Day Water Intake Analytics Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft space-y-4">
        {/* Header */}
        <div
          onClick={() => setCurrentScreen('water_tracker')}
          className="flex items-center justify-between cursor-pointer group"
        >
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
            Water Intake
          </h3>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Subheader: Average tooltip & Target */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Average:</span>
            {/* Interactive Mint-Green Tooltip */}
            <div className="relative bg-emerald-100/90 text-emerald-900 px-3 py-1 rounded-xl text-center font-black text-xs shadow-xs border border-emerald-200 animate-fadeIn">
              <div>{selectedWaterDay.amount}</div>
              <div className="text-[9px] font-semibold text-emerald-700">{selectedWaterDay.fullDate}</div>
              {/* Tooltip downward notch */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-100/90 rotate-45 border-r border-b border-emerald-200" />
            </div>
          </div>

          <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-orange-400" />
            <span>Target: {macroTargets.target_water_ml || 2500}ml</span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2 flex items-stretch gap-2">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-1 text-right h-44">
            <span>2,999</span>
            <span>2,249</span>
            <span>1,500</span>
            <span>750</span>
            <span>0</span>
          </div>

          {/* 7 Vertical Bar Columns */}
          <div className="flex-1 relative h-44 flex items-end justify-between gap-1.5 pt-2">
            {/* Horizontal Dashed Target Line at ~2500ml (~83% height) */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-orange-300 pointer-events-none z-10"
              style={{ bottom: `${(2500 / 3000) * 100}%` }}
            />

            {water7DayList.map((item, idx) => {
              const maxCap = 3000;
              const fillPct = Math.min(100, Math.max(0, (item.amount / maxCap) * 100));
              const isSelected = selectedWaterDayIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWaterDayIndex(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Vertical Pill Track */}
                  <div className={`w-full h-full rounded-full bg-sky-50/70 border ${isSelected ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-100'} flex flex-col justify-end p-0.5 relative overflow-hidden transition-all duration-200`}>
                    {/* Filled Blue Liquid Cylinder */}
                    <div
                      className="w-full bg-gradient-to-t from-sky-500 to-cyan-400 rounded-full transition-all duration-700 shadow-xs"
                      style={{ height: `${fillPct}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span className={`text-[10px] mt-2 font-bold transition-colors ${isSelected ? 'text-sky-600 font-black' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 👟 2. Step Activity Analytics Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft space-y-4">
        {/* Header */}
        <div
          onClick={() => setStepModalOpen(true)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
            Step
          </h3>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Subheader: Today & Target */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-bold">
            <span>Today:</span>
            <span className="text-slate-900 font-black text-sm">{todayLog.steps || 0}</span>
          </div>

          <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-orange-400" />
            <span>Target: {todayLog.step_target || 10000}</span>
          </div>
        </div>

        {/* Timeframe Switcher Tabs (Week, Month, Year) */}
        <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-500">
          {['Week', 'Month', 'Year'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStepTimeframe(tab)}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                stepTimeframe === tab
                  ? 'bg-white text-slate-900 font-extrabold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chart Canvas with "Connect" Overlay */}
        <div className="relative pt-4 pb-2 flex items-stretch gap-2">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-1 text-right h-44">
            <span>12,000</span>
            <span>9,000</span>
            <span>6,000</span>
            <span>3,000</span>
            <span>0</span>
          </div>

          {/* 7 Vertical Bar Columns */}
          <div className="flex-1 relative h-44 flex items-end justify-between gap-1.5 pt-2">
            {/* Horizontal Dashed Target Line at 10,000 (~83%) */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-orange-300 pointer-events-none z-10"
              style={{ bottom: `${(10000 / 12000) * 100}%` }}
            />

            {/* Centered Connect Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
              <button
                onClick={() => setStepModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-amber-50/90 hover:bg-amber-100/90 text-amber-600 border border-amber-200/80 font-black text-xs shadow-md backdrop-blur-xs active:scale-95 transition-all hover:scale-105"
              >
                Connect
              </button>
            </div>

            {step7DayList.map((item, idx) => {
              const maxCap = 12000;
              const fillPct = Math.min(100, Math.max(0, (item.steps / maxCap) * 100));

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end"
                >
                  {/* Vertical Pill Track */}
                  <div className="w-full h-full rounded-full bg-slate-50/80 border border-slate-100 flex flex-col justify-end p-0.5 relative overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-orange-400 to-amber-300 rounded-full transition-all duration-700"
                      style={{ height: `${fillPct}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span className="text-[10px] mt-2 font-bold text-slate-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meal Timings Configuration */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Scheduled Meal Timings</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Auto-Reminders</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Breakfast</span>
              <input
                type="time"
                value={userProfile.meal_timings?.breakfast || "08:30"}
                onChange={(e) => handleTimingChange('breakfast', e.target.value)}
                className="text-xs font-black text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍳</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Lunch</span>
              <input
                type="time"
                value={userProfile.meal_timings?.lunch || "13:15"}
                onChange={(e) => handleTimingChange('lunch', e.target.value)}
                className="text-xs font-black text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🥗</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Snack</span>
              <input
                type="time"
                value={userProfile.meal_timings?.snack || "16:30"}
                onChange={(e) => handleTimingChange('snack', e.target.value)}
                className="text-xs font-black text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍎</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Dinner</span>
              <input
                type="time"
                value={userProfile.meal_timings?.dinner || "20:00"}
                onChange={(e) => handleTimingChange('dinner', e.target.value)}
                className="text-xs font-black text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍲</span>
          </div>
        </div>
      </div>

      {/* ☀️ / 🌙 Theme & Appearance Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">App Appearance</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Switch between Light and Dark mode</p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Reminders Control */}
      <div className="bg-gradient-to-br from-white to-cyan-50/40 dark:from-slate-900 dark:to-cyan-950/30 p-4 rounded-3xl border border-cyan-100 dark:border-cyan-900/40 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Smart Reminders</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Meal inputs & 90-min hydration intervals</p>
            </div>
          </div>

          <button
            onClick={toggleNotifications}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              userProfile.notifications_enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </button>
        </div>

        {userProfile.notifications_enabled && (
          <div className="pt-2 border-t border-cyan-100 dark:border-cyan-900/50 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-800 dark:text-cyan-300">🔔 Push & In-app alerts enabled</span>
            <button
              onClick={handleTestNotification}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 active:scale-95 shadow-sm"
            >
              Test Alert
            </button>
          </div>
        )}
      </div>

      {/* Navigation Quick Links */}
      <div className="space-y-2">
        <button
          onClick={() => setCurrentScreen('diet_plan')}
          className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-white">7-Day Next Week Diet Plan</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">View 7-day meal schedule & grocery checklist</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>

        <button
          onClick={() => setCurrentScreen('progress')}
          className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-white">Nutrition Calendar & Progress</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Live dynamic score tracking & skip analysis</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Logout Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setLogoutModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of NutriWise</span>
        </button>
      </div>

      {/* Avatar / Profile Picture Selection Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Change Profile Picture</h3>
              <button onClick={() => setAvatarModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom File Upload Option */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-center">
              <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Upload Photo from Device</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Supports PNG, JPG (Max 2MB)</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 mx-auto hover:bg-emerald-500"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image File</span>
              </button>
            </div>

            {/* Emoji Avatar Pickers */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Or Choose an Avatar:</span>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAvatarEmoji(emoji)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-100 dark:border-slate-700 hover:border-emerald-300 text-2xl flex items-center justify-center transition-all hover:scale-105"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {userProfile.profile_image && (
              <button
                onClick={handleRemoveProfileImage}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Picture</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Log Out?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to end your current session?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => { setLogoutModalOpen(false); logout(); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:bg-rose-500"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Full Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Edit Profile & Target Engine</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">User Category</label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="general">👤 General User</option>
                    <option value="athlete">🏃‍♀️ Sports / Athlete</option>
                  </select>
                </div>

                {formData.user_type === 'athlete' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sport Type</label>
                    <select
                      value={formData.sport || 'running'}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {SPORTS_LIST.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Nutrition Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                >
                  {GOALS_LIST.map(g => (
                    <option key={g.id} value={g.id}>{g.icon} {g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diet Preference</label>
                  <select
                    value={formData.dietary_preference}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                  >
                    {DIETARY_PREFERENCES.map(d => (
                      <option key={d.id} value={d.id}>{d.icon} {d.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meal Schedule</label>
                  <select
                    value={formData.meal_frequency}
                    onChange={(e) => setFormData({ ...formData, meal_frequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold"
                  >
                    {MEAL_FREQUENCIES.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95"
                >
                  Save Changes & Recalculate Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👟 Step Activity Connect & Simulator Modal */}
      {stepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  👟
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Daily Steps & Activity Sync</h3>
              </div>
              <button
                onClick={() => setStepModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect your pedometer device (Google Fit / Apple Health) or log steps manually to maintain metabolic activity.
            </p>

            {/* Quick 1-Tap Add Steps */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">1-Tap Step Boost:</span>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2500, 5000].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      addSteps(count);
                      setStepModalOpen(false);
                    }}
                    className="py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-xl transition-all active:scale-95 text-center"
                  >
                    +{count.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Custom Step Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSteps(Number(manualStepsInput));
                setStepModalOpen(false);
              }}
              className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Step Count:
                </label>
                <input
                  type="number"
                  min={100}
                  max={50000}
                  step={100}
                  required
                  value={manualStepsInput}
                  onChange={(e) => setManualStepsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/20 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Connected to Google Health Connect / Pedometer sensor! 👟✨");
                    setStepModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  🔗 Sync Sensor
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/30 hover:opacity-95"
                >
                  Log Steps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
