import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Ghost,
  TrendingDown,
  Activity,
  Thermometer,
  Wrench,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { Equipment } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

interface MachineDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onNavigateToCoach: () => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  equipment,
  onClose,
  onNavigateToCoach,
}) => {
  const { bustGhost, ghostEvents, addMaintenanceTicket, currentUser } = useAppStore();

  if (!equipment) return null;

  const gapKw = Math.max(0, equipment.currentKw - equipment.idealKw);
  const isWasteful = gapKw > 3;
  const activeGhost = ghostEvents.find(
    (g) => g.equipmentId === equipment.id && !g.resolved
  );

  const handleOptimize = () => {
    if (activeGhost) {
      bustGhost(activeGhost.id);
    } else {
      sound.playGhostBusted();
    }
  };

  const handleCreateTicket = () => {
    sound.playClick();
    addMaintenanceTicket({
      id: 'tkt_' + Date.now(),
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      priority: isWasteful ? 'high' : 'medium',
      title: `Efficiency Drift Inspection for ${equipment.name}`,
      description: `Targeted calibration needed. Current draw: ${equipment.currentKw} kW vs ideal ${equipment.idealKw} kW (+${equipment.efficiencyDriftPct}% drift).`,
      createdBy: currentUser?.name || 'Operator',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'open',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#070B14]/95 border-l border-white/10 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-accent,#00FFC6)]/20 text-[var(--color-accent,#00FFC6)] border border-[var(--color-accent,#00FFC6)]/30">
                {equipment.zone}
              </span>
              <h3 className="text-xl font-bold text-white mt-2 leading-tight">
                {equipment.name}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Rated: {equipment.ratedKw} kW</span>
                <span>•</span>
                <span className="capitalize text-slate-300">Source: {equipment.source}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real vs Ghost Gap KPI Card */}
          <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/10">
              <div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real Load</span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono mt-1">
                  {equipment.currentKw} <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Ghost className="w-3.5 h-3.5 text-[#00FFC6]" />
                  <span>Ghost Twin (Ideal)</span>
                </div>
                <div className="text-2xl font-extrabold text-[#00FFC6] font-mono mt-1">
                  {equipment.idealKw} <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Ghost Gap (Avoidable Waste):</span>
              <span className={`text-base font-extrabold font-mono ${isWasteful ? 'text-[#FF3366]' : 'text-emerald-400'}`}>
                +{gapKw.toFixed(1)} kW (~₹{(gapKw * 8.5).toFixed(1)}/hr)
              </span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Temperature</span>
              </div>
              <div className="text-base font-bold text-white mt-1 font-mono">
                {equipment.tempC}°C
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vibration</span>
              </div>
              <div className="text-base font-bold text-white mt-1 font-mono">
                {equipment.vibrationMmS} mm/s
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-purple-400" />
                <span>Efficiency Drift</span>
              </div>
              <div className="text-base font-bold text-purple-300 mt-1 font-mono">
                +{equipment.efficiencyDriftPct}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Remaining Useful Life</span>
              </div>
              <div className="text-base font-bold text-emerald-300 mt-1 font-mono">
                {equipment.remainingUsefulLifeDays} days
              </div>
            </div>
          </div>

          {/* Active Ghost Warning if any */}
          {activeGhost && (
            <div className="mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>ACTIVE ANOMALY DETECTED ({activeGhost.detectedBy.toUpperCase()} FUSION)</span>
              </div>
              <p className="text-red-200 mt-1.5 leading-relaxed">{activeGhost.reason}</p>
              <div className="mt-2 text-red-300 font-mono">
                Wasting: {activeGhost.wastedKwh.toFixed(1)} kWh • ₹{activeGhost.costInr.toFixed(0)}
              </div>
            </div>
          )}

          {/* Computer Vision Zone Sync Info */}
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#00FFC6] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white">Vision Lab Linked</span>
              <div className="text-slate-400 text-[11px]">
                Zone bounding box active • Vision confirms sensor telemetry live
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-white/10 space-y-2 mt-6">
          <button
            onClick={handleOptimize}
            className="w-full py-3 px-4 bg-[var(--color-accent,#00FFC6)] hover:brightness-110 text-black font-extrabold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent,#00FFC6)]/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{activeGhost ? 'Bust This Ghost Anomaly' : 'Optimize Machine Profile'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCreateTicket}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-xl text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Create Ticket</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToCoach();
              }}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-xl text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask Coach</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
