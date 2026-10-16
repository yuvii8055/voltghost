import { Equipment, GhostEvent, Reading, GhostSeverity } from '../../types';
import { INITIAL_EQUIPMENT } from './equipmentSeed';

export interface SimulatorState {
  equipment: Equipment[];
  ghostEvents: GhostEvent[];
  historicalReadings: Record<string, Reading[]>;
  totalWastedKwh: number;
  totalCostInr: number;
  totalCo2Kg: number;
  speed: 1 | 10 | 60;
  ecoMode: boolean;
  chaosMode: boolean;
  tariffPerKwh: number; // default INR 8.5
  emissionFactor: number; // default 0.71 kg CO2/kWh
}

const INITIAL_GHOST_EVENTS: GhostEvent[] = [
  {
    id: 'gh_1',
    equipmentId: 'eq_cnc_1',
    equipmentName: '5-Axis CNC Milling Center A',
    type: 'Unattended Operation',
    reason: 'Spindle active while Operator absent from zone for > 12 min (confirmed by Vision Lab).',
    startedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    durationMin: 14,
    wastedKwh: 8.4,
    costInr: 71.4,
    co2Kg: 5.96,
    severity: 'high',
    detectedBy: 'fusion',
    resolved: false,
  },
  {
    id: 'gh_2',
    equipmentId: 'eq_lighting_1',
    equipmentName: 'High Bay Facility Lighting Grid',
    type: 'Empty Zone Lighting',
    reason: 'Zone 5 Logistics at 100% luminance with zero personnel detected for 48 minutes.',
    startedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    durationMin: 48,
    wastedKwh: 17.8,
    costInr: 151.3,
    co2Kg: 12.63,
    severity: 'medium',
    detectedBy: 'fusion',
    resolved: false,
  },
  {
    id: 'gh_3',
    equipmentId: 'eq_compressor_1',
    equipmentName: 'Air Compressor #1 (Atlas 75)',
    type: 'Pneumatic Leak & Off-Shift Idle',
    reason: 'Constant short-cycling during low plant demand indicates a ~18% line pressure leak.',
    startedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    durationMin: 95,
    wastedKwh: 36.7,
    costInr: 311.9,
    co2Kg: 26.05,
    severity: 'critical',
    detectedBy: 'sensor',
    resolved: false,
  },
  {
    id: 'gh_4',
    equipmentId: 'eq_chiller_1',
    equipmentName: 'Central Water Chiller',
    type: 'Thermal Setpoint Drift',
    reason: 'Chilled water supply is 8.2°C versus ideal 12.0°C; overcooling by 3.8°C.',
    startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    durationMin: 120,
    wastedKwh: 52.4,
    costInr: 445.4,
    co2Kg: 37.20,
    severity: 'high',
    detectedBy: 'sensor',
    resolved: false,
  },
  {
    id: 'gh_5',
    equipmentId: 'eq_conveyor_1',
    equipmentName: 'High-Speed Assembly Conveyor',
    type: 'Empty Belt Idle',
    reason: 'Conveyor drive motor drawing 14.8 kW while optical sensors report 0 parts.',
    startedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    durationMin: 32,
    wastedKwh: 7.3,
    costInr: 62.05,
    co2Kg: 5.18,
    severity: 'medium',
    detectedBy: 'fusion',
    resolved: false,
  },
  {
    id: 'gh_6',
    equipmentId: 'eq_molding_1',
    equipmentName: 'Injection Molding Press 02',
    type: 'Degraded Thermal Insulation',
    reason: 'Heater band duty cycle increased 23.8% due to thermal jacket degradation.',
    startedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    durationMin: 240,
    wastedKwh: 64.8,
    costInr: 550.8,
    co2Kg: 46.0,
    severity: 'critical',
    detectedBy: 'sensor',
    resolved: false,
  },
];

export class SimulatorEngine {
  private state: SimulatorState;
  private listeners: ((state: SimulatorState) => void)[] = [];
  private intervalTimer: any = null;

  constructor() {
    this.state = {
      equipment: JSON.parse(JSON.stringify(INITIAL_EQUIPMENT)),
      ghostEvents: [...INITIAL_GHOST_EVENTS],
      historicalReadings: {},
      totalWastedKwh: 187.4,
      totalCostInr: 1592.9,
      totalCo2Kg: 133.05,
      speed: 1,
      ecoMode: false,
      chaosMode: false,
      tariffPerKwh: 8.5,
      emissionFactor: 0.71,
    };

    // Pre-populate 24h history for realistic charts
    this.initHistory();
  }

