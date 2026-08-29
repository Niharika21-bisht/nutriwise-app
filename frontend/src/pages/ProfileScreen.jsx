import React, { useState, useRef } from 'react';
import { User, Edit3, Settings, ShieldCheck, ChevronRight, UtensilsCrossed, CalendarDays, Award, Heart, Flame, Sparkles, Check, LogOut, Camera, Bell, Droplet, Clock, Upload, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SPORTS_LIST, GOALS_LIST, MEAL_FREQUENCIES, DIETARY_PREFERENCES, ALLERGY_OPTIONS, AVATAR_OPTIONS } from '../data/sampleData';

export default function ProfileScreen() {
  const { userProfile, macroTargets, updateProfile, setCurrentScreen, logout, showToast, triggerNotification } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
      <div className="bg-gradient-to-br from-white to-emerald-50/70 p-5 rounded-3xl border border-emerald-100/80 shadow-soft flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Avatar with edit badge */}
          <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden border-2 border-white">
              {renderAvatarContent()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md text-[10px] group-hover:scale-110 transition-transform">
              <Camera className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              {userProfile.name || 'Niharika'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full capitalize">
                {userProfile.user_type === 'athlete' ? `🏃‍♀️ Athlete (${userProfile.sport || 'Sports'})` : '👤 General User'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block truncate max-w-[170px]">
              {userProfile.email || 'niharika@example.com'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <button
            onClick={handleOpenEdit}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Edit3 className="w-4 h-4 text-emerald-600" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Body & Metabolic Stats */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Body & Metabolic Stats
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            BMI: {macroTargets.bmi} ({macroTargets.bmi_category})
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Age</span>
            <span className="text-sm font-black text-slate-800">{userProfile.age} yrs</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Height</span>
            <span className="text-sm font-black text-slate-800">{userProfile.height_cm} cm</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Weight</span>
            <span className="text-sm font-black text-slate-800">{userProfile.weight_kg} kg</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">BMR</span>
            <span className="text-sm font-black text-slate-800">{macroTargets.bmr}</span>
          </div>
        </div>
      </div>

      {/* Meal Timings Configuration */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scheduled Meal Timings</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">Auto-Reminders</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Breakfast</span>
              <input
                type="time"
                value={userProfile.meal_timings?.breakfast || "08:30"}
                onChange={(e) => handleTimingChange('breakfast', e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍳</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Lunch</span>
              <input
                type="time"
                value={userProfile.meal_timings?.lunch || "13:15"}
                onChange={(e) => handleTimingChange('lunch', e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🥗</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Snack</span>
              <input
                type="time"
                value={userProfile.meal_timings?.snack || "16:30"}
                onChange={(e) => handleTimingChange('snack', e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍎</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Dinner</span>
              <input
                type="time"
                value={userProfile.meal_timings?.dinner || "20:00"}
                onChange={(e) => handleTimingChange('dinner', e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-base">🍲</span>
          </div>
        </div>
      </div>

      {/* Notifications & Reminders Control */}
      <div className="bg-gradient-to-br from-white to-cyan-50/40 p-4 rounded-3xl border border-cyan-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Smart Reminders</h4>
              <p className="text-[10px] text-slate-500">Meal inputs & 90-min hydration intervals</p>
            </div>
          </div>

          <button
            onClick={toggleNotifications}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              userProfile.notifications_enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </button>
        </div>

        {userProfile.notifications_enabled && (
          <div className="pt-2 border-t border-cyan-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-800">🔔 Push & In-app alerts enabled</span>
            <button
              onClick={handleTestNotification}
              className="px-2.5 py-1 rounded-xl bg-white border border-cyan-200 text-[10px] font-bold text-cyan-700 hover:bg-cyan-50 active:scale-95 shadow-sm"
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
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-800">3-Day Personalized Diet Plan</div>
              <div className="text-[11px] text-slate-500">View upcoming meals & advance grocery list</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentScreen('progress')}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-800">Nutrition Calendar & Progress</div>
              <div className="text-[11px] text-slate-500">Live dynamic score tracking & skip analysis</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setLogoutModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of NutriWise</span>
        </button>
      </div>

      {/* Avatar / Profile Picture Selection Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Change Profile Picture</h3>
              <button onClick={() => setAvatarModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom File Upload Option */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center">
              <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">Upload Photo from Device</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG (Max 2MB)</p>
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
              <span className="text-xs font-bold text-slate-700 block mb-2">Or Choose an Avatar:</span>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAvatarEmoji(emoji)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-300 text-2xl flex items-center justify-center transition-all hover:scale-105"
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
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Log Out?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to end your current session?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
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
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg">Edit Profile & Target Engine</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Category</label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="general">👤 General User</option>
                    <option value="athlete">🏃‍♀️ Sports / Athlete</option>
                  </select>
                </div>

                {formData.user_type === 'athlete' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sport Type</label>
                    <select
                      value={formData.sport || 'running'}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Nutrition Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  {GOALS_LIST.map(g => (
                    <option key={g.id} value={g.id}>{g.icon} {g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diet Preference</label>
                  <select
                    value={formData.dietary_preference}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {DIETARY_PREFERENCES.map(d => (
                      <option key={d.id} value={d.id}>{d.icon} {d.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Schedule</label>
                  <select
                    value={formData.meal_frequency}
                    onChange={(e) => setFormData({ ...formData, meal_frequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
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
    </div>
  );
}
