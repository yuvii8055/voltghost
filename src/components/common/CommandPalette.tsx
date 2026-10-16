import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Box,
  Sliders,
  Sparkles,
  Camera,
  ShieldCheck,
  Activity,
  BarChart3,
  Leaf,
  Trophy,
  Palette,
  Settings,
  Lock,
  Ghost,
  Radio,
  X,
  Keyboard,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { sound } from '../../lib/sound/soundEffects';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const {
    bustGhost,
    ghostEvents,
    setEcoMode,
    ecoMode,
    setLocked,
    setConnectedDevice,
  } = useAppStore();

  const commands = [
    { id: 'p_dash', title: 'Command Center', category: 'Navigation', icon: LayoutDashboard, action: () => onNavigate('dashboard') },
    { id: 'p_twin', title: '3D Digital Twin', category: 'Navigation', icon: Box, action: () => onNavigate('twin') },
    { id: 'p_whatif', title: 'What-If Simulator', category: 'Navigation', icon: Sliders, action: () => onNavigate('whatif') },
    { id: 'p_coach', title: 'Carbon Coach (AI)', category: 'Navigation', icon: Sparkles, action: () => onNavigate('coach') },
    { id: 'p_vision', title: 'Vision Lab (CV & Webcam)', category: 'Navigation', icon: Camera, action: () => onNavigate('vision') },
    { id: 'p_admin', title: 'Master Admin Console', category: 'Admin', icon: ShieldCheck, action: () => onNavigate('admin') },
    { id: 'p_maint', title: 'Predictive Maintenance', category: 'Tools', icon: Activity, action: () => onNavigate('maintenance') },
    { id: 'p_analytics', title: 'Analytics & Energy Reports', category: 'Tools', icon: BarChart3, action: () => onNavigate('analytics') },
    { id: 'p_esg', title: 'Carbon & ESG Center', category: 'Tools', icon: Leaf, action: () => onNavigate('esg') },
    { id: 'p_game', title: 'Gamification & Badges', category: 'Tools', icon: Trophy, action: () => onNavigate('gamification') },
    { id: 'p_sources', title: 'Data Source Manager (BLE)', category: 'Hardware', icon: Radio, action: () => onNavigate('datasources') },
    { id: 'p_theme', title: 'Theme Studio', category: 'Customization', icon: Palette, action: () => onNavigate('themes') },
    { id: 'p_settings', title: 'Settings & Profile', category: 'Customization', icon: Settings, action: () => onNavigate('settings') },
    {
      id: 'act_bust',
      title: 'Bust Active Ghost Anomaly',
      category: 'Quick Action',
      icon: Ghost,
      action: () => {
        const top = ghostEvents.find((g) => !g.resolved);
        if (top) bustGhost(top.id);
      },
    },
    {
      id: 'act_eco',
      title: ecoMode ? 'Deactivate Emergency Eco Mode' : 'Activate Emergency Eco Mode',
      category: 'Quick Action',
      icon: Leaf,
      action: () => setEcoMode(!ecoMode),
    },
    {
      id: 'act_lock',
      title: 'Lock Application (Ctrl+L)',
      category: 'Security',
      icon: Lock,
      action: () => setLocked(true),
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !isOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
        setShowCheatSheet(true);
      }
      if (e.key === 'Escape') {
        setShowCheatSheet(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen && !showCheatSheet) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md">
        {showCheatSheet ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-[#0C1222] border border-white/10 rounded-2xl p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#00FFC6]" />
                <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowCheatSheet(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                <span className="text-white/70">Command Bar</span>
                <kbd className="px-2 py-1 bg-white/10 text-[#00FFC6] font-mono text-xs rounded">Ctrl + K</kbd>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                <span className="text-white/70">Lock Screen</span>
                <kbd className="px-2 py-1 bg-white/10 text-amber-300 font-mono text-xs rounded">Ctrl + L</kbd>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                <span className="text-white/70">Shortcuts Help</span>
                <kbd className="px-2 py-1 bg-white/10 text-cyan-300 font-mono text-xs rounded">?</kbd>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                <span className="text-white/70">Easter Egg</span>
                <kbd className="px-2 py-1 bg-white/10 text-purple-300 font-mono text-xs rounded">Type "boo"</kbd>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl bg-[#0B132B]/95 border border-[var(--color-border,#00FFC6)]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
              <Search className="w-5 h-5 text-[var(--color-accent,#00FFC6)]" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, page, machine or action..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
              />
              <button
                onClick={onClose}
                className="px-2 py-1 bg-white/10 text-xs text-white/60 hover:text-white rounded"
              >
                ESC
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-[340px] overflow-y-auto p-2 divide-y divide-white/5">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">
                  No matching commands found.
                </div>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playClick();
                        item.action();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-left transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[var(--color-accent,#00FFC6)]/20 group-hover:text-[var(--color-accent,#00FFC6)] transition">
                          <Icon className="w-4 h-4 text-white/80 group-hover:text-[var(--color-accent,#00FFC6)]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-[var(--color-accent,#00FFC6)]">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-white/40">{item.category}</div>
                        </div>
                      </div>
                      <span className="text-xs text-white/30 group-hover:text-white/70">Jump →</span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
