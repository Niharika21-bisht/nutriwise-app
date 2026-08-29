import React, { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Sparkles, Award, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';

export default function ProgressScreen() {
  const { userProfile, todayLog, calendarHistory } = useApp();
  const currentDayNum = new Date().getDate(); // e.g. 29
  const [selectedDay, setSelectedDay] = useState(currentDayNum);

  // Weekly data dynamically reflecting today's logged score
  const weeklyData = [
    { day: 'Mon', score: 78, protein: 62 },
    { day: 'Tue', score: 82, protein: 74 },
    { day: 'Wed', score: 76, protein: 58 },
    { day: 'Thu', score: 85, protein: 88 },
    { day: 'Fri', score: 83, protein: 79 },
    { day: 'Sat', score: todayLog.score || 75, protein: todayLog.consumed_protein_g },
    { day: 'Sun', score: 80, protein: 70 },
  ];

  // August 2026 Calendar Days
  const calendarDays = [];
  for (let d = 1; d <= 31; d++) {
    const isToday = d === currentDayNum;
    const hist = calendarHistory[d];

    let score = null;
    let status = 'future';

    if (isToday) {
      score = todayLog.score;
      status = 'today';
    } else if (hist) {
      score = hist.score;
      status = hist.status;
    } else if (d < currentDayNum) {
      score = 75 + (d % 10);
      status = score >= 80 ? 'good' : 'moderate';
    }

    calendarDays.push({ day: d, score, status, isToday });
  }

  const selectedHist = calendarHistory[selectedDay] || (selectedDay === currentDayNum ? {
    score: todayLog.score,
    meals_logged: todayLog.meals.filter(m => m.status === 'completed' || m.completed).length,
    skipped: todayLog.meals.filter(m => m.status === 'skipped').length
  } : null);

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Real-Time Analytics
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Nutrition Calendar
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
          <Award className="w-3.5 h-3.5" />
          <span>Avg: {todayLog.score} pts</span>
        </div>
      </div>

      {/* 1. Monthly Nutrition Calendar (August 2026) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-800">August 2026</h3>
          </div>
          <div className="text-[11px] font-bold text-slate-400">Live Synchronized</div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-slate-400">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Calendar Grid (Aug 1 is Sat -> 5 placeholders) */}
        <div className="grid grid-cols-7 gap-1">
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />

          {calendarDays.map((item) => {
            const isSelected = selectedDay === item.day;
            const isToday = item.isToday;

            let bgColor = "bg-slate-50 text-slate-700 hover:bg-slate-100";
            if (item.score >= 82) bgColor = "bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold";
            else if (item.score >= 70) bgColor = "bg-emerald-50 text-emerald-800 font-bold";
            else if (item.score > 0) bgColor = "bg-amber-50 text-amber-800 font-bold";
            else if (item.status === 'future') bgColor = "bg-transparent text-slate-300 pointer-events-none";

            if (isToday) {
              bgColor = "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30";
            }

            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative ${bgColor} ${
                  isSelected && !isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                }`}
              >
                <span>{item.day}</span>
                {item.score && !isToday && (
                  <span className="text-[8px] opacity-75 leading-none">{item.score}</span>
                )}
                {isToday && (
                  <span className="text-[7px] uppercase tracking-wider font-extrabold leading-none">Today</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Dynamic Inspection Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800">
              August {selectedDay}, 2026 Details
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Score: {selectedDay === currentDayNum ? todayLog.score : selectedHist?.score || 78}/100
            </span>
          </div>

          {selectedDay === currentDayNum ? (
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="text-slate-600 flex justify-between">
                <span>Completed Meals:</span>
                <span className="font-bold text-emerald-600">
                  {todayLog.meals.filter(m => m.status === 'completed' || m.completed).length} / {todayLog.meals.length}
                </span>
              </div>
              <div className="text-slate-600 flex justify-between">
                <span>Skipped Meals (0 pts):</span>
                <span className="font-bold text-rose-600">
                  {todayLog.meals.filter(m => m.status === 'skipped').length}
                </span>
              </div>
              <div className="text-slate-600 flex justify-between">
                <span>Hydration Logged:</span>
                <span className="font-bold text-cyan-600">
                  {todayLog.water_ml} ml / {userProfile.weight_kg * 35} ml
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Historical day record: {selectedHist?.meals_logged || 3} meals logged, {selectedHist?.skipped || 0} skipped meals.
            </p>
          )}
        </div>
      </div>

      {/* 2. Weekly Score Summary Bar Chart */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Weekly Score Trend</h3>
            <div className="text-base font-black text-slate-800 mt-0.5">Average: 81 / 100</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            Live response synced
          </div>
        </div>

        <div className="h-44 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`${value} pts`, 'Score']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score >= 82 ? '#10b981' : entry.score >= 75 ? '#34d399' : '#fbbf24'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. AI Behavioral Insights Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-soft space-y-2.5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Real-Time Behavioral Insights
        </div>

        <h4 className="text-sm font-black text-white">
          Intake & Skip Pattern Analysis
        </h4>

        <p className="text-xs text-indigo-100/90 leading-relaxed">
          {todayLog.meals.some(m => m.status === 'skipped')
            ? "⚠️ A skipped meal was recorded today. Remember that skipping meals reduces metabolic rate and drops daily nutrition score. Try small fruit/sprout snacks if tight on time."
            : "✅ Excellent consistency! Your meal completion rate is supporting steady glycogen storage and stable insulin levels."}
        </p>
      </div>
    </div>
  );
}
