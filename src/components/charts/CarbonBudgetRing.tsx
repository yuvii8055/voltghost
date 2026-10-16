import React from 'react';
import { Leaf, AlertCircle, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CarbonBudgetRing: React.FC = () => {
  const { totalCo2Kg, carbonBudgetKg } = useAppStore();

  const used = Math.min(carbonBudgetKg, totalCo2Kg * 22); // Month simulation scale
  const percentage = Math.min(100, Math.round((used / carbonBudgetKg) * 100));
  const remaining = Math.max(0, carbonBudgetKg - used);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color =
    percentage > 85 ? '#EF4444' : percentage > 65 ? '#F59E0B' : '#10B981';

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#10B981]" />
          <h4 className="text-sm font-bold text-white">Monthly Carbon Budget</h4>
        </div>
        <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-slate-300">
          Scope 2
        </span>
      </div>

      <div className="flex items-center gap-6 my-4">
        {/* Circular SVG Ring Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono text-white">{percentage}%</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Used</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2 text-xs">
          <div>
            <div className="text-slate-400">Emissions Consumed:</div>
            <div className="text-base font-bold text-white font-mono">
              {Math.round(used).toLocaleString()} <span className="text-xs text-slate-400">/ {carbonBudgetKg.toLocaleString()} kg CO₂</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400">Remaining Budget:</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono">
              {Math.round(remaining).toLocaleString()} kg CO₂
            </div>
          </div>
        </div>
      </div>

      {/* Projected Overshoot Alert */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs text-amber-300">
        <Calendar className="w-4 h-4 shrink-0 text-amber-400" />
        <div>
          <span className="font-semibold">Projected Overshoot:</span>{' '}
          <span className="underline">October 24</span> if idle ghosts remain unaddressed.
        </div>
      </div>
    </div>
  );
};
