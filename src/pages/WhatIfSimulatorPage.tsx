import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Sparkles,
  TrendingDown,
  Coins,
  Leaf,
  Sun,
  BatteryCharging,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  TreePine,
  Car,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ScenarioParams, Scenario } from '../types';
import { runWhatIfCalculation } from '../lib/simulator/monteCarlo';
import { canApplyScenarios } from '../lib/auth/rbac';
import { sound } from '../lib/sound/soundEffects';

interface WhatIfSimulatorPageProps {
  onNavigate: (page: string) => void;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({ onNavigate }) => {
  const {
    activeRole,
    currentUser,
    addScenario,
    scenarios,
    approveScenario,
  } = useAppStore();

  const [params, setParams] = useState<ScenarioParams>({
    shiftLoadsOffPeakPct: 25,
    acSetpointDeltaC: 1.5,
    autoShutdownIdleDelayMin: 10,
    vfdRetrofit: true,
    ledRetrofit: true,
    addSolarKwp: 60,
    addBatteryKwh: 80,
    occupancyLighting: true,
  });

  const [scenarioName, setScenarioName] = useState('Smart Plant Eco-Modernization Q4');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const result = runWhatIfCalculation(params);

  const handleProposeScenario = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    const newScenario: Scenario = {
      id: 'scen_' + Date.now(),
      name: scenarioName,
      proposedBy: currentUser?.name || 'Operator',
      proposedRole: activeRole,
      createdAt: new Date().toISOString(),
      params: { ...params },
      resultBefore: { ...result },
      resultAfter: { ...result },
      status: activeRole === 'admin' ? 'approved' : 'pending',
    };

    addScenario(newScenario);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 5000);

