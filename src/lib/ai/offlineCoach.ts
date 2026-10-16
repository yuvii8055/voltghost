import { Strategy, Equipment, GhostEvent } from '../../types';

export type PersonaMode = 'cfo' | 'eco' | 'engineer' | 'eli10';
export type Language = 'en' | 'hi' | 'kn';

export interface CoachContext {
  equipment: Equipment[];
  ghostEvents: GhostEvent[];
  totalWastedKwh: number;
  totalCostInr: number;
  totalCo2Kg: number;
  tariffPerKwh: number;
  emissionFactor: number;
  persona: PersonaMode;
  language: Language;
}

export const SEEDED_STRATEGIES: Strategy[] = [
  {
    id: 'strat_1',
    title: 'Automate Idle Interlock on 5-Axis CNC Milling Center A',
    equipmentId: 'eq_cnc_1',
    description: 'Integrate Vision Lab occupancy feed with CNC PLC to ramp down spindle to 2.2 kW standby whenever operator is absent for > 5 min.',
    savingsKwhPerDay: 42.5,
    savingsInrPerYear: 131800,
    co2SavedKgPerYear: 11018,
    effort: 'Low',
    paybackMonths: 1.5,
    confidenceScore: 96,
    steps: [
      'Enable MQTT trigger from VoltGhost Vision Lab to Machining PLC',
      'Configure 5-minute inactivity threshold in Fanuc NC controller',
      'Add safety beacon test to verify automated standby cycle',
    ],
  },
  {
    id: 'strat_2',
    title: 'Reset Chilled Water Supply Temperature from 8.2°C to 12.0°C',
    equipmentId: 'eq_chiller_1',
    description: 'Central Water Chiller is overcooling the distribution loop by 3.8°C beyond thermal requirements, generating 21% parasitic lift work.',
    savingsKwhPerDay: 76.0,
    savingsInrPerYear: 235790,
    co2SavedKgPerYear: 19706,
    effort: 'Low',
    paybackMonths: 0.2,
    confidenceScore: 94,
    steps: [
      'Update BAS setpoint on Carrier 120 chiller to 12.0°C supply / 17.0°C return',
      'Monitor delta-T across air handling unit coils for 48 hours',
      'Enable automated outdoor-reset curve on supervisory controller',
    ],
  },
  {
    id: 'strat_3',
    title: 'Install Thermal Insulation Blankets on Injection Molding Press 02',
    equipmentId: 'eq_molding_1',
    description: 'Cylinder heating bands radiate excess thermal energy (+23.8% efficiency drift). Removable ceramic blankets retain process heat.',
    savingsKwhPerDay: 58.2,
    savingsInrPerYear: 180560,
    co2SavedKgPerYear: 15087,
    effort: 'Medium',
    paybackMonths: 3.2,
    confidenceScore: 91,
    steps: [
      'Procure high-temp modular ceramic-fiber insulating jackets for barrel zones 1-4',
      'Schedule 2-hour scheduled maintenance window for mechanical fitting',
      'Measure surface skin temperature drop (target < 50°C)',
    ],
  },
  {
    id: 'strat_4',
    title: 'Pneumatic System Ultrasonic Leak Audit on Compressor Atlas 75',
    equipmentId: 'eq_compressor_1',
    description: 'Compressor cycles 18% off-shift due to unaddressed quick-disconnect leaks across machining headers.',
    savingsKwhPerDay: 48.0,
    savingsInrPerYear: 148920,
    co2SavedKgPerYear: 12441,
    effort: 'Low',
    paybackMonths: 0.8,
    confidenceScore: 98,
    steps: [
      'Deploy handheld ultrasonic detector along Zone 3 distribution header',
      'Tag and repair 12 identified pneumatic fitting leaks',
      'Lower receiver tank setpoint from 7.5 bar to 6.8 bar',
    ],
  },
  {
    id: 'strat_5',
    title: 'Occupancy-Triggered Dimming in High Bay Logistics Grid (Zone 5)',
    equipmentId: 'eq_lighting_1',
    description: 'Warehouse lights burn at 100% (22.4 kW) during 6-hour unstaffed night intervals.',
    savingsKwhPerDay: 36.0,
    savingsInrPerYear: 111690,
    co2SavedKgPerYear: 9331,
    effort: 'Low',
    paybackMonths: 1.1,
    confidenceScore: 99,
    steps: [
      'Connect Zone 5 DALI controllers to VoltGhost automated schedule',
      'Set unoccupied fallback luminance to 10% safety glow',
      'Verify microwave sensor override responsiveness',
    ],
  },
];

