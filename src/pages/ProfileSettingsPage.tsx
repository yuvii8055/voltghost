import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Download,
  Trash2,
  Lock,
  Volume2,
  MousePointer,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../lib/auth/authService';
import { sound } from '../lib/sound/soundEffects';

export const ProfileSettingsPage: React.FC = () => {
  const {
    currentUser,
    activeRole,
    soundEnabled,
    toggleSound,
    customCursorEnabled,
    toggleCustomCursor,
    logout,
  } = useAppStore();

  const [twoFA, setTwoFA] = useState(currentUser?.twoFAEnabled ?? true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    sound.playClick();
    await authService.resetUserPassword(currentUser.id, newPassword);
    setPasswordNotice('Password updated successfully with PBKDF2 salt derivation.');
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordNotice(''), 4000);
  };

  const handleExportStateJson = () => {
    sound.playClick();
    const state = useAppStore.getState();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `voltghost-full-backup-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
          <UserIcon className="w-6 h-6 text-[#00FFC6]" />
          <span>Profile & Workstation Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage identity security, 2FA credentials, units, sound, and local IndexedDB state.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white">Operator Profile</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00FFC6] to-[#8B5CF6] text-black font-black text-2xl flex items-center justify-center">
                {currentUser ? currentUser.name[0] : 'U'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{currentUser?.name}</h4>
                <div className="text-xs text-slate-400 font-mono">{currentUser?.email}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Role: {activeRole}
                  </span>
                  <span className="text-[11px] text-slate-400">Device: {currentUser?.device || 'Desktop Workstation'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Update Password (PBKDF2 WebCrypto)</span>
            </h3>

            {passwordNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passwordNotice}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Strong Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00FFC6] text-black font-extrabold rounded-xl text-xs transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Preferences (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Security & 2FA */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FFC6]" />
              <span>Security & Two-Factor Authentication</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">TOTP Two-Factor Authentication</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Requires 6-digit TOTP code during Master Admin sign in.
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFA}
                onChange={(e) => {
                  sound.playClick();
                  setTwoFA(e.target.checked);
                }}
                className="w-5 h-5 rounded text-[#00FFC6] focus:ring-0"
              />
            </div>
          </div>

          {/* Interface Toggles */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white">Interface & Audio Preferences</h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Synthesized UI Audio</div>
                    <div className="text-[11px] text-slate-400">Web Audio API sound cues for ghost busting and alerts</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={toggleSound}
                  className="w-5 h-5 rounded text-[#00FFC6] focus:ring-0"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MousePointer className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Cursor Spotlight & Morphing Ring</div>
                    <div className="text-[11px] text-slate-400">Reactive cursor trailing ring with radial ambient spotlight</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={customCursorEnabled}
                  onChange={toggleCustomCursor}
                  className="w-5 h-5 rounded text-[#00FFC6] focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Backup & Danger Zone */}
          <div className="glass-panel p-6 rounded-3xl space-y-3 border-red-500/20">
            <h3 className="text-base font-bold text-white">Data Management & Session</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportStateJson}
                className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#00FFC6]" />
                <span>Export Full State JSON</span>
              </button>

              <button
                onClick={logout}
                className="py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl text-xs transition border border-red-500/40"
              >
                Sign Out Workstation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
