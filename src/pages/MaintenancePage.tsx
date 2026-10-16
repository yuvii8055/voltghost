import React, { useState } from 'react';
import {
  Activity,
  Wrench,
  Thermometer,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MaintenanceTicket } from '../types';
import { sound } from '../lib/sound/soundEffects';

export const MaintenancePage: React.FC = () => {
  const { equipment, maintenanceTickets, addMaintenanceTicket, updateTicketStatus, currentUser, activeRole } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newEqId, setNewEqId] = useState(equipment[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  const filteredTickets = maintenanceTickets.filter((t) =>
    filter === 'all' ? true : t.status === filter
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const targetEq = equipment.find((e) => e.id === newEqId);
    const newTicket: MaintenanceTicket = {
      id: 'tkt_' + Date.now(),
      equipmentId: newEqId,
      equipmentName: targetEq?.name || 'General Equipment',
      priority: newPriority,
      title: newTitle,
      description: newDesc,
      createdBy: currentUser?.name || 'Lead Operator',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'open',
    };
    addMaintenanceTicket(newTicket);
    setModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Activity className="w-6 h-6 text-[#00FFC6]" />
            <span>Predictive Maintenance & Health Scores</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry-driven remaining useful life (RUL), vibration FFT drift, and automated work orders.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#00FFC6] hover:bg-[#33ffdc] text-black text-xs font-bold transition flex items-center gap-2 shadow-md shadow-[#00FFC6]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Work Order</span>
        </button>
      </div>

      {/* Equipment Health & RUL Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {equipment.map((eq) => {
          const healthColor =
            eq.healthScore > 85 ? 'text-emerald-400' : eq.healthScore > 70 ? 'text-amber-400' : 'text-red-400';

          return (
            <div key={eq.id} className="glass-panel p-4 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase truncate block">
                    {eq.zone}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5 truncate">{eq.name}</h4>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black font-mono ${healthColor}`}>
                    {eq.healthScore}%
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">Health</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent,#00FFC6)]"
                  style={{ width: `${eq.healthScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-[10px] text-slate-400">Drift</div>
                  <div className="font-bold text-purple-300">+{eq.efficiencyDriftPct}%</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <div className="text-[10px] text-slate-400">RUL</div>
                  <div className="font-bold text-emerald-300">{eq.remainingUsefulLifeDays}d</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance Work Orders / Tickets */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Maintenance Calendar & Work Orders</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active tickets dispatched from efficiency drift and sensor anomalies.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl text-xs">
            {(['all', 'open', 'in_progress', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                  filter === s ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {filteredTickets.map((t) => (
            <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                      t.priority === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : t.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-sm font-bold text-white">{t.title}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                  <span>Machine: <strong className="text-slate-300">{t.equipmentName}</strong></span>
                  <span>•</span>
                  <span>Created by: {t.createdBy}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {t.status !== 'completed' ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      updateTicketStatus(t.id, t.status === 'open' ? 'in_progress' : 'completed');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.status === 'open' ? 'Start Work' : 'Mark Complete'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleCreateTicket}
            className="bg-[#0F172A] p-6 rounded-3xl border border-white/20 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Create Maintenance Work Order</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Machine</label>
              <select
                value={newEqId}
                onChange={(e) => setNewEqId(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              >
                {equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Inspect shaft bearing vibration"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Details of telemetry drift or mechanical symptoms..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#00FFC6] text-black font-extrabold rounded-xl text-xs"
              >
                Dispatch Order
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
