import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  Coins,
  Leaf,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EnergySankey } from '../components/charts/EnergySankey';
import { exportToCsv } from '../lib/export/csvExport';
import { generateSustainabilityReport } from '../lib/export/pdfReport';
import { sound } from '../lib/sound/soundEffects';

export const AnalyticsPage: React.FC = () => {
  const { equipment, ghostEvents, totalWastedKwh, totalCostInr, totalCo2Kg } = useAppStore();

  const [activeRange, setActiveRange] = useState<'today' | '7d' | '30d'>('7d');

  // Forecast data (next 7 days)
  const forecastDays = [
    { day: 'Mon', baselineKwh: 12400, ghostGapKwh: 340, costInr: 105400 },
    { day: 'Tue', baselineKwh: 12800, ghostGapKwh: 380, costInr: 108800 },
    { day: 'Wed', baselineKwh: 13100, ghostGapKwh: 410, costInr: 111350 },
    { day: 'Thu', baselineKwh: 12600, ghostGapKwh: 290, costInr: 107100 },
    { day: 'Fri', baselineKwh: 13400, ghostGapKwh: 450, costInr: 113900 },
    { day: 'Sat', baselineKwh: 8900, ghostGapKwh: 180, costInr: 75650 },
    { day: 'Sun', baselineKwh: 6400, ghostGapKwh: 140, costInr: 54400 },
  ];

  const handleExportCsv = () => {
    sound.playClick();
    const rows = equipment.map((e) => ({
      Equipment: e.name,
      Zone: e.zone,
      RatedPowerKw: e.ratedKw,
      CurrentLoadKw: e.currentKw,
      IdealTwinKw: e.idealKw,
      GhostGapKw: Math.max(0, e.currentKw - e.idealKw).toFixed(1),
      HealthScorePct: e.healthScore,
      EfficiencyDriftPct: e.efficiencyDriftPct,
    }));
    exportToCsv(`voltghost-energy-analytics-${Date.now()}.csv`, rows);
  };

  const handleExportPDF = () => {
    sound.playClick();
    generateSustainabilityReport(
      equipment,
      ghostEvents,
      totalWastedKwh,
      totalCostInr,
      totalCo2Kg
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <BarChart3 className="w-6 h-6 text-[#00FFC6]" />
            <span>Industrial Energy Analytics & Benchmarking</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Time-of-Use (TOU) tariff optimization, Sankey flows, and 7-day predictive load models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#00FFC6]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs text-purple-300 font-bold transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Energy Flow Sankey Diagram */}
      <EnergySankey />

      {/* 7-Day Predictive Forecast */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">7-Day Predictive Load & Ghost Gap Forecast</h3>
            <p className="text-xs text-slate-400">
              Machine learning projected daily consumption against ideal baseline.
            </p>
          </div>
          <span className="text-xs font-mono text-[#00FFC6] font-bold">EWMA ± 2.8%</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {forecastDays.map((f, i) => (
            <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
              <div className="text-xs font-bold text-slate-300 uppercase">{f.day}</div>
              <div className="text-base font-black text-white font-mono mt-1">
                {(f.baselineKwh / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-slate-400">kWh baseline</div>
              <div className="text-[11px] font-mono text-[#FF3366] font-bold">
                +{f.ghostGapKwh} kWh
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                ₹{(f.costInr / 1000).toFixed(0)}k
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark vs Industry Best-in-Class */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Plant Specific Energy (SEC)</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            42.8 <span className="text-xs text-slate-400">kWh / unit</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8% better than regional avg</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Industry Best-in-Class Benchmark</div>
          <div className="text-2xl font-black text-[#00FFC6] font-mono mt-1">
            36.2 <span className="text-xs text-slate-400">kWh / unit</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Top 5% Automotive Facilities</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Addressable Savings Gap</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            6.6 <span className="text-xs text-slate-400">kWh / unit (~15%)</span>
          </div>
          <div className="text-xs text-amber-300 mt-1">Achievable with Ghost busting</div>
        </div>
      </div>
    </div>
  );
};
