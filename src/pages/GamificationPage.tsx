import React from 'react';
import {
  Trophy,
  Award,
  Flame,
  Ghost,
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import { sound } from '../lib/sound/soundEffects';

export const GamificationPage: React.FC = () => {
  const {
    ecoScore,
    ghostsBustedCount,
    xpPoints,
    dailyStreakDays,
    unlockedBadges,
    setIslandState,
  } = useAppStore();

  const handleFireConfetti = () => {
    sound.playGhostBusted();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIslandState({
      type: 'achievement',
      title: 'Facility Milestone Achieved!',
      message: 'Plant Alpha ranks #1 in Regional Eco Efficiency Leaderboard!',
    });
  };

  const allBadges = [
    { id: 'Night Owl Saver', title: 'Night Owl Saver', desc: 'Resolved compressor idle leakage during night shift', icon: '🌙' },
    { id: 'Vision Hawk', title: 'Vision Hawk', desc: 'Detected 5 unattended machines via Vision Lab', icon: '🦅' },
    { id: 'First Ghost Busted', title: 'First Ghost Busted', desc: 'Successfully reclaimed your first 10 kWh of waste', icon: '👻' },
    { id: 'Zero Idle Hour', title: 'Zero Idle Hour', desc: 'Maintained 0 idle equipment for an entire 8-hour shift', icon: '⚡' },
    { id: 'Chiller Master', title: 'Chiller Master', desc: 'Optimized supply water temperature setpoint to 12°C', icon: '❄️' },
    { id: 'Net Zero Champion', title: 'Net Zero Champion', desc: 'Achieved an Eco Score of 85+ across all 5 zones', icon: '🏆' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Zone 1: Machining Team', ghosts: 42, score: 92, xp: 4820 },
    { rank: 2, name: 'Zone 4: Cleanroom & IT', ghosts: 36, score: 88, xp: 4190 },
    { rank: 3, name: 'Zone 2: Assembly Cell', ghosts: 28, score: 81, xp: 3240 },
    { rank: 4, name: 'Zone 3: Thermal Loop', ghosts: 22, score: 76, xp: 2800 },
    { rank: 5, name: 'Zone 5: Logistics High Bay', ghosts: 19, score: 71, xp: 2150 },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Facility Gamification & Energy Leaderboards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Motivate shift operators and plant engineers through streak rewards, badges, and zone competitions.
          </p>
        </div>

        <button
          onClick={handleFireConfetti}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Achievements (Confetti)</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00FFC6]" />
            <span>Facility Eco Score</span>
          </div>
          <div className="text-3xl font-black text-[#00FFC6] font-mono mt-1">
            {ecoScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Top 12% across plants</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Ghost className="w-4 h-4 text-[#FF3366]" />
            <span>Ghosts Busted</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {ghostsBustedCount}
          </div>
          <div className="text-[10px] text-red-400 mt-1">+150 XP per ghost</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Operator Experience (XP)</span>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono mt-1">
            {xpPoints.toLocaleString()} <span className="text-sm font-normal text-slate-400">XP</span>
          </div>
          <div className="text-[10px] text-purple-400 mt-1">Level 7 Energy Auditor</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Daily Saver Streak</span>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {dailyStreakDays} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[10px] text-amber-300 mt-1">Streak multiplier 1.25x</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Decarbonization Badges & Achievements</span>
            </h3>
            <p className="text-xs text-slate-400">
              Unlock badges by detecting anomalies and running low-carbon shifts.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400">
            {unlockedBadges.length} of {allBadges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{badge.title}</span>
                    {isUnlocked && (
                      <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-bold uppercase">
                        EARNED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Zone Efficiency Leaderboard</span>
          </h3>
          <p className="text-xs text-slate-400">
            Internal plant competition tracking waste reduction and operator diligence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Zone Workcell</th>
                <th className="py-2.5 px-3">Ghosts Busted</th>
                <th className="py-2.5 px-3">Eco Score</th>
                <th className="py-2.5 px-3 text-right">Team XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-white/5 transition">
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">#{item.rank}</td>
                  <td className="py-3 px-3 font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-3 text-[#FF3366] font-mono font-bold">{item.ghosts}</td>
                  <td className="py-3 px-3 text-[#00FFC6] font-mono font-bold">{item.score}/100</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">
                    {item.xp.toLocaleString()} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
