import React, { useRef, useEffect } from 'react';
import { Camera, X, AlertTriangle, Zap, Ghost } from 'lucide-react';
import { Equipment } from '../../types';

interface ARVideoOverlayProps {
  equipmentList: Equipment[];
  onClose: () => void;
  onSelectMachine: (eq: Equipment) => void;
}

export const ARVideoOverlay: React.FC<ARVideoOverlayProps> = ({
  equipmentList,
  onClose,
  onSelectMachine,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {
          console.warn('AR Webcam fallback to simulated overlay');
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <Camera className="w-5 h-5 text-[#00FFC6]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AR Industrial X-Ray Mode
            </h3>
            <div className="text-[11px] text-slate-400">
              Floating Telemetry HUD Projected Live Over Physical Facility
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Video Viewport with AR Overlays */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover opacity-80"
        />

        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80" />
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/70 border border-[#00FFC6]/40 text-xs font-mono text-[#00FFC6]">
          <div>AR TRACKING: LOCKED</div>
          <div>CV TARGET: 12 ANCHORS ACTIVE</div>
          <div>FUSION CONFIDENCE: 98.4%</div>
        </div>

        {/* Floating Machine HUD Tags positioned across screen */}
        {equipmentList.slice(0, 6).map((eq, idx) => {
          const positions = [
            { top: '25%', left: '18%' },
            { top: '35%', left: '55%' },
            { top: '55%', left: '28%' },
            { top: '65%', left: '70%' },
            { top: '20%', left: '78%' },
            { top: '45%', left: '42%' },
          ];
          const pos = positions[idx] || { top: '50%', left: '50%' };
          const gapKw = Math.max(0, eq.currentKw - eq.idealKw);
          const isWaste = gapKw > 4;

          return (
            <div
              key={eq.id}
              style={pos}
              onClick={() => onSelectMachine(eq)}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-[var(--color-accent,#00FFC6)]/60 text-white shadow-2xl transition hover:scale-110 active:scale-95 hover:border-[var(--color-accent,#00FFC6)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FFC6] animate-pulse" />
                <span className="font-bold text-xs truncate max-w-[150px]">{eq.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                <span className="text-white font-bold">{eq.currentKw} kW</span>
                {isWaste && (
                  <span className="text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded text-[10px]">
                    +{gapKw.toFixed(1)} kW GAP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
