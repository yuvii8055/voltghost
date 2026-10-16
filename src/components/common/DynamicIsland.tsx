import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost,
  AlertTriangle,
  Sparkles,
  Bluetooth,
  Video,
  Mic,
  Award,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  Settings2,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

interface DynamicIslandProps {
  onNavigate?: (page: string) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ onNavigate }) => {
  const {
    islandState,
    islandQueue,
    isIslandExpanded,
    setIslandExpanded,
    popIslandQueue,
    equipment,
    totalWastedKwh,
    totalCostInr,
    soundEnabled,
    toggleSound,
    setLocked,
    bustGhost,
    ghostEvents,
  } = useAppStore();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isNear, setIsNear] = useState(false);

  // Proximity reaction to cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const islandX = window.innerWidth / 2;
      const islandY = 32;
      const dist = Math.hypot(e.clientX - islandX, e.clientY - islandY);
      setIsNear(dist < 140);
      if (dist < 140) {
        setMousePos({
          x: (e.clientX - islandX) * 0.08,
          y: (e.clientY - islandY) * 0.08,
        });
      } else {
        setMousePos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const totalGapKw = equipment
    .reduce((acc, eq) => acc + Math.max(0, eq.currentKw - eq.idealKw), 0)
    .toFixed(1);

  const activeGhost = ghostEvents.find((g) => !g.resolved);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y,
          boxShadow: isNear
            ? '0 0 35px 2px rgba(0, 255, 198, 0.4)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.8)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative bg-black text-white rounded-full border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl transition-colors duration-300"
      >
        <AnimatePresence mode="wait">
          {/* Expanded Mini Control Center */}
          {isIslandExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, width: 220, height: 42, borderRadius: 9999 }}
              animate={{ opacity: 1, width: 380, height: 'auto', borderRadius: 28 }}
              exit={{ opacity: 0, width: 220, height: 42, borderRadius: 9999 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Ghost className="w-5 h-5 text-[#00FFC6] animate-pulse" />
                  <span className="font-bold text-sm tracking-wide">Dynamic Island Control</span>
                </div>
                <button
                  onClick={() => setIslandExpanded(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/50 text-[11px]">Live Waste</div>
                  <div className="text-base font-extrabold text-[#FF3366] font-mono mt-0.5">
                    {totalGapKw} kW
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/50 text-[11px]">Today Wasted</div>
                  <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                    ₹{Math.round(totalCostInr).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    toggleSound();
                    sound.playClick();
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                    soundEnabled
                      ? 'bg-[#00FFC6]/15 border-[#00FFC6]/40 text-[#00FFC6]'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                  title="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 mb-1" /> : <VolumeX className="w-4 h-4 mb-1" />}
                  <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
                </button>

                <button
                  onClick={() => {
                    setLocked(true);
                    setIslandExpanded(false);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/40 text-xs text-white/80 hover:text-amber-300 transition"
                  title="Lock Screen (Ctrl+L)"
                >
                  <Lock className="w-4 h-4 mb-1" />
                  <span>Lock App</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate?.('coach');
                    setIslandExpanded(false);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 text-xs text-white/80 hover:text-purple-300 transition"
                  title="Ask Carbon Coach"
                >
                  <Bot className="w-4 h-4 mb-1" />
                  <span>Coach</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate?.('themes');
                    setIslandExpanded(false);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs text-white/80 hover:text-cyan-300 transition"
                  title="Themes"
                >
                  <SlidersHorizontal className="w-4 h-4 mb-1" />
                  <span>Theme</span>
                </button>
              </div>

              {activeGhost && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <div className="truncate text-xs">
                      <span className="font-semibold text-red-200">{activeGhost.equipmentName}</span>
                      <div className="text-[11px] text-red-300/70 truncate">{activeGhost.reason}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      bustGhost(activeGhost.id);
                    }}
                    className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-400 text-black text-xs font-bold rounded-lg shrink-0 transition"
                  >
                    Bust
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* Morphing Island States */
            <motion.div
              key={islandState.type}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={() => setIslandExpanded(true)}
              className="cursor-pointer select-none flex items-center px-4 py-2 gap-3 h-10 hover:bg-white/5 transition"
            >
              {/* STATE 1: IDLE */}
              {islandState.type === 'idle' && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Ghost className="w-4 h-4 text-[#00FFC6] animate-ghost-pulse" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#00FFC6] rounded-full animate-ping" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-white/60 font-medium">Ghost Gap:</span>
                    <span className="font-mono font-bold text-[#FF3366] text-sm">
                      {totalGapKw} kW
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
                    Live
                  </span>
                </div>
              )}

              {/* STATE 2: ALERT */}
              {islandState.type === 'alert' && (
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-red-300">
                      {islandState.title || 'Ghost Anomaly'}
                    </span>
                    <span className="text-[10px] text-white/70 max-w-[200px] truncate">
                      {islandState.message}
                    </span>
                  </div>
                  {activeGhost && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        bustGhost(activeGhost.id);
                      }}
                      className="px-2.5 py-0.5 bg-red-500 hover:bg-red-400 text-black text-[11px] font-bold rounded-full transition"
                    >
                      Bust
                    </button>
                  )}
                </div>
              )}

              {/* STATE 3: AI STREAMING */}
              {islandState.type === 'ai_streaming' && (
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-purple-400 animate-pulse rounded-full" />
                    <span className="w-1 h-4 bg-purple-400 animate-pulse delay-75 rounded-full" />
                    <span className="w-1 h-2 bg-purple-400 animate-pulse delay-150 rounded-full" />
                  </div>
                  <span className="text-xs text-purple-200 font-medium max-w-[220px] truncate">
                    {islandState.message || 'Carbon Coach analyzing telemetry...'}
                  </span>
                </div>
              )}

              {/* STATE 4: BLUETOOTH */}
              {islandState.type === 'bluetooth' && (
                <div className="flex items-center gap-2.5">
                  <Bluetooth className="w-4 h-4 text-blue-400 animate-bounce" />
                  <span className="text-xs text-blue-200 font-medium">
                    {islandState.title || 'BLE Sensor Streaming'}
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    2.4 kW
                  </span>
                </div>
              )}

              {/* STATE 5: CAMERA */}
              {islandState.type === 'camera' && (
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <Video className="w-4 h-4 text-rose-400" />
                  <span className="text-xs text-rose-200 font-medium max-w-[220px] truncate">
                    {islandState.message || 'Vision: 3 people detected, zone active'}
                  </span>
                </div>
              )}

              {/* STATE 6: VOICE */}
              {islandState.type === 'voice' && (
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-[#00FFC6] animate-pulse" />
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-[#00FFC6] animate-pulse rounded-full" />
                    <span className="w-1 h-5 bg-[#00FFC6] animate-pulse delay-100 rounded-full" />
                    <span className="w-1 h-3 bg-[#00FFC6] animate-pulse delay-200 rounded-full" />
                  </div>
                  <span className="text-xs text-[#00FFC6] font-medium max-w-[200px] truncate">
                    {islandState.message || 'Listening...'}
                  </span>
                </div>
              )}

              {/* STATE 7: ACHIEVEMENT */}
              {islandState.type === 'achievement' && (
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-xs font-bold text-amber-300">
                    {islandState.title || 'Ghost Busted!'}
                  </span>
                  <span className="text-[11px] text-white/80">{islandState.message}</span>
                </div>
              )}

              {/* STATE 8: SCENARIO APPLIED */}
              {islandState.type === 'scenario_applied' && (
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    {islandState.title}
                  </span>
                  <span className="text-[11px] text-white/80">{islandState.message}</span>
                </div>
              )}

              {/* STATE 9: TIMER / SIMULATION */}
              {islandState.type === 'timer' && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs font-semibold text-cyan-300">
                    {islandState.title}
                  </span>
                  <span className="text-[11px] text-white/80">{islandState.message}</span>
                </div>
              )}

              {/* Queue cycle indicator if multiple events exist */}
              {islandQueue.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    popIslandQueue();
                  }}
                  className="ml-1 pl-2 border-l border-white/20 text-white/50 hover:text-white"
                  title="Next event in queue"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
