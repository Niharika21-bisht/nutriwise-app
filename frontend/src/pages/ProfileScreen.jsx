import React, { useState } from 'react';
import { User, Edit3, Settings, ShieldCheck, ChevronRight, UtensilsCrossed, CalendarDays, Award, Heart, Flame, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SPORTS_LIST, GOALS_LIST, MEAL_FREQUENCIES, DIETARY_PREFERENCES, ALLERGY_OPTIONS } from '../data/sampleData';

export default function ProfileScreen() {
  const { userProfile, macroTargets, updateProfile, setCurrentScreen, showToast } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({ ...userProfile });

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
    showToast("Profile & recommendations updated! ✨");
  };

  const toggleFormAllergy = (allergyId) => {
    if (allergyId === 'none') {
      setFormData({ ...formData, allergies: [] });
      return;
    }
    const current = formData.allergies || [];
    const exists = current.includes(allergyId);
    const updated = exists ? current.filter(a => a !== allergyId) : [...current.filter(a => a !== 'none'), allergyId];
    setFormData({ ...formData, allergies: updated });
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-white to-emerald-50/60 p-5 rounded-3xl border border-emerald-100/80 shadow-soft flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            {userProfile.name ? userProfile.name[0].toUpperCase() : 'N'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              {userProfile.name || 'Niharika Bisht'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full capitalize">
                {userProfile.user_type === 'athlete' ? `🏃‍♀️ Athlete (${userProfile.sport || 'Sports'})` : '👤 General User'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              {userProfile.email || 'niharika@nutriwise.app'}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
        >
          <Edit3 className="w-4 h-4 text-emerald-600" />
          <span>Edit</span>
        </button>
      </div>

      {/* Body & Metabolic Overview */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Body Information
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

      {/* Goals & Preferences */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
          Goals & Nutrition Blueprint
        </span>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Goal</span>
              <span className="text-xs font-extrabold text-slate-800 capitalize">
                {userProfile.goal?.replace('_', ' ') || 'Overall Fitness'}
              </span>
            </div>
          </div>
          <button onClick={handleOpenEdit} className="text-xs font-bold text-emerald-600">Change</button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🥗</span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dietary Preference</span>
              <span className="text-xs font-extrabold text-slate-800 capitalize">
                {userProfile.dietary_preference?.replace('_', ' ') || 'Vegetarian'}
              </span>
            </div>
          </div>
          <button onClick={handleOpenEdit} className="text-xs font-bold text-emerald-600">Change</button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍽️</span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Meal Frequency</span>
              <span className="text-xs font-extrabold text-slate-800 capitalize">
                {userProfile.meal_frequency?.replace('_', ' ') || '3 Meals / Day'}
              </span>
            </div>
          </div>
          <button onClick={handleOpenEdit} className="text-xs font-bold text-emerald-600">Change</button>
        </div>

        {userProfile.allergies && userProfile.allergies.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs font-medium text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Restrictions: {userProfile.allergies.join(', ').toUpperCase()}</span>
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
              <div className="text-xs font-extrabold text-slate-800">My Personalized Diet Plan</div>
              <div className="text-[11px] text-slate-500">View breakfast, lunch, snacks & dinner plan</div>
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
              <div className="text-xs font-extrabold text-slate-800">Track Record & Progress</div>
              <div className="text-[11px] text-slate-500">August calendar, weekly scores & habits</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

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

              {/* Allergy selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Allergies / Restrictions</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ALLERGY_OPTIONS.map(a => {
                    const isChecked = (formData.allergies || []).includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleFormAllergy(a.id)}
                        className={`p-2 rounded-lg border text-[11px] font-bold text-left transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {a.label}
                      </button>
                    );
                  })}
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