    if (activeRole === 'admin') {
      approveScenario(newScenario.id, 'Auto-approved by Master Admin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Sliders className="w-6 h-6 text-[#00FFC6]" />
            <span>What-If Digital Twin Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational shifts, setpoint trims, and solar/battery retrofits before hardware implementation.
          </p>
        </div>

        {submittedNotice && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {activeRole === 'admin'
                ? 'Scenario Approved & Deployed to Digital Twin!'
                : 'Scenario Submitted for Master Admin Approval!'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Parametric Controls (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Facility Operational Levers</h3>
            <p className="text-xs text-slate-400">
              Adjust sliders to observe immediate thermodynamic & financial delta.
            </p>
          </div>

          {/* Slider 1: Shift Loads Off-Peak */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Shift Loads to Off-Peak Slabs</span>
              <span className="font-mono text-[#00FFC6] font-bold">{params.shiftLoadsOffPeakPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={params.shiftLoadsOffPeakPct}
              onChange={(e) =>
                setParams({ ...params, shiftLoadsOffPeakPct: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00FFC6]"
            />
          </div>

          {/* Slider 2: AC Setpoint Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">HVAC Temperature Trim Delta</span>
              <span className="font-mono text-cyan-400 font-bold">
                {params.acSetpointDeltaC > 0 ? `+${params.acSetpointDeltaC}°C` : `${params.acSetpointDeltaC}°C`}
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="4"
              step="0.5"
              value={params.acSetpointDeltaC}
              onChange={(e) =>
                setParams({ ...params, acSetpointDeltaC: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Slider 3: Auto-Shutdown Idle Delay */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Auto-Standby Inactivity Timeout</span>
              <span className="font-mono text-amber-400 font-bold">{params.autoShutdownIdleDelayMin} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={params.autoShutdownIdleDelayMin}
              onChange={(e) =>
                setParams({ ...params, autoShutdownIdleDelayMin: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Slider 4: Add Solar kWp */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Rooftop Solar Expansion (kWp)</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{params.addSolarKwp} kWp</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={params.addSolarKwp}
              onChange={(e) => setParams({ ...params, addSolarKwp: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Slider 5: Add Battery ESS kWh */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
                <span>Battery ESS Storage (kWh)</span>
              </span>
              <span className="font-mono text-purple-400 font-bold">{params.addBatteryKwh} kWh</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="20"
              value={params.addBatteryKwh}
              onChange={(e) => setParams({ ...params, addBatteryKwh: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Retrofit Toggles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
            <label className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center gap-2 hover:border-[#00FFC6]/40 transition">
              <input
                type="checkbox"
                checked={params.vfdRetrofit}
                onChange={(e) => setParams({ ...params, vfdRetrofit: e.target.checked })}
                className="rounded border-white/20 text-[#00FFC6] focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">Motor VFDs</span>
            </label>

            <label className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center gap-2 hover:border-[#00FFC6]/40 transition">
              <input
                type="checkbox"
                checked={params.ledRetrofit}
                onChange={(e) => setParams({ ...params, ledRetrofit: e.target.checked })}
                className="rounded border-white/20 text-[#00FFC6] focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">High Bay LEDs</span>
            </label>

            <label className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center gap-2 hover:border-[#00FFC6]/40 transition">
              <input
                type="checkbox"
                checked={params.occupancyLighting}
                onChange={(e) => setParams({ ...params, occupancyLighting: e.target.checked })}
                className="rounded border-white/20 text-[#00FFC6] focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">CV Occupancy</span>
            </label>
          </div>

          {/* Proposal Form Submission */}
          <form onSubmit={handleProposeScenario} className="pt-4 border-t border-white/10 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Scenario Name for Approval Workflow
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#00FFC6]"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-[#00FFC6]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeRole === 'admin' ? 'Approve & Apply' : 'Submit for Approval'}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              * Operators can propose scenarios; Master Admin authorization is required to apply policy facility-wide.
            </div>
          </form>
        </div>

        {/* Right Column: Instant Before vs After Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Before vs After Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Projected Facility Delta</h3>
              <span className="text-xs font-mono text-[#00FFC6] font-bold bg-[#00FFC6]/15 px-2.5 py-0.5 rounded-full border border-[#00FFC6]/30">
                Live Simulation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Daily Electricity</div>
                <div className="text-2xl font-black text-slate-300 font-mono mt-1">
                  {result.dailyKwhBefore.toLocaleString()} <span className="text-xs font-normal">kWh</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-1">
                  → {result.dailyKwhAfter.toLocaleString()} kWh (-{Math.round(((result.dailyKwhBefore - result.dailyKwhAfter) / result.dailyKwhBefore) * 100)}%)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Daily Cost Exposure</div>
                <div className="text-2xl font-black text-slate-300 font-mono mt-1">
                  ₹{result.dailyCostInrBefore.toLocaleString()}
                </div>
                <div className="text-xs text-amber-400 font-bold mt-1">
                  → ₹{result.dailyCostInrAfter.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Peak Demand Load</div>
                <div className="text-2xl font-black text-slate-300 font-mono mt-1">
                  {result.peakKwBefore} <span className="text-xs font-normal">kW</span>
                </div>
                <div className="text-xs text-cyan-400 font-bold mt-1">
                  → {result.peakKwAfter} kW (Shaved)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Annual CO₂ Reduction</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {(result.annualCo2SavedKg / 1000).toFixed(1)} <span className="text-xs font-normal">Tonnes</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Scope 2 Decarbonization</div>
              </div>
            </div>

            {/* Annual Financial ROI & Payback */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#0F172A] border border-emerald-500/30 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Annual Savings</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  ₹{(result.annualSavingsInr / 100000).toFixed(2)}L
                </div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Payback Period</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {result.paybackYears} yrs
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Projected ROI</div>
                <div className="text-xl font-black text-[#00FFC6] font-mono mt-0.5">
                  {result.roiPct}%
                </div>
              </div>
            </div>

            {/* Equivalency Chips */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono">
                    {result.treesEquivalent.toLocaleString()} Trees
                  </div>
                  <div className="text-[10px] text-slate-400">Sequester equivalent / year</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono">
                    {result.carKmEquivalent.toLocaleString()} km
                  </div>
                  <div className="text-[10px] text-slate-400">Passenger car travel offset</div>
                </div>
              </div>
            </div>

            {/* Monte Carlo 10th to 90th percentile Confidence Range */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Monte Carlo Confidence (300 Trials)</span>
                <span className="text-[#00FFC6] font-mono font-bold text-[11px]">80% Confidence</span>
              </div>
              <div className="text-xs text-slate-400">
                Expected daily savings: <strong className="text-white font-mono">{result.monteCarloLowKwh}</strong> to{' '}
                <strong className="text-white font-mono">{result.monteCarloHighKwh} kWh/day</strong> taking into account stochastic weather and production shifts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