export function generateOfflineResponse(
  userQuery: string,
  context: CoachContext
): { text: string; strategies?: Strategy[] } {
  const query = userQuery.toLowerCase();
  const topWasteEq = [...context.equipment].sort(
    (a, b) => b.currentKw - b.idealKw - (a.currentKw - a.idealKw)
  )[0];

  // Multilingual Greetings
  const prefix =
    context.language === 'hi'
      ? 'नमस्ते! मैं आपका कार्बन कोच (Carbon Coach) हूँ।'
      : context.language === 'kn'
      ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಾರ್ಬನ್ ಕೋಚ್ (Carbon Coach).'
      : 'Hello! I am your Carbon Coach.';

  // Check Persona formatting
  if (query.includes('plan') || query.includes('action') || query.includes('fix') || query.includes('strategy')) {
    let summary = '';
    if (context.persona === 'cfo') {
      summary = `${prefix} Looking at financial exposure, your current Ghost Gap represents **₹${Math.round(
        context.totalCostInr * 30
      ).toLocaleString('en-IN')}/month** in avoidable operating expense. Here is your prioritized ROI action plan:`;
    } else if (context.persona === 'eco') {
      summary = `${prefix} Focusing on climate impact, unoptimized equipment is releasing **${Math.round(
        context.totalCo2Kg * 30
      ).toLocaleString('en-IN')} kg of Scope 2 CO2/month** into the atmosphere. Here are high-impact decarbonization steps:`;
    } else if (context.persona === 'eli10') {
      summary = `${prefix} Think of your machines like lights left on when nobody is home! Right now, some machines are eating electricity while doing nothing. Here is how we catch and fix them:`;
    } else {
      summary = `${prefix} Engineering telemetry analysis indicates a facility-wide Ghost Gap of **${(
        context.equipment.reduce((sum, e) => sum + Math.max(0, e.currentKw - e.idealKw), 0)
      ).toFixed(1)} kW**. Ranked mitigation strategies:`;
    }

    return {
      text: summary,
      strategies: SEEDED_STRATEGIES,
    };
  }

  if (query.includes('waste') || query.includes('most') || query.includes('worst') || query.includes('ghost')) {
    const gap = (topWasteEq.currentKw - topWasteEq.idealKw).toFixed(1);
    const costPerHour = (parseFloat(gap) * context.tariffPerKwh).toFixed(2);
    return {
      text: `${prefix} The highest energy ghost is **${topWasteEq.name}** in ${topWasteEq.zone}.
- **Live Consumption:** ${topWasteEq.currentKw} kW
- **Ideal Ghost Twin:** ${topWasteEq.idealKw} kW
- **Live Ghost Gap:** ${gap} kW (~₹${costPerHour}/hour wasted)
- **Primary Root Cause:** ${
        topWasteEq.id === 'eq_cnc_1'
          ? 'Spindle idle with operator absent (detected by Computer Vision fusion).'
          : topWasteEq.id === 'eq_chiller_1'
          ? 'Chilled water loop overcooling by 3.8°C.'
          : 'High parasitic losses and thermal efficiency drift.'
      }

Would you like me to simulate shutting down this ghost or apply the automated interlock?`,
    };
  }

  // Generic intelligent reply
  return {
    text: `${prefix} Based on telemetry from 12 connected machines across 5 zones:
- **Total Energy Wasted Today:** ${context.totalWastedKwh.toFixed(1)} kWh
- **Financial Loss:** ₹${context.totalCostInr.toFixed(0)} (Tariff @ ₹${context.tariffPerKwh}/kWh)
- **Carbon Footprint:** ${context.totalCo2Kg.toFixed(1)} kg CO₂ (Factor: ${context.emissionFactor} kg/kWh)
- **Active Anomalies:** ${context.ghostEvents.filter((g) => !g.resolved).length} ghosts currently active.

Try asking: *"Which machine is wasting the most?"*, *"Generate Action Plan"*, or *"Explain the CNC idle ghost"*!`,
  };
}
