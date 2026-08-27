import React, { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Sparkles, Award, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';

export default function ProgressScreen() {
  const { userProfile, todayLog } = useApp();
  const [selectedDay, setSelectedDay] = useState(27); // August 27, 2026

  const weeklyData = [
    { day: 'Mon', score: 78, protein: 62, target: 80 },
    { day: 'Tue', score: 82, protein: 74, target: 80 },
    { day: 'Wed', score: 76, protein: 58, target: 80 },
    { day: 'Thu', score: 85, protein: 88, target: 80 },
    { day: 'Fri', score: 83, protein: 79, target: 80 },
    { day: 'Sat', score: 80, protein: 65, target: 80 },
    { day: 'Sun', score: 84, protein: 82, target: 80 },
  ];

  // August 2026 Calendar days matrix (August 1, 2026 is Saturday)
  const calendarDays = [
    { day: 1, score: 75, status: 'good' },
    { day: 2, score: 80, status: 'good' },
    { day: 3, score: 72, status: 'moderate' },
    { day: 4, score: 85, status: 'good' },
    { day: 5, score: 88, status: 'good' },
    { day: 6, score: 79, status: 'good' },
    { day: 7, score: 82, status: 'good' },
    { day: 8, score: 68, status: 'moderate' },
    { day: 9, score: 74, status: 'moderate' },
    { day: 10, score: 86, status: 'good' },
    { day: 11, score: 90, status: 'optimal' },
    { day: 12, score: 83, status: 'good' },
    { day: 13, score: 85, status: 'good' },
    { day: 14, score: 79, status: 'good' },
    { day: 15, score: 81, status: 'good' },
    { day: 16, score: 77, status: 'moderate' },
    { day: 17, score: 84, status: 'good' },
    { day: 18, score: 89, status: 'optimal' },
    { day: 19, score: 82, status: 'good' },
    { day: 20, score: 78, status: 'good' },
    { day: 21, score: 85, status: 'good' },
    { day: 22, score: 76, status: 'moderate' },
    { day: 23, score: 82, status: 'good' },
    { day: 24, score: 78, status: 'good' },
    { day: 25, score: 82, status: 'good' },
    { day: 26, score: 76, status: 'moderate' },
    { day: 27, score: todayLog.score || 78, status: 'today' },
    { day: 28, score: null, status: 'future' },
    { day: 29, score: null, status: 'future' },
    { day: 30, score: null, status: 'future' },
    { day: 31, score: null, status: 'future' },
  ];

  return (
    <div className="pb-28 px-4 pt-2 max-w-md mx-auto space-y-5 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Analytics & Habits
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Nutrition Progress
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
          <Award className="w-3.5 h-3.5" />
          <span>Avg: 81/100</span>
        </div>
      </div>

      {/* 1. Monthly Nutrition Calendar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-800">August 2026</h3>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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

        {/* Calendar Grid (Aug 1 is Sat -> 5 leading empty cells) */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty placeholders for Mon-Fri before Aug 1 */}
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />
          <div className="h-8" />

          {calendarDays.map((item) => {
            const isSelected = selectedDay === item.day;
            const isToday = item.day === 27;

            let bgColor = "bg-slate-50 text-slate-700 hover:bg-slate-100";
            if (item.score >= 85) bgColor = "bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold";
            else if (item.score >= 75) bgColor = "bg-emerald-50 text-emerald-800 font-bold";
            else if (item.score >= 60) bgColor = "bg-amber-50 text-amber-800 font-bold";
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

        {/* Calendar Legend */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Optimal (85+)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            <span>Balanced (75-84)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Moderate (&lt;75)</span>
          </div>
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
            +4.2% this week
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
                    fill={entry.score >= 82 ? '#10b981' : entry.score >= 78 ? '#34d399' : '#fbbf24'}
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
          AI Nutrition Intelligence
        </div>

        <h4 className="text-sm font-black text-white">
          Weekend Intake Pattern Detected
        </h4>

        <p className="text-xs text-indigo-100/90 leading-relaxed">
          Your protein intake averages <strong>82g on weekdays</strong> but drops to <strong>65g on Saturdays</strong>.
          We recommend adding paneer bhurji, tofu, or sprouted moong during Sunday lunches to maintain steady muscular glycogen replenishment.
        </p>

        <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Hydration consistency is in the top 10% of users this month! 💧</span>
        </div>
      </div>
    </div>
  );
}
