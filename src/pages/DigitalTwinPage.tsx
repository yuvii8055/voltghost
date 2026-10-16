import React, { useState, useEffect } from 'react';
import {
  Eye,
  Ghost,
  Flame,
  Leaf,
  Sun,
  Moon,
  Camera,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Equipment } from '../types';
import { Facility3DScene } from '../components/twin/Facility3DScene';
import { MachineDetailModal } from '../components/twin/MachineDetailModal';
import { ARVideoOverlay } from '../components/twin/ARVideoOverlay';
import { TwinVisualMode } from '../components/twin/Machine3D';
import { sound } from '../lib/sound/soundEffects';

interface DigitalTwinPageProps {
  onNavigate: (page: string) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ onNavigate }) => {
  const { equipment } = useAppStore();

  const [mode, setMode] = useState<TwinVisualMode>('GAP');
  const [selectedMachine, setSelectedMachine] = useState<Equipment | null>(null);
  const [arOverlayOpen, setArOverlayOpen] = useState(false);
  const [timeHour, setTimeHour] = useState(14); // 2:00 PM default
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [dayNightFactor, setDayNightFactor] = useState(0.8);

  // Time scrubber replay timelapse
  useEffect(() => {
    let timer: any = null;
    if (isPlayingReplay) {
      timer = setInterval(() => {
        setTimeHour((prev) => {
          const next = (prev + 1) % 24;
          // Calculate day/night factor from hour
          const day = next >= 6 && next <= 18 ? 0.9 : 0.25;
          setDayNightFactor(day);
          return next;
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isPlayingReplay]);

  const handleTakeScreenshot = () => {
    sound.playClick(900);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `voltghost-twin-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-3 relative select-none">
      {/* Top Controls Toolbar */}
      <div className="glass-panel p-3 px-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-[#00FFC6] animate-ghost-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight m-0">
              3D Industrial Digital Twin
            </h3>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            {(
              [
                { id: 'GAP', label: 'GAP Overlay', icon: Ghost, color: 'text-[#FF3366]' },
                { id: 'REAL', label: 'Real Asset', icon: Eye, color: 'text-amber-400' },
                { id: 'GHOST', label: 'Ghost (Ideal)', icon: Sparkles, color: 'text-[#00FFC6]' },
                { id: 'THERMAL', label: 'Thermal Heat', icon: Flame, color: 'text-rose-400' },
                { id: 'CARBON', label: 'Carbon Scope 2', icon: Leaf, color: 'text-emerald-400' },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    setMode(m.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AR X-Ray Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setArOverlayOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AR X-Ray Mode</span>
          </button>

          {/* Screenshot & Share */}
          <button
            onClick={handleTakeScreenshot}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
            title="Download Twin Screenshot"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Viewport Canvas */}
      <div className="flex-1 rounded-3xl border border-white/10 overflow-hidden relative bg-[#070B14]">
        <Facility3DScene
          equipmentList={equipment}
          mode={mode}
          selectedEquipment={selectedMachine}
          onSelectEquipment={(eq) => {
            sound.playClick(750);
            setSelectedMachine(eq);
          }}
          dayNightFactor={dayNightFactor}
        />

        {/* Floating Legend / Mode Helper */}
        <div className="absolute top-4 left-4 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white max-w-xs pointer-events-none">
          <div className="font-bold flex items-center gap-1.5 text-[#00FFC6]">
            <Info className="w-4 h-4" />
            <span>Mode: {mode}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {mode === 'GAP' &&
              'Machines with avoidable waste glow crimson red. Ideal translucent Ghost Twins overlap for instant visual delta.'}
            {mode === 'REAL' &&
              'Solid physical asset telemetry including vibration, current draw, and machine operational states.'}
            {mode === 'GHOST' &&
              'Pure translucent ideal-efficiency design model operating with zero thermodynamic losses.'}
            {mode === 'THERMAL' &&
              'Surface skin heat signatures mapped from thermal infrared sensors (blue cool to red hot).'}
            {mode === 'CARBON' &&
              'Emission rate color gradient based on local grid emission factor (0.71 kg CO₂e/kWh).'}
          </div>
        </div>

        {/* Bottom Time Scrubber & Ghost Replay Bar */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsPlayingReplay(!isPlayingReplay);
              }}
              className="p-2 rounded-xl bg-[var(--color-accent,#00FFC6)] text-black hover:brightness-110 transition font-bold"
              title={isPlayingReplay ? 'Pause Replay' : 'Play Ghost Replay Timelapse'}
            >
              {isPlayingReplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="text-xs">
              <span className="font-bold text-white">Ghost Replay</span>
              <div className="text-[10px] text-slate-400 font-mono">
                Timelapse Time: {timeHour.toString().padStart(2, '0')}:00 {timeHour >= 12 ? 'PM' : 'AM'}
              </div>
            </div>
          </div>

          {/* Scrubber Slider */}
          <div className="flex-1 max-w-xl mx-4 flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-mono">00:00</span>
            <input
              type="range"
              min="0"
              max="23"
              value={timeHour}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                setTimeHour(h);
                setDayNightFactor(h >= 6 && h <= 18 ? 0.9 : 0.25);
              }}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00FFC6]"
            />
            <span className="text-[10px] text-slate-400 font-mono">23:00</span>
          </div>

          {/* Day / Night Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            {dayNightFactor > 0.5 ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
            <span className="hidden sm:inline">{dayNightFactor > 0.5 ? 'Day Shift' : 'Night Shift'}</span>
          </div>
        </div>
      </div>

      {/* Machine Diagnostic Inspection Modal */}
      <MachineDetailModal
        equipment={selectedMachine}
        onClose={() => setSelectedMachine(null)}
        onNavigateToCoach={() => onNavigate('coach')}
      />

      {/* AR X-Ray Video Overlay */}
      {arOverlayOpen && (
        <ARVideoOverlay
          equipmentList={equipment}
          onClose={() => setArOverlayOpen(false)}
          onSelectMachine={(eq) => {
            setSelectedMachine(eq);
            setArOverlayOpen(false);
          }}
        />
      )}
    </div>
  );
};
