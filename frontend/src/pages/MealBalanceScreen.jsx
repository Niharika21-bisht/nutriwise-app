import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Plus, Check, ShieldCheck, Heart, Leaf, Apple, Utensils, Zap, Award, Info, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MealBalanceScreen() {
  const { todayLog, userGamification, addMealBalanceBoost, toggleVegetableTracked, setCurrentScreen } = useApp();

  const currentBalance = todayLog?.meal_balance !== undefined
    ? todayLog.meal_balance
    : ((todayLog?.score || 0) >= 80 ? 88 : (todayLog?.score || 0) > 0 ? 65 : 50);

  const vegetablesList = userGamification?.vegetables_tracked || [
    "Spinach (Palak)", "Tomato", "Cucumber", "Green Peas", "Bhindi (Okra)", "Carrots"
  ];

  const boosterOptions = [
    {
      id: 'fiber_salad',
      title: 'Fiber & Greens Salad',
      points: 15,
      icon: '🥗',
      benefit: 'Slows glucose spike & feeds gut microbiome',
      items: 'Cucumber, Tomato, Beetroot, Lemon'
    },
    {
      id: 'healthy_fats',
      title: 'Omega-3 Seed Crunch',
      points: 10,
      icon: '🥑',
      benefit: 'Hormonal balance & sustained mental energy',
      items: 'Chia seeds, Roasted Flax, 4 Almonds'
    },
    {
      id: 'probiotic_curd',
      title: 'Probiotic Live Curd / Dahi',
      points: 15,
      icon: '🥣',
      benefit: 'Live lactobacillus for optimal gut digestion',
      items: '100g Fresh Curd / Greek Yogurt'
    },
    {
      id: 'rainbow_antioxidants',
      title: 'Rainbow Polyphenol Boost',
      points: 10,
      icon: '🫐',
      benefit: 'Cellular protection & anti-inflammatory',
      items: 'Pomegranate, Seasonal Berries, Citrus'
    }
  ];

  const quickPlants = [
    { name: 'Palak (Spinach)', icon: '🥬' },
    { name: 'Tomato', icon: '🍅' },
    { name: 'Cucumber', icon: '🥒' },
    { name: 'Carrot', icon: '🥕' },
    { name: 'Green Peas', icon: '🫛' },
    { name: 'Almonds / Seeds', icon: '🥜' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 max-w-md mx-auto animate-fadeIn relative pb-28 transition-colors">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 -ml-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Meal Balance & Golden Ratio</h2>
          </div>

          <div className="w-8" />
        </div>

        {/* Big Score Hero */}
        <div className="text-center mt-3">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-all duration-300">
            {currentBalance}<span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 ml-1">%</span>
          </div>

          <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {currentBalance >= 85 ? "Optimal Golden Plate Ratio 🌟" : currentBalance >= 60 ? "High Nutrient Density ✨" : "Moderate Meal Balance"}
            </span>
          </div>
        </div>
      </div>

      {/* 🍽️ Centerpiece: Animated 3D Golden Plate Ratio Orb */}
      <div className="my-4 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative overflow-hidden bg-gradient-to-tr from-slate-900 via-emerald-950 to-teal-950 shadow-2xl border-[6px] border-white dark:border-slate-800 ring-8 ring-emerald-100/60 dark:ring-emerald-900/30 flex items-center justify-center p-6 text-center">
          
          {/* Animated Ambient Rotating Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-400/30 animate-spin" style={{ animationDuration: '28s' }} />
          <div className="absolute inset-5 rounded-full border border-teal-500/20" />

          {/* Golden Plate 3-Segment SVG Arc */}
          <svg className="absolute inset-0 w-full h-full p-4 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            {/* 50% Fiber / Greens Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray="125.6 251.2"
              strokeDashoffset="0"
              strokeLinecap="round"
              className="drop-shadow-md"
            />
            {/* 25% Clean Protein Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray="62.8 251.2"
              strokeDashoffset="-130"
              strokeLinecap="round"
              className="drop-shadow-md"
            />
            {/* 25% Complex Carbs & Healthy Fats Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeDasharray="62.8 251.2"
              strokeDashoffset="-195"
              strokeLinecap="round"
              className="drop-shadow-md"
            />
          </svg>

          {/* Center Info Content */}
          <div className="relative z-20 space-y-1.5 text-white">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-black tracking-wider uppercase text-emerald-300">
              <Leaf className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Golden Ratio</span>
            </div>

            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-teal-200 tracking-tight drop-shadow-md">
              {currentBalance}%
            </div>

            {/* Ratio Breakdown Tags */}
            <div className="flex justify-center items-center gap-1.5 text-[9px] font-bold text-slate-200 pt-1">
              <span className="text-emerald-400">50% Fiber</span> • 
              <span className="text-blue-400">25% Protein</span> • 
              <span className="text-amber-400">25% Carbs</span>
            </div>

            <div className="text-[10px] text-emerald-300/90 font-medium">
              Gut microbiome & metabolic balance
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ 1-Tap Nutrient Boosters */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1-Tap Meal Density Boosters
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+XP Rewards</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {boosterOptions.map((boost) => (
            <button
              key={boost.id}
              onClick={() => addMealBalanceBoost(boost.id, boost.points, boost.title)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-soft hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl">{boost.icon}</span>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  +{boost.points}%
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-900 dark:group-hover:text-emerald-300">
                  {boost.title}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{boost.items}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 🌿 Weekly Gut Microbiome Plant Diversity Meter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              🥦
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Weekly Plant Diversity</h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Aim for 30 distinct plants weekly for gut health</span>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
            {vegetablesList.length} / 30
          </span>
        </div>

        {/* Quick Diversity Badges */}
        <div className="grid grid-cols-3 gap-1.5">
          {quickPlants.map((plant, i) => {
            const isTracked = vegetablesList.some(v => v.toLowerCase().includes(plant.name.toLowerCase().split(' ')[0]));
            return (
              <button
                key={i}
                onClick={() => toggleVegetableTracked(plant.name)}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  isTracked
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs font-black'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
                }`}
              >
                <span>{plant.icon}</span>
                <span className="truncate">{plant.name}</span>
                {isTracked && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
