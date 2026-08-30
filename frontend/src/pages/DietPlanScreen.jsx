import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Sparkles, RefreshCw, Flame, Dumbbell, Clock, Info, CheckCircle2, ShoppingBag, Calendar, ArrowRight, Plus, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/FoodCard';

export default function DietPlanScreen() {
  const { userProfile, macroTargets, dietPlan, loadingDietPlan, updateProfile, showToast } = useApp();
  const [selectedDayTab, setSelectedDayTab] = useState(1); // 1 to 7 (Mon to Sun)
  const [activeTabSection, setActiveTabSection] = useState('plan'); // 'plan' or 'groceries'
  
  // Interactive Checked Grocery Items State (persisted in LocalStorage)
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('nutriwise_groceries_checked');
    return saved ? JSON.parse(saved) : {};
  });

  // Custom User-Added Grocery Items
  const [customGroceryList, setCustomGroceryList] = useState(() => {
    const saved = localStorage.getItem('nutriwise_custom_groceries');
    return saved ? JSON.parse(saved) : [];
  });

  const [newGroceryInput, setNewGroceryInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('nutriwise_groceries_checked', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('nutriwise_custom_groceries', JSON.stringify(customGroceryList));
  }, [customGroceryList]);

  const handleRegenerate = () => {
    showToast("Re-optimizing 7-day weekly diet blueprint... 🔄");
    updateProfile({ ...userProfile });
  };

  const toggleCheckItem = (itemText) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const handleAddCustomGrocery = (e) => {
    e.preventDefault();
    if (!newGroceryInput.trim()) return;
    setCustomGroceryList(prev => [...prev, newGroceryInput.trim()]);
    setNewGroceryInput("");
    showToast("Added item to grocery checklist! 🛒");
  };

  const daysList = dietPlan?.days || [];
  const activeDay = daysList.find(d => d.day_number === selectedDayTab) || daysList[0] || {
    day_number: 1,
    day_name: "Monday",
    day_label: "Mon • Day 1",
    tagline: "Metabolic Kickstart & Balanced Glycemic Energy",
    meals: [],
    total_calories: 1445,
    total_protein_g: 68.5,
    why_this_plan: "Balanced whole foods plan."
  };

  const meals = activeDay.meals || [];
  const groceryCategories = dietPlan?.next_week_groceries || [];

  // Calculate total grocery items and checked count
  const allGroceryItems = [
    ...groceryCategories.flatMap(c => c.items),
    ...customGroceryList
  ];
  const checkedCount = allGroceryItems.filter(item => checkedItems[item]).length;
  const progressPercent = allGroceryItems.length > 0 ? Math.round((checkedCount / allGroceryItems.length) * 100) : 0;

  const handleCopyGroceryList = () => {
    let text = `🛒 NutriWise Next Week Grocery List (${userProfile.name || 'My Plan'})\n\n`;
    groceryCategories.forEach(cat => {
      text += `\n${cat.category}:\n`;
      cat.items.forEach(item => {
        text += `${checkedItems[item] ? '✅' : '⬜'} ${item}\n`;
      });
    });

    if (customGroceryList.length > 0) {
      text += `\n📝 My Custom Added Items:\n`;
      customGroceryList.forEach(item => {
        text += `${checkedItems[item] ? '✅' : '⬜'} ${item}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Grocery checklist copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            7-Day Weekly Blueprint
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Next Week Diet Plan
          </h2>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={loadingDietPlan}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${loadingDietPlan ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Switcher: 7-Day Meal Plan vs Next Week Grocery Checklist */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex border border-slate-200/60 dark:border-slate-700">
        <button
          onClick={() => setActiveTabSection('plan')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTabSection === 'plan'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>7-Day Meal Schedule</span>
        </button>
        <button
          onClick={() => setActiveTabSection('groceries')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTabSection === 'groceries'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Next Week Groceries</span>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full">
            {checkedCount}/{allGroceryItems.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: 7-DAY MEAL SCHEDULE VIEW */}
      {activeTabSection === 'plan' && (
        <div className="space-y-4">
          {/* 7-Day Horizontal Day Picker */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {daysList.map((day) => (
              <button
                key={day.day_number}
                onClick={() => setSelectedDayTab(day.day_number)}
                className={`min-w-[50px] flex-1 py-2 px-1 rounded-2xl text-xs font-extrabold transition-all flex flex-col items-center justify-center border ${
                  selectedDayTab === day.day_number
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80">{day.day_name.slice(0, 3)}</span>
                <span className="text-sm font-black mt-0.5">D{day.day_number}</span>
              </button>
            ))}
          </div>

          {/* Plan Macro Summary Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-card flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
                <Flame className="w-3.5 h-3.5" />
                <span>Target Energy</span>
              </div>
              <div className="text-xl font-black mt-0.5">{activeDay.total_calories}</div>
              <div className="text-[10px] text-emerald-200 uppercase">kcal / day</div>
            </div>

            <div className="w-[1px] h-9 bg-emerald-400/40" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-100">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Protein Target</span>
              </div>
              <div className="text-xl font-black mt-0.5">{activeDay.total_protein_g}g</div>
              <div className="text-[10px] text-emerald-200 uppercase">Daily Protein</div>
            </div>

            <div className="w-[1px] h-9 bg-emerald-400/40" />

            <div className="text-center">
              <div className="text-[11px] font-semibold text-emerald-100">Day Focus</div>
              <div className="text-sm font-black mt-1 uppercase tracking-wider">{activeDay.day_name}</div>
            </div>
          </div>

          {/* Day Rationale Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-3xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{activeDay.tagline || 'Daily Objective'}</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              {activeDay.why_this_plan ||
                `Designed specifically for ${userProfile.name} to balance amino acid timing and steady glycogen for ${activeDay.day_name}.`}
            </p>
          </div>

          {/* Meal Items Schedule for Selected Day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {activeDay.day_name} Meals Schedule
              </span>
              <span className="text-[11px] font-bold text-slate-500">{meals.length} Scheduled Meals</span>
            </div>

            {meals.map((meal, index) => (
              <FoodCard
                key={index}
                mealType={meal.meal_type}
                title={meal.title}
                description={meal.description}
                calories={meal.calories}
                protein={meal.protein_g}
                carbs={meal.carbs_g}
                fat={meal.fat_g}
                prepTime={meal.prep_time}
                ingredients={meal.ingredients}
                alternatives={meal.alternatives}
                onSwapMeal={(type, alt) => {
                  showToast(`Selected "${alt.title}" for ${type}! 🥗`);
                }}
              />
            ))}
          </div>

          {/* Advance Prep Tips */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 p-4 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200">
              <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Advance Meal Prep Strategy</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
              {(dietPlan?.advance_prep_tips || [
                "Soak Rajma / Kidney beans on Monday night for Tuesday's high-protein lunch.",
                "Start sprouting green moong on Tuesday for Wednesday's live enzyme sprout bowl."
              ]).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 2: NEXT WEEK GROCERY CHECKLIST & SHOPPING ASSISTANT */}
      {activeTabSection === 'groceries' && (
        <div className="space-y-4">
          {/* Progress Header Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-900 dark:to-emerald-950/30 p-4 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Shopping Progress
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Next Week Grocery Checklist
                </h3>
              </div>
              <button
                onClick={handleCopyGroceryList}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-extrabold shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-95 flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                <span>{copied ? "Copied!" : "Copy List"}</span>
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>{checkedCount} of {allGroceryItems.length} items purchased</span>
                <span className="text-emerald-700 dark:text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Add Custom Grocery Item */}
          <form onSubmit={handleAddCustomGrocery} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex gap-2">
            <input
              type="text"
              value={newGroceryInput}
              onChange={(e) => setNewGroceryInput(e.target.value)}
              placeholder="Add item (e.g. Dark Chocolate, Peanut Butter, Green Tea)..."
              className="flex-1 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 hover:bg-emerald-500 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </form>

          {/* Custom Items (if any) */}
          {customGroceryList.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-2.5">
              <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>📝</span>
                <span>My Custom Added Items ({customGroceryList.length})</span>
              </span>
              <div className="space-y-1.5">
                {customGroceryList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCheckItem(item)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      checkedItems[item]
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                        checkedItems[item] ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {checkedItems[item] && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Grocery Checklist */}
          {groceryCategories.map((categoryGroup, catIndex) => (
            <div key={catIndex} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 dark:text-white">{categoryGroup.category}</h4>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {categoryGroup.items.filter(it => checkedItems[it]).length}/{categoryGroup.items.length} bought
                </span>
              </div>

              <div className="space-y-1.5">
                {categoryGroup.items.map((item, itemIndex) => {
                  const isChecked = Boolean(checkedItems[item]);
                  return (
                    <div
                      key={itemIndex}
                      onClick={() => toggleCheckItem(item)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                          : 'bg-slate-50/50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-300 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-600 text-white shadow-sm' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold">{item}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
