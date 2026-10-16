import React, { useState } from 'react';
import {
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
  Radio,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  Ghost,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { canAccessAdminConsole } from '../../lib/auth/rbac';
import { sound } from '../../lib/sound/soundEffects';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { activeRole } = useAppStore();

  const isAdmin = canAccessAdminConsole(activeRole);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'twin', label: '3D Digital Twin', icon: Box, badge: 'HERO' },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'coach', label: 'Carbon Coach (AI)', icon: Sparkles },
    { id: 'vision', label: 'Vision Lab', icon: Camera, badge: 'CV' },
    {
      id: 'admin',
      label: 'Admin Console',
      icon: ShieldCheck,
      restricted: !isAdmin,
      goldAccent: true,
      badge: 'ADMIN',
    },
    { id: 'maintenance', label: 'Predictive Maint.', icon: Activity },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'esg', label: 'Carbon & ESG', icon: Leaf },
    { id: 'gamification', label: 'Gamification & XP', icon: Trophy },
    { id: 'datasources', label: 'Data Sources (BLE)', icon: Radio },
    { id: 'themes', label: 'Theme Studio', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/10 bg-[#070B14]/70 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isRestricted = item.restricted;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                title={isRestricted ? `${item.label} (Requires Master Admin)` : item.label}
                data-restricted={isRestricted ? 'true' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? item.goldAccent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[var(--color-accent,#00FFC6)]/15 text-[var(--color-accent,#00FFC6)] border border-[var(--color-accent,#00FFC6)]/40 shadow-[0_0_15px_rgba(0,255,198,0.15)]'
                    : isRestricted
                    ? 'text-slate-500 hover:text-slate-400 hover:bg-white/5 opacity-70'
                    : item.goldAccent
                    ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? item.goldAccent
                          ? 'text-amber-300'
                          : 'text-[var(--color-accent,#00FFC6)]'
                        : isRestricted
                        ? 'text-slate-500'
                        : item.goldAccent
                        ? 'text-amber-400'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {isRestricted && (
                    <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500/80" />
                  )}
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          item.goldAccent
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[var(--color-accent,#00FFC6)]/20 text-[var(--color-accent,#00FFC6)] border border-[var(--color-accent,#00FFC6)]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse toggle footer */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (360px - 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B14]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
          { id: 'twin', label: 'Twin', icon: Box },
          { id: 'whatif', label: 'What-If', icon: Sliders },
          { id: 'vision', label: 'Vision', icon: Camera },
          { id: 'coach', label: 'Coach', icon: Sparkles },
          { id: 'admin', label: 'Admin', icon: ShieldCheck, restricted: !isAdmin },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activePage === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick();
                onNavigate(m.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] transition ${
                isActive
                  ? 'text-[var(--color-accent,#00FFC6)] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
