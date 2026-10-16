import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Ghost, Box, Camera, ShieldCheck, Compass } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

interface OnboardingTourProps {
  onNavigate: (page: string) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onNavigate }) => {
  const { tourCompleted, completeTour, currentUser, activeRole } = useAppStore();
  const [stepIndex, setStepIndex] = useState(0);

  if (tourCompleted) return null;

  const steps = [
    {
      title: 'Welcome to VoltGhost',
      subtitle: 'Hunt your energy ghosts',
      description: 'Every industrial machine has a "Ghost Twin": an ideal-efficiency counterpart. Real consumption minus Ghost consumption equals your Ghost Gap (pure waste).',
      icon: Ghost,
      color: '#00FFC6',
      badge: 'Core Concept',
      page: 'dashboard',
    },
    {
      title: 'The Dynamic Island',
      subtitle: 'Signature top-center telemetry pill',
      description: 'Watch the live Ghost Gap tick in real-time. Expand it anytime by clicking or pressing to access quick controls, audio toggles, and live alerts.',
      icon: Sparkles,
      color: '#8B5CF6',
      badge: 'Signature UI',
      page: 'dashboard',
    },
    {
      title: '3D Interactive Digital Twin',
      subtitle: 'Procedural factory floor with Ghost Overlays',
      description: 'Switch between REAL, GHOST, GAP, THERMAL, and CARBON modes. High-waste equipment glows radiant crimson. Click any machine to inspect its telemetry and run diagnostics.',
      icon: Box,
      color: '#0284C7',
      badge: 'Hero Feature',
      page: 'twin',
    },
    {
      title: 'Vision Lab & Sensor Fusion',
      subtitle: 'Cross-modal AI waste detection',
      description: 'Fuse real webcam or simulated video with sensor telemetry. If a machine is drawing 38 kW but the zone has 0 occupants for 14 minutes, VoltGhost automatically alerts.',
      icon: Camera,
      color: '#F59E0B',
      badge: 'Computer Vision',
      page: 'vision',
    },
    {
      title: activeRole === 'admin' ? 'Master Admin Console' : 'What-If Simulator & Carbon Coach',
      subtitle: activeRole === 'admin' ? 'Privileged gold-accented command center' : 'Generative AI action plans & scenario testing',
      description: activeRole === 'admin'
        ? 'Full control over user management, immutable audit logs, kill-switch, policy engine, and scenario approval workflows.'
        : 'Run Monte Carlo scenario simulations to predict annual INR and CO2 savings, and consult Carbon Coach for quantified ROI strategies.',
      icon: ShieldCheck,
      color: '#F59E0B',
      badge: activeRole === 'admin' ? 'Admin Access' : 'AI Optimization',
      page: activeRole === 'admin' ? 'admin' : 'whatif',
    },
  ];

  const currentStep = steps[stepIndex];
  const Icon = currentStep.icon;

  const handleNext = () => {
    sound.playClick();
    if (stepIndex < steps.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      onNavigate(steps[nextIdx].page);
    } else {
      completeTour();
      sound.playGhostBusted();
    }
  };

  const handleSkip = () => {
    sound.playClick();
    completeTour();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="glass-panel p-5 bg-[#0B132B]/95 border border-[var(--color-accent,#00FFC6)]/40 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--color-accent,#00FFC6)]/20 text-[var(--color-accent,#00FFC6)]">
              {currentStep.badge}
            </span>
            <span className="text-xs text-white/50">
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>
          <button onClick={handleSkip} className="text-white/40 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div
            className="p-2.5 rounded-xl border flex-shrink-0"
            style={{
              backgroundColor: `${currentStep.color}15`,
              borderColor: `${currentStep.color}40`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: currentStep.color }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{currentStep.title}</h4>
            <div className="text-xs text-slate-300 font-medium">{currentStep.subtitle}</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{currentStep.description}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-5 bg-[var(--color-accent,#00FFC6)]'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[var(--color-accent,#00FFC6)] hover:brightness-110 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-md"
            >
              <span>{stepIndex === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
