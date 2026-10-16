import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  TrendingDown,
  Award,
  Sun,
  Coins,
  FileCheck,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateSustainabilityReport } from '../lib/export/pdfReport';
import { sound } from '../lib/sound/soundEffects';

export const CarbonEsgPage: React.FC = () => {
  const { equipment, ghostEvents, totalWastedKwh, totalCostInr, totalCo2Kg } = useAppStore();

  const [offsetTons, setOffsetTons] = useState(5);
  const [purchasedCert, setPurchasedCert] = useState<string | null>(null);

  const handleBuyCredits = () => {
    sound.playGhostBusted();
    setPurchasedCert(`VOLTGHOST-VERRA-OFFSET-${Date.now()}`);
  };

  const handleExportEsg = () => {
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
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span>Carbon Accounting & ESG Compliance Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            BRSR Core aligned Scope 2 tracker, net-zero decarbonization glidepath, and certified offsets.
          </p>
        </div>

        <button
          onClick={handleExportEsg}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-2"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Generate ESG Compliance Audit</span>
        </button>
      </div>

      {/* Scope 2 KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Total Scope 2 Emissions</div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {(totalCo2Kg / 1000).toFixed(2)} <span className="text-sm font-normal text-slate-400">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Grid factor 0.71 kg/kWh</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Renewable Energy Share</div>
          <div className="text-3xl font-black text-[#00FFC6] font-mono mt-1">
            28.4%
          </div>
          <div className="text-xs text-emerald-400 mt-1">Solar PV + Battery ESS</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400">Target Net-Zero Year</div>
          <div className="text-3xl font-black text-purple-300 font-mono mt-1">
            2030
          </div>
          <div className="text-xs text-slate-400 mt-1">Science-Based Targets (SBTi)</div>
        </div>
      </div>

      {/* Net-Zero Decarbonization Glidepath */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white">Facility Net-Zero Decarbonization Trajectory</h3>
          <p className="text-xs text-slate-400">
            Projected emissions reduction through Ghost Twin optimization and solar expansion.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3 text-center">
          {[
            { year: '2024 (Baseline)', emissions: 4800, progress: '100%' },
            { year: '2025 (Twin)', emissions: 3900, progress: '81%' },
            { year: '2026 (Solar)', emissions: 2800, progress: '58%' },
            { year: '2028 (VFD)', emissions: 1400, progress: '29%' },
            { year: '2030 (Net Zero)', emissions: 0, progress: '0%' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-white">{item.year}</div>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {item.emissions} <span className="text-[10px] text-slate-400 font-normal">tCO₂e</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{item.progress} of baseline</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Credit Marketplace Simulator */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>Carbon Credit Marketplace Simulator (Verra Verified)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Instantly offset residual manufacturing emissions via tokenized agroforestry credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tons of CO₂ to Neutralize
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={offsetTons}
                  onChange={(e) => setOffsetTons(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <span className="font-mono text-base font-bold text-white whitespace-nowrap">
                  {offsetTons} tCO₂e
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Credit Price:</span>
                <span className="font-mono font-bold">₹1,450 / ton</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Investment:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{(offsetTons * 1450).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuyCredits}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Neutralize {offsetTons} Tons & Issue Verified Certificate</span>
            </button>
          </div>

          {/* Certificate Display */}
          {purchasedCert ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
              <Award className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Carbon Neutrality Certificate Issued</h4>
              <div className="text-xs text-slate-300">
                Certified offset of <strong>{offsetTons} tCO₂e</strong> for Plant Alpha.
              </div>
              <div className="text-[10px] text-emerald-400 font-mono break-all pt-1">
                Serial: {purchasedCert}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-white/5">
              Select tons above to preview and issue cryptographic offset certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
