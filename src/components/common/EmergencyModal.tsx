import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Siren, Power, CheckCircle, Volume2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

export const EmergencyModal: React.FC = () => {
  const {
    emergencyModalOpen,
    emergencyFaultDetails,
    dismissEmergencyAlert,
    setEcoMode,
  } = useAppStore();

  if (!emergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-lg bg-[#180509] border-2 border-red-500 rounded-3xl p-7 text-white shadow-[0_0_80px_rgba(239,68,68,0.5)] relative overflow-hidden"
      >
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <Siren className="w-8 h-8 animate-bounce text-red-400" />
          <h2 className="text-2xl font-black tracking-wide uppercase">Critical Fault Overload</h2>
        </div>

        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-sm text-red-200">
          <div className="font-semibold text-red-100 mb-1">Telemetry Safety Interlock Tripped:</div>
          <p>{emergencyFaultDetails || 'Current draw on induction furnace has exceeded 250A threshold with thermal setpoint drifting past 960°C. Imminent transformer overload risk.'}</p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setEcoMode(true);
              dismissEmergencyAlert();
            }}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/40"
          >
            <Power className="w-4 h-4" />
            <span>Engage Emergency Eco Shedding</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              dismissEmergencyAlert();
            }}
            className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white/80 font-medium rounded-xl text-sm transition"
          >
            Acknowledge & Clear
          </button>
        </div>
      </motion.div>
    </div>
  );
};
