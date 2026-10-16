import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Session,
  Role,
  Equipment,
  GhostEvent,
  Scenario,
  BleDevice,
  VisionZone,
  MaintenanceTicket,
  AuditEntry,
  DynamicIslandState,
  Theme,
} from '../types';
import { simulator } from '../lib/simulator/engine';
import { authService } from '../lib/auth/authService';
import { DEFAULT_THEME_ID, getThemeById, applyTheme } from '../lib/themes/themeManager';
import { THEME_PRESETS } from '../lib/themes/presets';
import { sound } from '../lib/sound/soundEffects';

export interface AppState {
  // Auth & Session
  currentUser: User | null;
  currentSession: Session | null;
  isLocked: boolean;
  activeRole: Role;
  
  // Dynamic Island
  islandState: DynamicIslandState;
  islandQueue: DynamicIslandState[];
  isIslandExpanded: boolean;

  // Global Settings & Themes
  currentThemeId: string;
  customTheme: Theme | null;
  soundEnabled: boolean;
  customCursorEnabled: boolean;
  selectedSite: 'Plant Alpha' | 'Plant Beta' | 'Tech Park Office';
  autoPilotMode: boolean;
  maintenanceModeBanner: boolean;
  tourCompleted: boolean;

  // Simulator & Energy Telemetry
  equipment: Equipment[];
  ghostEvents: GhostEvent[];
  totalWastedKwh: number;
  totalCostInr: number;
  totalCo2Kg: number;
  simSpeed: 1 | 10 | 60;
  ecoMode: boolean;
  chaosMode: boolean;
  tariffPerKwh: number;
  emissionFactor: number;
  carbonBudgetKg: number; // e.g. 5000 kg/month

  // Scenarios (What-If Approval Workflow)
  scenarios: Scenario[];

  // Hardware & Devices
  connectedDevice: BleDevice | null;
  activeZones: VisionZone[];

  // Maintenance & Audit
  maintenanceTickets: MaintenanceTicket[];
  auditLog: AuditEntry[];

  // Gamification
  ecoScore: number;
  ghostsBustedCount: number;
  xpPoints: number;
  dailyStreakDays: number;
  unlockedBadges: string[];

  // Modals & Triggers
  emergencyModalOpen: boolean;
  emergencyFaultDetails?: string;

  // Actions
  login: (user: User, session: Session) => void;
  logout: () => void;
  setLocked: (locked: boolean) => void;
  switchRole: (role: Role) => void;
  
  setIslandState: (state: DynamicIslandState) => void;
  popIslandQueue: () => void;
  setIslandExpanded: (expanded: boolean) => void;

  setTheme: (themeId: string, custom?: Theme) => void;
  toggleSound: () => void;
  toggleCustomCursor: () => void;
  setSelectedSite: (site: 'Plant Alpha' | 'Plant Beta' | 'Tech Park Office') => void;
  toggleAutoPilot: () => void;
  setMaintenanceBanner: (active: boolean) => void;
  completeTour: () => void;

  updateSimulatorState: (data: Partial<AppState>) => void;
  setSimSpeed: (speed: 1 | 10 | 60) => void;
  setEcoMode: (enabled: boolean) => void;
  setChaosMode: (enabled: boolean) => void;
  bustGhost: (eventId: string) => void;

  addScenario: (scenario: Scenario) => void;
  approveScenario: (scenarioId: string, comment?: string) => void;
  rejectScenario: (scenarioId: string, comment?: string) => void;

  setConnectedDevice: (device: BleDevice | null) => void;
  updateZone: (zone: VisionZone) => void;

  addMaintenanceTicket: (ticket: MaintenanceTicket) => void;
  updateTicketStatus: (ticketId: string, status: 'open' | 'in_progress' | 'completed') => void;

  logAudit: (action: string, target: string, severity?: 'info' | 'warning' | 'critical', details?: Record<string, any>) => void;

  triggerEmergencyAlert: (details: string) => void;
  dismissEmergencyAlert: () => void;
}

