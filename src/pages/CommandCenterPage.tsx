import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Ghost,
  Coins,
  Leaf,
  Activity,
  AlertTriangle,
  Play,
  FastForward,
  Clock,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  X,
  Radio,
  Camera,
  Server,
  Flame,
  Snowflake,
  Wind,
  Cpu,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Equipment } from '../types';
import { RealVsGhostChart } from '../components/charts/RealVsGhostChart';
import { CarbonBudgetRing } from '../components/charts/CarbonBudgetRing';
import { MachineDetailModal } from '../components/twin/MachineDetailModal';
import { sound } from '../lib/sound/soundEffects';

interface CommandCenterPageProps {
  onNavigate: (page: string) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({ onNavigate }) => {
  const {
    equipment,
    totalWastedKwh,
    totalCostInr,
    totalCo2Kg,
    ghostEvents,
    bustGhost,
    simSpeed,
    setSimSpeed,
    ecoScore,
    ecoMode,
    setEcoMode,
    tariffPerKwh,
  } = useAppStore();

  const [selectedMachine, setSelectedMachine] = useState<Equipment | null>(null);

  // Aggregated KPIs
  const totalRealKw = equipment.reduce((sum, e) => sum + e.currentKw, 0);
  const totalIdealKw = equipment.reduce((sum, e) => sum + e.idealKw, 0);
  const totalGapKw = Math.max(0, totalRealKw - totalIdealKw);
  const gapPercentage = totalRealKw > 0 ? Math.round((totalGapKw / totalRealKw) * 100) : 0;

  const unresolvedGhosts = ghostEvents.filter((g) => !g.resolved);

  return (
    <div className="space-y-6">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <span>Facility Command Center</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fusion of 12 industrial machines, IoT BLE meters, and Computer Vision occupancy.
          </p>
        </div>

        {/* Speed Controls (1x, 10x, 60x) & Eco Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speed:</span>
            </span>
            {([1, 10, 60] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  sound.playClick();
                  setSimSpeed(s);
                }}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
                  simSpeed === s
                    ? 'bg-[var(--color-accent,#00FFC6)] text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setEcoMode(!ecoMode);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              ecoMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Eco Mode: {ecoMode ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Strip (7 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: Live kW */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Live Draw</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {totalRealKw.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ideal: {totalIdealKw.toFixed(1)} kW</div>
        </div>

        {/* KPI 2: Today kWh */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today kWh</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {(totalRealKw * 14.2).toFixed(0)}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">Normal daily curve</div>
        </div>

        {/* KPI 3: Cost Rs */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avoidable Waste</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            ₹{Math.round(totalCostInr).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹{tariffPerKwh}/kWh</div>
        </div>

        {/* KPI 4: CO2 kg */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avoidable CO₂</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {totalCo2Kg.toFixed(1)} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">0.71 kg/kWh</div>
        </div>

        {/* KPI 5: Ghost Gap % */}
        <div className="glass-panel p-3.5 rounded-2xl border-red-500/20 bg-red-950/15">
          <div className="flex items-center justify-between text-red-300 text-xs">
            <span>Ghost Gap</span>
            <Ghost className="w-3.5 h-3.5 text-[#FF3366] animate-ghost-pulse" />
          </div>
          <div className="text-xl font-black text-[#FF3366] font-mono mt-1">
            +{gapPercentage}%
          </div>
          <div className="text-[10px] text-red-400/80 mt-1">{totalGapKw.toFixed(1)} kW live waste</div>
        </div>

        {/* KPI 6: Eco Score */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Eco Score</span>
            <Sparkles className="w-3.5 h-3.5 text-[#00FFC6]" />
          </div>
          <div className="text-xl font-black text-[#00FFC6] font-mono mt-1">
            {ecoScore} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Facility Grade: B+</div>
        </div>

        {/* KPI 7: Ghosts to Bust */}
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Ghosts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            {unresolvedGhosts.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">6 deterministic seeded</div>
        </div>
      </div>

      {/* Main Charts & Side Gauges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real vs Ghost Chart (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Live Facility Load vs Ghost Twin</h3>
              <p className="text-xs text-slate-400">
                Red glowing area shows live Ghost Gap accumulation across the 24-hour shift cycle.
              </p>
            </div>
            <button
              onClick={() => onNavigate('twin')}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#00FFC6] font-semibold transition"
            >
              Open 3D Twin →
            </button>
          </div>

          <RealVsGhostChart />
        </div>

        {/* Carbon Budget Ring Gauge (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <CarbonBudgetRing />
        </div>
      </div>

      {/* Active Anomalies Feed (Ghost Busting Hub) */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Ghost className="w-5 h-5 text-[#FF3366] animate-ghost-pulse" />
            <div>
              <h3 className="text-base font-bold text-white">Live Ghost Anomaly Radar</h3>
              <p className="text-xs text-slate-400">
                Fused Computer Vision & sensor events causing avoidable energy and emission waste.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {unresolvedGhosts.length} unresolved
          </span>
        </div>

        {unresolvedGhosts.length === 0 ? (
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-white text-sm">All Energy Ghosts Busted!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Facility operating within 98.2% of ideal thermodynamic efficiency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unresolvedGhosts.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-white/5 border border-red-500/30 hover:border-red-500/60 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        g.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {g.severity.toUpperCase()} • {g.detectedBy.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {g.durationMin} min active
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-tight">
                    {g.equipmentName}
                  </h4>
                  <div className="text-xs font-semibold text-red-300 mt-1">{g.type}</div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{g.reason}</p>

                  <div className="mt-3 p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Waste:</span>
                    <span className="text-[#FF3366] font-bold">
                      {g.wastedKwh.toFixed(1)} kWh (₹{g.costInr.toFixed(0)})
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => {
                      bustGhost(g.id);
                    }}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-black text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-red-500/30"
                  >
                    <Ghost className="w-3.5 h-3.5" />
                    <span>Bust Ghost</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('coach');
                    }}
                    className="p-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl transition"
                    title="Ask Carbon Coach"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Telemetry Grid (12 Machines with 3D Tilt Glare) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Equipment Telemetry & Ghost Twins</h3>
            <p className="text-xs text-slate-400">
              Hover for 3D perspective glare; click any machine for full diagnostic side panel.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">12 of 12 online</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {equipment.map((eq) => {
            const gap = Math.max(0, eq.currentKw - eq.idealKw);
            const isWaste = gap > 3;

            return (
              <motion.div
                key={eq.id}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => {
                  sound.playClick(600);
                  setSelectedMachine(eq);
                }}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  isWaste
                    ? 'border-red-500/30 hover:border-red-500/60 shadow-[0_0_25px_rgba(255,51,102,0.1)]'
                    : 'hover:border-[var(--color-accent,#00FFC6)]/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="overflow-hidden pr-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block truncate">
                      {eq.zone}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5 truncate group-hover:text-[var(--color-accent,#00FFC6)] transition">
                      {eq.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {eq.source === 'ble' ? (
                      <span title="Bluetooth BLE Source"><Radio className="w-3.5 h-3.5 text-blue-400" /></span>
                    ) : eq.id === 'eq_cnc_1' ? (
                      <span title="Vision Lab Synced"><Camera className="w-3.5 h-3.5 text-[#00FFC6]" /></span>
                    ) : (
                      <span title="Simulator Stream"><Server className="w-3.5 h-3.5 text-slate-500" /></span>
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        eq.state === 'running'
                          ? isWaste
                            ? 'bg-[#FF3366] animate-pulse'
                            : 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Live kW and Ideal kW comparison */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-slate-400">Real Load</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">
                      {eq.currentKw} <span className="text-[10px] font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Ghost Ideal</div>
                    <div className="text-base font-extrabold text-[#00FFC6] font-mono mt-0.5">
                      {eq.idealKw} <span className="text-[10px] font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>

                {/* Ghost Gap Badge */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">Ghost Gap:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      isWaste ? 'text-[#FF3366]' : 'text-emerald-400'
                    }`}
                  >
                    +{gap.toFixed(1)} kW
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Machine Diagnostic Inspection Modal */}
      <MachineDetailModal
        equipment={selectedMachine}
        onClose={() => setSelectedMachine(null)}
        onNavigateToCoach={() => onNavigate('coach')}
      />
    </div>
  );
};
