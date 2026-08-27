import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
