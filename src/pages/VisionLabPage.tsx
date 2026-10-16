import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  Video,
  Shield,
  Layers,
  Sparkles,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  Eye,
  Activity,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { visionEngine } from '../lib/vision/visionEngine';
import { evaluateFusion } from '../lib/vision/fusionEngine';
import { sound } from '../lib/sound/soundEffects';

interface VisionLabPageProps {
  onNavigate: (page: string) => void;
}

export const VisionLabPage: React.FC<VisionLabPageProps> = ({ onNavigate }) => {
  const { equipment, setIslandState } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [visionState, setVisionState] = useState(visionEngine.getState());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_cnc');
  const [ipCamUrl, setIpCamUrl] = useState('');
  const [permissionNotice, setPermissionNotice] = useState(false);

  useEffect(() => {
    const unsub = visionEngine.subscribe((state) => {
      setVisionState({ ...state });
    });
    visionEngine.getCameraDevices();
    return () => unsub();
  }, []);

  const handleStartCamera = async () => {
    sound.playClick();
    const success = await visionEngine.startCamera();
    if (success && videoRef.current && canvasRef.current) {
      visionEngine.attachVideo(videoRef.current, canvasRef.current);
      setIslandState({
        type: 'camera',
        title: 'Vision Lab Active',
        message: 'Camera stream initialized with on-device edge processing.',
      });
    } else {
      setPermissionNotice(true);
    }
  };

  const handleStopCamera = () => {
    sound.playClick();
    visionEngine.stopCamera();
  };

  const handleSimulateEvent = (type: 'operator_leaves' | 'operator_enters' | 'lights_empty') => {
    sound.playAlert('medium');
    visionEngine.triggerSimulatedEvent(type);
    if (type === 'operator_leaves') {
      setIslandState({
        type: 'alert',
        title: 'Fusion Anomaly Triggered',
        message: 'CNC-A running (38 kW) but operator absent from zone for 14 min.',
      });
    } else if (type === 'lights_empty') {
      setIslandState({
        type: 'alert',
        title: 'Empty Zone Lighting Waste',
        message: 'High Bay Grid active (22 kW) with 0 occupants detected.',
      });
    }
  };

  const handleCaptureSnapshot = () => {
    sound.playClick(850);
    visionEngine.captureSnapshot('Cross-Modal Fusion Anomaly');
  };

  const fusionResults = evaluateFusion(equipment, visionState.zones);

  return (
    <div className="space-y-6">
      {/* Header & Local Privacy Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Camera className="w-6 h-6 text-[#00FFC6]" />
            <span>Vision Lab: Computer Vision & Sensor Fusion</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            In-browser detection of occupants and machine states fused with live electrical telemetry.
          </p>
        </div>

        {/* Privacy Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Process locally. No video leaves your device.</span>
          </div>

          <button
            onClick={visionState.isStreaming ? handleStopCamera : handleStartCamera}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              visionState.isStreaming
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-[#00FFC6] text-black hover:bg-[#33ffdc] shadow-md shadow-[#00FFC6]/20'
            }`}
          >
            {visionState.isStreaming ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Camera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport & Zone Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video / Canvas Feed (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Zone Camera Feed
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>FPS: <strong className="text-emerald-400">{visionState.fps}</strong></span>
              <span>•</span>
              <span className="text-[#00FFC6] font-bold">Fusion Active</span>
            </div>
          </div>

          {/* Video Container with Overlaid Zone Bounding Boxes */}
          <div className="relative w-full aspect-video bg-black/90 rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanline Effect */}
            <div className="scanline-effect" />

            {/* Render Draggable / Bounding Zones */}
            {visionState.zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const hasAnomaly = zone.personCount === 0 && zone.brightnessLevel > 80;

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  style={{
                    top: `${zone.y}%`,
                    left: `${zone.x}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                    borderColor: hasAnomaly ? '#FF3366' : zone.color,
                  }}
                  className={`absolute border-2 rounded-xl transition cursor-pointer select-none p-2 ${
                    isSelected ? 'bg-white/10 ring-2 ring-white/50' : 'bg-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono"
                      style={{ backgroundColor: `${zone.color}40`, color: zone.color }}
                    >
                      {zone.name}
                    </span>
                    <span className="font-mono text-xs">
                      {zone.personCount} {zone.personCount === 1 ? 'person' : 'persons'}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-mono bg-black/70 px-1.5 py-0.5 rounded">
                    Luminance: {zone.brightnessLevel}%
                  </div>
                </div>
              );
            })}

            {/* Floating Live Detection Labels */}
            {visionState.detections.map((det, i) => (
              <div
                key={i}
                style={{
                  left: `${det.box[0] * 100}%`,
                  top: `${det.box[1] * 100}%`,
                  width: `${det.box[2] * 100}%`,
                  height: `${det.box[3] * 100}%`,
                }}
                className="absolute border border-[#00FFC6] rounded pointer-events-none"
              >
                <span className="text-[9px] bg-[#00FFC6] text-black font-bold font-mono px-1">
                  PERSON {(det.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Feed Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCaptureSnapshot}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition flex items-center gap-2"
              >
                <Camera className="w-3.5 h-3.5 text-[#00FFC6]" />
                <span>Capture Incident Snapshot</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00FFC6]" />
              <span>Vision Confirms Sensor Stream</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Triggers & Fusion Rules Engine (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Simulated Event Panel for Demo */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#00FFC6]" />
                <span>Simulate Event (No Camera Needed)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Trigger camera events to demo cross-modal fusion instantly.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleSimulateEvent('operator_leaves')}
                className="w-full p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 hover:border-red-500/60 text-red-300 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>Trigger: Operator Leaves CNC Cell</span>
                <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded">Simulate</span>
              </button>

              <button
                onClick={() => handleSimulateEvent('operator_enters')}
                className="w-full p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>Trigger: Operator Enters / Present</span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Simulate</span>
              </button>

              <button
                onClick={() => handleSimulateEvent('lights_empty')}
                className="w-full p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-bold text-left transition flex items-center justify-between"
              >
                <span>Trigger: Lights Active in Vacant Room</span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Simulate</span>
              </button>
            </div>
          </div>

          {/* Active Fusion Detections */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF3366]" />
                <span>Cross-Modal Fusion Alerts</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sensor telemetry combined with computer vision occupancy.
              </p>
            </div>

            {fusionResults.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active cross-modal anomalies. Telemetry is balanced.
              </div>
            ) : (
              fusionResults.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-red-950/30 border border-red-500/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300">{f.ruleTriggered}</span>
                    <span className="text-[10px] bg-red-500/20 text-red-200 px-1.5 py-0.2 rounded font-mono font-bold">
                      {(f.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{f.explanation}</p>
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Wasting:</span>
                    <span className="font-mono font-bold text-[#FF3366]">
                      ~{f.wastedKwEstimate.toFixed(1)} kW
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Incident Snapshot Gallery */}
          {visionState.incidentGallery.length > 0 && (
            <div className="glass-panel p-5 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00FFC6]" />
                <span>Incident Snapshot Gallery</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {visionState.incidentGallery.map((snap) => (
                  <div
                    key={snap.id}
                    className="rounded-xl overflow-hidden border border-white/10 group relative"
                  >
                    <img src={snap.snapshot} alt={snap.label} className="w-full h-auto object-cover" />
                    <div className="p-1.5 bg-black/80 text-[9px] text-slate-300 font-mono truncate">
                      {snap.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
