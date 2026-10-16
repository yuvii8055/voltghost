export type Role = 'viewer' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  twoFAEnabled: boolean;
  twoFASecret?: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  themeId: string;
  device?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  device: string;
  ip?: string;
  isCurrent?: boolean;
}

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  severity: AuditSeverity;
  details?: Record<string, any>;
}

export type EquipmentZone = 'Zone 1 - Machining' | 'Zone 2 - Assembly' | 'Zone 3 - Thermal & Chiller' | 'Zone 4 - Cleanroom & IT' | 'Zone 5 - Logistics';

export type DataSourceKind = 'simulator' | 'ble' | 'serial' | 'ws' | 'csv' | 'virtual';

export interface IdealProfile {
  standbyKw: number;
  nominalKw: number;
  peakKw: number;
  optimalTempC: number;
  maxVibrationMmS: number;
  allowedIdleMin: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'compressor' | 'cnc' | 'chiller' | 'hvac' | 'furnace' | 'server' | 'molding' | 'conveyor' | 'robot' | 'lighting' | 'solar' | 'battery';
  zone: EquipmentZone;
  ratedKw: number;
  position3D: [number, number, number]; // [x, y, z] in 3D scene
  rotation3D?: [number, number, number];
  idealProfile: IdealProfile;
  source: DataSourceKind;
  state: 'running' | 'idle' | 'standby' | 'fault' | 'off';
  currentKw: number;
  idealKw: number;
  healthScore: number; // 0 - 100
  tempC: number;
  amps: number;
  voltage: number;
  vibrationMmS: number;
  efficiencyDriftPct: number; // e.g. +18% over nominal
  remainingUsefulLifeDays: number;
  lastMaintained: string;
  iconName: string;
}

export interface Reading {
  equipmentId: string;
  timestamp: string;
  kw: number;
  idealKw: number;
  amps: number;
  voltage: number;
  tempC: number;
  vibration: number;
  state: 'running' | 'idle' | 'standby' | 'fault' | 'off';
}

export type DetectionSource = 'sensor' | 'vision' | 'fusion';
export type GhostSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GhostEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: string;
  reason: string;
  startedAt: string;
  durationMin: number;
  wastedKwh: number;
  costInr: number;
  co2Kg: number;
  severity: GhostSeverity;
  detectedBy: DetectionSource;
  resolved: boolean;
  acknowledgedBy?: string;
  snapshotUrl?: string;
}

export interface Strategy {
  id: string;
  title: string;
  equipmentId?: string;
  description: string;
  savingsKwhPerDay: number;
  savingsInrPerYear: number;
  co2SavedKgPerYear: number;
  effort: 'Low' | 'Medium' | 'High';
  paybackMonths: number;
  confidenceScore: number; // 0 - 100
  steps: string[];
  applied?: boolean;
}

export interface ScenarioParams {
  shiftLoadsOffPeakPct: number; // 0 - 50%
  acSetpointDeltaC: number; // -4 to +4
  autoShutdownIdleDelayMin: number; // 5 - 60 min
  vfdRetrofit: boolean;
  ledRetrofit: boolean;
  addSolarKwp: number; // 0 - 200 kWp
  addBatteryKwh: number; // 0 - 300 kWh
  occupancyLighting: boolean;
}

export interface ScenarioResult {
  dailyKwhBefore: number;
  dailyKwhAfter: number;
  dailyCostInrBefore: number;
  dailyCostInrAfter: number;
  dailyCo2KgBefore: number;
  dailyCo2KgAfter: number;
  peakKwBefore: number;
  peakKwAfter: number;
  annualSavingsInr: number;
  annualCo2SavedKg: number;
  paybackYears: number;
  roiPct: number;
  treesEquivalent: number;
  carKmEquivalent: number;
  monteCarloLowKwh: number;
  monteCarloHighKwh: number;
}

export interface Scenario {
  id: string;
  name: string;
  proposedBy: string;
  proposedRole: Role;
  createdAt: string;
  params: ScenarioParams;
  resultBefore: ScenarioResult;
  resultAfter: ScenarioResult;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalComment?: string;
  approvedAt?: string;
}

export interface BleDevice {
  id: string;
  kind: DataSourceKind;
  name: string;
  rssi: number;
  battery: number;
  mappedEquipmentId: string;
  status: 'connected' | 'connecting' | 'disconnected';
  lastSeen: string;
  sampleRateHz: number;
}

export interface VisionZone {
  id: string;
  name: string;
  mappedEquipmentId: string;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  personCount: number;
  lastPersonDetectedAt: string;
  brightnessLevel: number; // 0-100
  color: string;
}

export interface VisionDetection {
  label: 'person' | 'operator' | 'equipment' | 'door_open';
  confidence: number;
  box: [number, number, number, number]; // [x, y, w, h] normalized 0-1
}

export interface ThemeTokens {
  accent: string;
  accentHover: string;
  accentMuted: string;
  secondary: string;
  bgDark: string;
  bgCard: string;
  bgSurface: string;
  textPrimary: string;
  textMuted: string;
  border: string;
  gapGlow: string;
  ghostIdeal: string;
  twinGround: string;
  twinLight: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'dark' | 'light' | 'auto';
  tokens: ThemeTokens;
  custom?: boolean;
  backgroundStyle: 'aurora' | 'gradient' | 'grid' | 'grain' | 'solid';
  cornerRadius: 'sharp' | 'normal' | 'pill';
  glassBlur: 'none' | 'subtle' | 'heavy';
  fontFamily: 'Space Grotesk' | 'Inter' | 'JetBrains Mono';
  density: 'compact' | 'comfortable';
}

export interface MaintenanceTicket {
  id: string;
  equipmentId: string;
  equipmentName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'completed';
}

export interface DynamicIslandState {
  type: 'idle' | 'alert' | 'ai_streaming' | 'bluetooth' | 'camera' | 'voice' | 'achievement' | 'scenario_applied' | 'timer';
  title?: string;
  message?: string;
  severity?: GhostSeverity;
  data?: any;
  durationMs?: number;
}

export interface SystemHealth {
  sensorUptimePct: number;
  cvFps: number;
  aiLatencyMs: number;
  dataFreshnessSec: number;
  errorRatePct: number;
}