const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud_1',
    userId: 'usr_admin',
    userName: 'Sarah Chen (Master Admin)',
    action: 'POLICY_UPDATE',
    target: 'Tariff Rate adjusted to ₹8.50/kWh',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    ip: '192.168.1.102',
    severity: 'info',
  },
  {
    id: 'aud_2',
    userId: 'usr_operator',
    userName: 'Marcus Vance',
    action: 'DEVICE_CONNECT',
    target: 'ESP32-Meter-01 paired via BLE to CNC-A',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: '192.168.1.115',
    severity: 'info',
  },
];

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt_1',
    equipmentId: 'eq_compressor_1',
    equipmentName: 'Air Compressor #1 (Atlas 75)',
    priority: 'high',
    title: 'Ultrasonic Pneumatic Leak Repair in Zone 3',
    description: 'Compressor cycling during off-shift indicates ~18% line pressure loss.',
    createdBy: 'Marcus Vance',
    assignedTo: 'Sarah Chen',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'in_progress',
  },
  {
    id: 'tkt_2',
    equipmentId: 'eq_molding_1',
    equipmentName: 'Injection Molding Press 02',
    priority: 'critical',
    title: 'Thermal Insulation Jacket Retrofit',
    description: 'Barrel thermal camera scans reveal 23.8% efficiency drift and heat escape.',
    createdBy: 'Elena Rostova',
    assignedTo: 'Marcus Vance',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'open',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentSession: null,
      isLocked: false,
      activeRole: 'admin',

      islandState: {
        type: 'idle',
        title: 'VoltGhost Active',
        message: 'Hunting energy ghosts live',
      },
      islandQueue: [],
      isIslandExpanded: false,

      currentThemeId: DEFAULT_THEME_ID,
      customTheme: null,
      soundEnabled: true,
      customCursorEnabled: true,
      selectedSite: 'Plant Alpha',
      autoPilotMode: false,
      maintenanceModeBanner: false,
      tourCompleted: false,

      equipment: simulator.getState().equipment,
      ghostEvents: simulator.getState().ghostEvents,
      totalWastedKwh: simulator.getState().totalWastedKwh,
      totalCostInr: simulator.getState().totalCostInr,
      totalCo2Kg: simulator.getState().totalCo2Kg,
      simSpeed: 1,
      ecoMode: false,
      chaosMode: false,
      tariffPerKwh: 8.5,
      emissionFactor: 0.71,
      carbonBudgetKg: 5000,

      scenarios: [],
      connectedDevice: null,
      activeZones: [],

      maintenanceTickets: INITIAL_TICKETS,
      auditLog: INITIAL_AUDIT_LOG,

      ecoScore: 78,
      ghostsBustedCount: 14,
      xpPoints: 1240,
      dailyStreakDays: 5,
      unlockedBadges: ['Night Owl Saver', 'Vision Hawk', 'First Ghost Busted'],

      emergencyModalOpen: false,

      login: (user, session) => {
        set({
          currentUser: user,
          currentSession: session,
          activeRole: user.role,
          isLocked: false,
        });
        get().logAudit('USER_LOGIN', `User ${user.email} authenticated successfully`, 'info');
      },

      logout: () => {
        const user = get().currentUser;
        if (user) {
          get().logAudit('USER_LOGOUT', `User ${user.email} logged out`, 'info');
        }
        authService.logout();
        set({
          currentUser: null,
          currentSession: null,
          isLocked: false,
        });
      },

      setLocked: (locked) => {
        set({ isLocked: locked });
        if (locked) sound.playClick(400);
      },

      switchRole: (role) => {
        set({ activeRole: role });
        get().logAudit('ROLE_SWITCH', `Switched active preview role to ${role.toUpperCase()}`, 'info');
      },

      setIslandState: (state) => {
        set({ islandState: state });
        if (state.type === 'alert') sound.playAlert(state.severity);
        if (state.type === 'achievement') sound.playGhostBusted();
      },

      popIslandQueue: () => {
        const queue = [...get().islandQueue];
        if (queue.length > 0) {
          const next = queue.shift();
          set({ islandState: next!, islandQueue: queue });
        } else {
          set({
            islandState: {
              type: 'idle',
              title: 'VoltGhost Monitoring',
              message: 'No active anomalies detected',
            },
          });
        }
      },

      setIslandExpanded: (expanded) => {
        set({ isIslandExpanded: expanded });
        sound.playIslandExpand();
      },

      setTheme: (themeId, custom) => {
        const theme = custom || getThemeById(themeId);
        applyTheme(theme);
        set({ currentThemeId: themeId, customTheme: custom || null });
        get().logAudit('THEME_CHANGE', `Theme updated to ${theme.name}`, 'info');
      },

      toggleSound: () => {
        const next = !get().soundEnabled;
        sound.enabled = next;
        set({ soundEnabled: next });
      },

      toggleCustomCursor: () => set((state) => ({ customCursorEnabled: !state.customCursorEnabled })),

      setSelectedSite: (site) => {
        set({ selectedSite: site });
        get().logAudit('SITE_CHANGE', `Switched active facility view to ${site}`, 'info');
      },

      toggleAutoPilot: () => {
        const next = !get().autoPilotMode;
        set({ autoPilotMode: next });
        get().logAudit('AUTOPILOT_TOGGLE', `Autonomous Optimizer set to ${next ? 'ACTIVE' : 'INACTIVE'}`, 'warning');
        if (next) {
          get().setIslandState({
            type: 'achievement',
            title: 'Auto-Pilot Engaged',
            message: 'Autonomous energy optimization is now managing idle states.',
          });
        }
      },

      setMaintenanceBanner: (active) => {
        set({ maintenanceModeBanner: active });
        get().logAudit('MAINTENANCE_MODE', `Global maintenance banner set to ${active}`, 'critical');
      },

      completeTour: () => set({ tourCompleted: true }),

      updateSimulatorState: (data) => set(data),

      setSimSpeed: (speed) => {
        simulator.setSpeed(speed);
        set({ simSpeed: speed });
        get().setIslandState({
          type: 'timer',
          title: `Simulation Speed ${speed}x`,
          message: speed === 1 ? 'Real-time 1s ticks' : `${speed}x accelerated time-travel`,
        });
      },

      setEcoMode: (enabled) => {
        simulator.setEcoMode(enabled);
        set({ ecoMode: enabled });
        get().logAudit('ECO_MODE', `Emergency Eco Mode ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}`, 'warning');
      },

      setChaosMode: (enabled) => {
        simulator.setChaosMode(enabled);
        set({ chaosMode: enabled });
        get().logAudit('CHAOS_MODE', `Chaos Fault Injection ${enabled ? 'ENGAGED' : 'STOPPED'}`, 'critical');
      },

      bustGhost: (eventId) => {
        simulator.bustGhost(eventId);
        const event = get().ghostEvents.find((e) => e.id === eventId);
        if (event) {
          event.resolved = true;
          const pointsEarned = 150;
          const savingsInr = Math.round(event.costInr);
          set((state) => ({
            ghostsBustedCount: state.ghostsBustedCount + 1,
            xpPoints: state.xpPoints + pointsEarned,
            ecoScore: Math.min(100, state.ecoScore + 3),
          }));
          sound.playGhostBusted();
          get().setIslandState({
            type: 'achievement',
            title: 'Ghost Busted!',
            message: `+${pointsEarned} XP • Saved ₹${savingsInr} on ${event.equipmentName}`,
          });
          get().logAudit('GHOST_BUSTED', `Resolved ghost anomaly on ${event.equipmentName}`, 'info');
        }
      },

      addScenario: (scenario) => {
        set((state) => ({ scenarios: [scenario, ...state.scenarios] }));
        get().logAudit('SCENARIO_PROPOSED', `Scenario "${scenario.name}" submitted by ${scenario.proposedBy}`, 'info');
      },

      approveScenario: (scenarioId, comment) => {
        const scenario = get().scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          scenario.status = 'approved';
          scenario.approvedBy = get().currentUser?.name || 'Sarah Chen (Admin)';
          scenario.approvalComment = comment;
          scenario.approvedAt = new Date().toISOString();

          // Apply savings to simulator
          simulator.applyScenarioReduction(scenario.resultAfter.dailyKwhBefore - scenario.resultAfter.dailyKwhAfter);

          set((state) => ({
            scenarios: [...state.scenarios],
            ecoScore: Math.min(100, state.ecoScore + 5),
            xpPoints: state.xpPoints + 300,
          }));

          sound.playConfetti();
          get().setIslandState({
            type: 'scenario_applied',
            title: `Scenario Approved: ${scenario.name}`,
            message: `Annual savings: ₹${(scenario.resultAfter.annualSavingsInr).toLocaleString('en-IN')}`,
          });
          get().logAudit('SCENARIO_APPROVED', `Admin approved scenario "${scenario.name}"`, 'warning');
        }
      },

      rejectScenario: (scenarioId, comment) => {
        const scenario = get().scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          scenario.status = 'rejected';
          scenario.approvalComment = comment;
          set((state) => ({ scenarios: [...state.scenarios] }));
          get().logAudit('SCENARIO_REJECTED', `Admin rejected scenario "${scenario.name}"`, 'warning');
        }
      },

      setConnectedDevice: (device) => {
        set({ connectedDevice: device });
        if (device && device.status === 'connected') {
          get().setIslandState({
            type: 'bluetooth',
            title: `Connected: ${device.name}`,
            message: `Live telemetry feeding into Twin (${device.rssi} dBm)`,
          });
          get().logAudit('DEVICE_PAIRED', `Device ${device.name} mapped to ${device.mappedEquipmentId}`, 'info');
        }
      },

      updateZone: (zone) => {
        set((state) => ({
          activeZones: state.activeZones.map((z) => (z.id === zone.id ? zone : z)),
        }));
      },

      addMaintenanceTicket: (ticket) => {
        set((state) => ({ maintenanceTickets: [ticket, ...state.maintenanceTickets] }));
        get().logAudit('TICKET_CREATED', `Ticket "${ticket.title}" created for ${ticket.equipmentName}`, 'info');
      },

      updateTicketStatus: (ticketId, status) => {
        set((state) => ({
          maintenanceTickets: state.maintenanceTickets.map((t) =>
            t.id === ticketId ? { ...t, status } : t
          ),
        }));
        get().logAudit('TICKET_UPDATED', `Ticket ${ticketId} status changed to ${status}`, 'info');
      },

      logAudit: (action, target, severity = 'info', details) => {
        const user = get().currentUser;
        const entry: AuditEntry = {
          id: 'aud_' + Math.random().toString(36).substring(2, 9),
          userId: user?.id || 'sys_daemon',
          userName: user?.name || 'System / AutoPilot',
          action,
          target,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.102',
          severity,
          details,
        };
        set((state) => ({ auditLog: [entry, ...state.auditLog.slice(0, 99)] }));
      },

      triggerEmergencyAlert: (details) => {
        set({ emergencyModalOpen: true, emergencyFaultDetails: details });
        sound.playSiren(3);
      },

      dismissEmergencyAlert: () => {
        set({ emergencyModalOpen: false, emergencyFaultDetails: undefined });
      },
    }),
    {
      name: 'voltghost_app_storage_v1',
      partialize: (state) => ({
        currentThemeId: state.currentThemeId,
        customTheme: state.customTheme,
        soundEnabled: state.soundEnabled,
        customCursorEnabled: state.customCursorEnabled,
        selectedSite: state.selectedSite,
        tourCompleted: state.tourCompleted,
        ecoScore: state.ecoScore,
        ghostsBustedCount: state.ghostsBustedCount,
        xpPoints: state.xpPoints,
        unlockedBadges: state.unlockedBadges,
      }),
    }
  )
);
