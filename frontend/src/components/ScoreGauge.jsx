import React from 'react';
import { ArrowUpRight, Award, Flame } from 'lucide-react';

export default function ScoreGauge({ score = 78, delta = 6, label = "Today's Nutrition Score" }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "text-emerald-600 stroke-emerald-500";
  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let grade = "Great";

  if (score >= 85) {
    grade = "Optimal";
    scoreColor = "text-emerald-600 stroke-emerald-500";
    badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (score >= 70) {
    grade = "Balanced";
    scoreColor = "text-teal-600 stroke-teal-500";
    badgeBg = "bg-teal-50 text-teal-700 border-teal-200";
  } else if (score >= 50) {
    grade = "Moderate";
    scoreColor = "text-amber-600 stroke-amber-500";
    badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    grade = "Needs Attention";
    scoreColor = "text-rose-600 stroke-rose-500";
    badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/30 p-5 rounded-3xl border border-emerald-100/80 dark:border-emerald-900/40 shadow-soft relative overflow-hidden transition-colors">
      {/* Decorative subtle background circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-emerald-500" />
            {label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{score}</span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ 100</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
              <ArrowUpRight className="w-3 h-3" />
              +{delta}% vs yesterday
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
              {grade}
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background track */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health</span>
          </div>
        </div>
      </div>
    </div>
  );
}
