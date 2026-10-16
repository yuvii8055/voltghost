import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Settings2,
  Sliders,
  Radio,
  Activity,
  Download,
  RotateCcw,
  AlertOctagon,
  Power,
  Flame,
  CheckCircle2,
  XCircle,
  QrCode,
  Key,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../lib/auth/authService';
import { exportToCsv } from '../lib/export/csvExport';
import { Role, Equipment } from '../types';
import { sound } from '../lib/sound/soundEffects';

export const AdminConsolePage: React.FC = () => {
  const {
    activeRole,
    currentUser,
    auditLog,
    scenarios,
    approveScenario,
    rejectScenario,
    ecoMode,
    setEcoMode,
    chaosMode,
    setChaosMode,
    maintenanceModeBanner,
    setMaintenanceBanner,
    tariffPerKwh,
    emissionFactor,
    carbonBudgetKg,
    equipment,
    updateSimulatorState,
    logAudit,
    triggerEmergencyAlert,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    'users' | 'audit' | 'policy' | 'registry' | 'vault' | 'health' | 'chaos'
  >('policy');

  const [users, setUsers] = useState(authService.getUsers());
  const [userSearch, setUserSearch] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('operator');

  // Policy Form state
  const [formTariff, setFormTariff] = useState(tariffPerKwh);
  const [formEmission, setFormEmission] = useState(emissionFactor);
  const [formBudget, setFormBudget] = useState(carbonBudgetKg);

  // Vault state
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/VOLTGHOST_ALERTS');

  // Selected Machine for QR Code
  const [qrMachine, setQrMachine] = useState<Equipment | null>(null);

  if (activeRole !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 glass-panel rounded-3xl border-amber-500/20">
        <ShieldCheck className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white">Privileged Access Required</h2>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          The Master Admin Console contains privileged controls for the facility policy engine, user directory, kill-switches, and audit trails.
        </p>
        <div className="mt-4 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          Switch to "Master Admin" role in the top-right profile menu to test.
        </div>
      </div>
    );
  }

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    updateSimulatorState({
      tariffPerKwh: formTariff,
      emissionFactor: formEmission,
      carbonBudgetKg: formBudget,
    });
    logAudit('POLICY_ENGINE_UPDATE', `Updated tariff to ₹${formTariff}/kWh, factor ${formEmission}`, 'warning');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    await authService.createUser(newUserName, newUserEmail, newUserRole, 'Demo@123');
    setUsers(authService.getUsers());
    setNewUserName('');
    setNewUserEmail('');
    logAudit('USER_CREATED', `Created new user ${newUserEmail} with role ${newUserRole}`, 'info');
  };

  const handleExportAuditCsv = () => {
    sound.playClick();
    exportToCsv(`voltghost-audit-log-${Date.now()}.csv`, auditLog);
  };

  return (
    <div className="space-y-6">
      {/* Privileged Gold Accent Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0B132B] to-[#070B14] border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin Exclusive Console</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mt-2 m-0">
            Industrial Supervisory & Governance
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Global emergency shed interlocks, approval workflows, policy engine, and immutable audit ledger.
          </p>
        </div>

        {/* Global Emergency Master Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              sound.playAlert('high');
              triggerEmergencyAlert('Simulated thermal overload trigger on induction furnace.');
            }}
            className="px-3.5 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-red-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Test Siren Interlock</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMaintenanceBanner(!maintenanceModeBanner);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              maintenanceModeBanner
                ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                : 'bg-white/5 text-amber-300 border-amber-500/40 hover:bg-amber-500/10'
            }`}
          >
            <span>{maintenanceModeBanner ? 'Disable Maintenance' : 'Toggle Maintenance Mode'}</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { id: 'policy', label: 'Policy Engine & Approvals', icon: Sliders },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'audit', label: 'Immutable Audit Log', icon: FileSpreadsheet },
          { id: 'registry', label: 'Equipment Registry', icon: QrCode },
          { id: 'vault', label: 'Integration Vault', icon: Key },
          { id: 'chaos', label: 'Chaos Mode', icon: Flame },
          { id: 'health', label: 'System Health', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: POLICY ENGINE & APPROVAL WORKFLOW */}
      {activeTab === 'policy' && (
        <div className="space-y-6">
          {/* Pending Scenario Approval Table */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Scenario Approval Inbox</span>
                  {scenarios.filter((s) => s.status === 'pending').length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Operator-proposed What-If scenarios awaiting Master Admin authorization before deployment.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {scenarios.filter((s) => s.status === 'pending').length} Pending
              </span>
            </div>

            {scenarios.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl">
                No scenarios proposed yet. Submit a scenario from the What-If Simulator to trigger this workflow.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {scenarios.map((scen) => (
                  <div key={scen.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{scen.name}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            scen.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : scen.status === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {scen.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Proposed by: <strong className="text-slate-200">{scen.proposedBy}</strong> ({scen.proposedRole}) • Savings: ₹
                        {(scen.resultAfter.annualSavingsInr).toLocaleString('en-IN')}/yr
                      </div>
                    </div>

                    {scen.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveScenario(scen.id, 'Approved via Admin Console')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Apply</span>
                        </button>
                        <button
                          onClick={() => rejectScenario(scen.id, 'Requires higher ROI threshold')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition flex items-center gap-1.5 border border-red-500/40"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy Parameters Form */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Tariff, Carbon & Emission Slabs</h3>
              <p className="text-xs text-slate-400">
                Configure baseline financial conversion coefficients and environmental targets.
              </p>
            </div>

            <form onSubmit={handleUpdatePolicy} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Electricity Tariff (₹ / kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formTariff}
                  onChange={(e) => setFormTariff(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Grid Emission Factor (kg CO₂ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formEmission}
                  onChange={(e) => setFormEmission(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Carbon Budget (kg CO₂)
                </label>
                <input
                  type="number"
                  step="100"
                  value={formBudget}
                  onChange={(e) => setFormBudget(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-amber-400/20"
                >
                  Save Policy Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Authorized Users & Roles (RBAC)</h3>
                <p className="text-xs text-slate-400">
                  Manage facility operators, auditors, and engineers with cryptographic PBKDF2 credentials.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">2FA</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users
                    .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.includes(userSearch))
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300'
                                : u.role === 'operator'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {u.twoFAEnabled ? (
                            <span className="text-emerald-400 font-bold">Enabled</span>
                          ) : (
                            <span className="text-slate-500">Disabled</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              authService.toggleUserStatus(u.id);
                              setUsers(authService.getUsers());
                            }}
                            className="text-xs text-amber-400 hover:underline mr-3"
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Create / Invite User Form */}
            <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-white/5 border border-white/5 mt-4">
              <h4 className="text-xs font-bold text-white mb-3">Invite New Facility User</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="px-3 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Master Admin</option>
                </select>
                <button
                  type="submit"
                  className="py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Security & Telemetry Audit Log</h3>
              <p className="text-xs text-slate-400">
                Cryptographically tracked actions (Logins, Policy Changes, BLE Pairings, Scenario Deployments).
              </p>
            </div>
            <button
              onClick={handleExportAuditCsv}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#00FFC6]" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Operator</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Target Details</th>
                  <th className="py-2 px-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-white font-sans font-semibold">{log.userName}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.target}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EQUIPMENT REGISTRY & QR CODES */}
      {activeTab === 'registry' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Equipment Registry & QR Code Provisioning</h3>
            <p className="text-xs text-slate-400">
              Inspect physical machinery and generate maintenance floor QR tags.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">{eq.zone}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{eq.name}</h4>
                  <div className="text-xs text-slate-300 font-mono mt-1">
                    Rated: {eq.ratedKw} kW • Ideal: {eq.idealKw} kW
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-[#00FFC6] font-mono">Health: {eq.healthScore}%</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setQrMachine(eq);
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>View QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* QR Code Modal Display */}
          {qrMachine && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-[#0F172A] p-6 rounded-3xl border border-amber-500/40 text-center max-w-sm w-full space-y-4">
                <h3 className="text-base font-bold text-white">{qrMachine.name}</h3>
                <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center">
                  {/* High Contrast Procedural QR Mockup */}
                  <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between text-black font-mono text-[9px] font-bold">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black" />
                      <div className="w-8 h-8 bg-black" />
                    </div>
                    <div className="text-center">VOLTGHOST://{qrMachine.id}</div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black" />
                      <div className="text-[8px]">SCAN FOR LIVE TWIN</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-mono">ID: {qrMachine.id}</div>
                <button
                  onClick={() => setQrMachine(null)}
                  className="w-full py-2 bg-amber-400 text-black font-extrabold rounded-xl text-xs"
                >
                  Close Tag
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INTEGRATION VAULT */}
      {activeTab === 'vault' && (
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Integration Vault & API Secrets</h3>
            <p className="text-xs text-slate-400">
              Manage telemetry webhooks, Gemini API keys, and BLE whitelist.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gemini AI API Key (Serverless Environment)
              </label>
              <div className="relative flex gap-2">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  readOnly
                  value="AIzaSyVoltGhostSecureClientKey_DemoMode"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs"
                />
                <button
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alert Dispatch Webhook (Slack / Discord / Teams)
              </label>
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHAOS MODE */}
      {activeTab === 'chaos' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border-red-500/30">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Chaos Fault Injection Mode</span>
            </h3>
            <p className="text-xs text-slate-400">
              Inject random thermal drift, voltage harmonics, and ghost spikes to stress-test the system live.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/20 border border-red-500/30">
            <div>
              <div className="text-sm font-bold text-white">Stochastic Fault Generator</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Causes 20% random spikes and efficiency drift in connected machines.
              </div>
            </div>
            <button
              onClick={() => {
                sound.playAlert(chaosMode ? 'low' : 'critical');
                setChaosMode(!chaosMode);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                chaosMode
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {chaosMode ? 'DEACTIVATE CHAOS' : 'ENGAGE CHAOS MODE'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM HEALTH */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400">Sensor Uptime</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">99.94%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">0 packets dropped</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400">CV Inference FPS</div>
            <div className="text-2xl font-black text-[#00FFC6] font-mono mt-1">32 FPS</div>
            <div className="text-[10px] text-slate-500 mt-0.5">WebGL Acceleration ON</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400">AI Latency</div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1">142 ms</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Edge Fallback Ready</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400">Data Freshness</div>
            <div className="text-2xl font-black text-white font-mono mt-1">0.8s</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sub-second telemetry</div>
          </div>
        </div>
      )}
    </div>
  );
};
