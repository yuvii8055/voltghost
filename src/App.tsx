import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { simulator } from './lib/simulator/engine';
import { authService } from './lib/auth/authService';
import { applyTheme, getThemeById } from './lib/themes/themeManager';
import { Layout } from './components/layout/Layout';

// Pages
import { LandingHeroPage } from './pages/LandingHeroPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { CarbonCoachPage } from './pages/CarbonCoachPage';
import { VisionLabPage } from './pages/VisionLabPage';
import { AdminConsolePage } from './pages/AdminConsolePage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CarbonEsgPage } from './pages/CarbonEsgPage';
import { GamificationPage } from './pages/GamificationPage';
import { DataSourcePage } from './pages/DataSourcePage';
import { ThemeStudioPage } from './pages/ThemeStudioPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

export function App() {
  const {
    currentUser,
    currentThemeId,
    customTheme,
    updateSimulatorState,
    login,
    setLocked,
  } = useAppStore();

  const [activePage, setActivePage] = useState<string>('dashboard');

  // Initialize Auth & Theme
  useEffect(() => {
    authService.init().then(() => {
      const u = authService.getCurrentUser();
      const s = authService.getCurrentSession();
      if (u && s) {
        login(u, s);
      }
    });

    const activeTheme = customTheme || getThemeById(currentThemeId);
    applyTheme(activeTheme);
  }, []);

  // Initialize Simulator Engine Tick
  useEffect(() => {
    simulator.start();
    const unsub = simulator.subscribe((simState) => {
      updateSimulatorState({
        equipment: simState.equipment,
        ghostEvents: simState.ghostEvents,
        totalWastedKwh: simState.totalWastedKwh,
        totalCostInr: simState.totalCostInr,
        totalCo2Kg: simState.totalCo2Kg,
        ecoMode: simState.ecoMode,
        chaosMode: simState.chaosMode,
      });
    });

    return () => {
      unsub();
      simulator.stop();
    };
  }, [updateSimulatorState]);

  // Global hotkeys (Ctrl+L for lock screen, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setLocked(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocked]);

  // If user is not authenticated, show Landing Hero & Auth Screen
  if (!currentUser) {
    return <LandingHeroPage onLoginSuccess={() => setActivePage('dashboard')} />;
  }

  // Active page renderer
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <CommandCenterPage onNavigate={setActivePage} />;
      case 'twin':
        return <DigitalTwinPage onNavigate={setActivePage} />;
      case 'whatif':
        return <WhatIfSimulatorPage onNavigate={setActivePage} />;
      case 'coach':
        return <CarbonCoachPage onNavigate={setActivePage} />;
      case 'vision':
        return <VisionLabPage onNavigate={setActivePage} />;
      case 'admin':
        return <AdminConsolePage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'esg':
        return <CarbonEsgPage />;
      case 'gamification':
        return <GamificationPage />;
      case 'datasources':
        return <DataSourcePage />;
      case 'themes':
        return <ThemeStudioPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <ProfileSettingsPage />;
      default:
        return <CommandCenterPage onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderActivePage()}
    </Layout>
  );
}

export default App;