  private initHistory() {
    const now = Date.now();
    this.state.equipment.forEach((eq) => {
      const readings: Reading[] = [];
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 3600 * 1000).toISOString();
        const baseIdeal = eq.idealProfile.nominalKw;
        const noise = (Math.sin(i * 0.5) * 0.15 + (Math.random() - 0.5) * 0.1) * baseIdeal;
        const ideal = Math.max(eq.idealProfile.standbyKw, baseIdeal + noise);
        const wasteFactor = eq.currentKw > eq.idealKw ? 1.25 : 1.02;
        const kw = ideal * wasteFactor + (Math.random() - 0.5) * 3;

        readings.push({
          equipmentId: eq.id,
          timestamp: time,
          kw: Math.max(0.5, parseFloat(kw.toFixed(1))),
          idealKw: Math.max(0.2, parseFloat(ideal.toFixed(1))),
          amps: Math.round((kw * 1000) / (415 * 1.732 * 0.9)),
          voltage: 415 + Math.round((Math.random() - 0.5) * 6),
          tempC: Math.round(eq.tempC + (Math.random() - 0.5) * 4),
          vibration: parseFloat((eq.vibrationMmS + (Math.random() - 0.5) * 0.2).toFixed(2)),
          state: eq.state,
        });
      }
      this.state.historicalReadings[eq.id] = readings;
    });
  }

  start() {
    if (this.intervalTimer) return;
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 1500);
  }

  stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  setSpeed(speed: 1 | 10 | 60) {
    this.state.speed = speed;
    this.notify();
  }

  setEcoMode(enabled: boolean) {
    this.state.ecoMode = enabled;
    if (enabled) {
      // Immediately drop non-essential idle loads
      this.state.equipment.forEach((eq) => {
        if (eq.currentKw > eq.idealKw) {
          eq.currentKw = Math.max(eq.idealKw, eq.currentKw * 0.82);
        }
      });
    }
    this.notify();
  }

  setChaosMode(enabled: boolean) {
    this.state.chaosMode = enabled;
    this.notify();
  }

  bustGhost(eventId: string) {
    const event = this.state.ghostEvents.find((e) => e.id === eventId);
    if (event) {
      event.resolved = true;
      // Drop the corresponding equipment power down toward ideal
      const eq = this.state.equipment.find((m) => m.id === event.equipmentId);
      if (eq) {
        eq.currentKw = Math.max(eq.idealKw, eq.idealKw * 1.05);
        if (eq.id === 'eq_lighting_1') eq.currentKw = 0.5;
        if (eq.id === 'eq_conveyor_1') eq.state = 'standby';
      }
      this.notify();
    }
  }

  applyScenarioReduction(savingsKwhDaily: number) {
    // Distribute savings across equipment
    const fraction = savingsKwhDaily / 450;
    this.state.equipment.forEach((eq) => {
      const gap = eq.currentKw - eq.idealKw;
      if (gap > 0) {
        eq.currentKw = Math.max(eq.idealKw, eq.currentKw - gap * Math.min(0.7, fraction));
      }
    });
    this.notify();
  }

  overrideEquipmentFromExternal(equipmentId: string, kw: number, amps?: number, tempC?: number) {
    const eq = this.state.equipment.find((m) => m.id === equipmentId);
    if (eq) {
      eq.currentKw = kw;
      if (amps !== undefined) eq.amps = amps;
      if (tempC !== undefined) eq.tempC = tempC;
      eq.source = 'ble';
      this.notify();
    }
  }

  private tick() {
    const timeMultiplier = this.state.speed;
    const intervalHours = (1.5 * timeMultiplier) / 3600; // time passed in simulated hours
    let stepWasteKwh = 0;

    this.state.equipment = this.state.equipment.map((eq) => {
      let deltaNoise = (Math.random() - 0.5) * 0.8;
      if (this.state.chaosMode && Math.random() < 0.2) {
        deltaNoise += (Math.random() - 0.3) * 15; // Chaos spike
      }

      let current = Math.max(0.1, eq.currentKw + deltaNoise);
      let ideal = eq.idealKw;

      // In Eco mode, reduce waste
      if (this.state.ecoMode) {
        current = Math.min(current, eq.idealKw * 1.08);
      }

      const gap = Math.max(0, current - ideal);
      stepWasteKwh += gap * intervalHours;

      return {
        ...eq,
        currentKw: parseFloat(current.toFixed(2)),
        idealKw: parseFloat(ideal.toFixed(2)),
        tempC: parseFloat((eq.tempC + (Math.random() - 0.5) * 0.3).toFixed(1)),
      };
    });

    this.state.totalWastedKwh += stepWasteKwh;
    this.state.totalCostInr += stepWasteKwh * this.state.tariffPerKwh;
    this.state.totalCo2Kg += stepWasteKwh * this.state.emissionFactor;

    this.notify();
  }

  getState(): SimulatorState {
    return this.state;
  }

  subscribe(listener: (state: SimulatorState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const simulator = new SimulatorEngine();
