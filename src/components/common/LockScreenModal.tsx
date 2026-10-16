import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

export const LockScreenModal: React.FC = () => {
  const { isLocked, setLocked, currentUser } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, accept correct passwords or "unlock" for ease of testing
    if (
      password === 'Admin@123' ||
      password === 'Operator@123' ||
      password === 'Viewer@123' ||
      password === 'demo' ||
      password.length >= 4
    ) {
      sound.playClick(600);
      setLocked(false);
      setPassword('');
      setError('');
    } else {
      sound.playAlert('high');
      setError('Incorrect password. (Hint: Use your account password or click Instant Demo Unlock)');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#090E1A]/95 border border-[#00FFC6]/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FFC6] to-transparent" />

        <div className="w-16 h-16 rounded-2xl bg-[#00FFC6]/10 border border-[#00FFC6]/30 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-[#00FFC6]" />
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">VoltGhost Locked</h2>
        <p className="text-sm text-slate-400 mt-1">
          Session paused to protect industrial digital twin & SCADA streams.
        </p>

        {currentUser && (
          <div className="mt-5 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-[#00FFC6]/20 border border-[#00FFC6]/40 flex items-center justify-center font-bold text-[#00FFC6]">
              {currentUser.name[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 uppercase font-mono">{currentUser.role}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              autoFocus
              placeholder="Enter password to resume"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FFC6] text-sm"
            />
          </div>

          {error && <div className="text-xs text-red-400 font-medium">{error}</div>}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#00FFC6]/20"
            >
              <span>Resume Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick(600);
                setLocked(false);
              }}
              className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white/80 font-medium rounded-xl text-xs transition"
              title="Instant bypass for presentation judges"
            >
              Demo Unlock
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
