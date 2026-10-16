import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DynamicIsland } from '../common/DynamicIsland';
import { CustomCursor } from '../common/CustomCursor';
import { CommandPalette } from '../common/CommandPalette';
import { LockScreenModal } from '../common/LockScreenModal';
import { EmergencyModal } from '../common/EmergencyModal';
import { EasterEggGhost } from '../common/EasterEggGhost';
import { OnboardingTour } from '../common/OnboardingTour';
import { useAppStore } from '../../store/useAppStore';
import { AlertTriangle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { maintenanceModeBanner } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark,#070B14)] text-[var(--color-text-primary,#F8FAFC)] flex flex-col relative select-none">
      {/* Maintenance Mode Banner if active */}
      {maintenanceModeBanner && (
        <div className="bg-amber-500 text-black px-4 py-1.5 font-bold text-xs flex items-center justify-center gap-2 tracking-wide uppercase shadow-md z-50">
          <AlertTriangle className="w-4 h-4" />
          <span>System Maintenance Mode Active • Telemetry and SCADA Writes are Rate-Limited</span>
        </div>
      )}

      {/* Signature Dynamic Island */}
      <DynamicIsland onNavigate={onNavigate} />

      {/* Custom Cursor & Radial Spotlight */}
      <CustomCursor />

      {/* Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onNavigate={onNavigate}
        activePage={activePage}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 px-3 sm:px-6 py-4 md:py-6 relative">
          {children}
        </main>
      </div>

      {/* Modals and Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
      <LockScreenModal />
      <EmergencyModal />
      <EasterEggGhost />
      <OnboardingTour onNavigate={onNavigate} />
    </div>
  );
};
