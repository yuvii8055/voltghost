import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Ghost,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Moon,
  Volume2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { sound } from '../lib/sound/soundEffects';

export const NotificationsPage: React.FC = () => {
  const { ghostEvents, bustGhost, activeRole } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'critical' | 'fusion' | 'resolved'>('all');
  const [quietHours, setQuietHours] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const filtered = ghostEvents.filter((g) => {
    if (filter === 'critical') return g.severity === 'critical';
    if (filter === 'fusion') return g.detectedBy === 'fusion';
    if (filter === 'resolved') return g.resolved;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Bell className="w-6 h-6 text-[#00FFC6]" />
            <span>Industrial Alert & Notification Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-routed telemetry alerts, cross-modal CV notifications, and automated escalation logs.
          </p>
        </div>

        {/* Quiet Hours & Push Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setQuietHours(!quietHours);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              quietHours
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Quiet Hours: {quietHours ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        {(['all', 'critical', 'fusion', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filter === f
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="glass-panel p-6 rounded-3xl divide-y divide-white/10">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No alerts matching current filter.
          </div>
        ) : (
          filtered.map((g) => (
            <div key={g.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                      g.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : g.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {g.severity} • {g.detectedBy.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-white">{g.equipmentName}</span>
                  {g.resolved && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">
                      RESOLVED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{g.reason}</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Started: {new Date(g.startedAt).toLocaleTimeString()} • Wasted: {g.wastedKwh.toFixed(1)} kWh (₹{g.costInr.toFixed(0)})
                </div>
              </div>

              {!g.resolved && (
                <button
                  onClick={() => bustGhost(g.id)}
                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-black text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <Ghost className="w-3.5 h-3.5" />
                  <span>Bust Ghost</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
