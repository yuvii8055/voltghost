import { ScenarioParams, ScenarioResult } from '../../types';

export function runWhatIfCalculation(params: ScenarioParams): ScenarioResult {
  // Baseline facility stats (24-hour baseline)
  const dailyKwhBefore = 12480;
  const tariffInrPerKwh = 8.5;
  const emissionFactor = 0.71;
  const dailyCostInrBefore = dailyKwhBefore * tariffInrPerKwh;
  const dailyCo2KgBefore = dailyKwhBefore * emissionFactor;
  const peakKwBefore = 742;

  // Calculate savings from parameters
  let savingsKwh = 0;
  let capitalExpenditureInr = 0;

  // 1. Shift loads off-peak (reduces peak kW and weighted cost)
  const peakShiftKwh = dailyKwhBefore * (params.shiftLoadsOffPeakPct / 100) * 0.12;
  savingsKwh += peakShiftKwh * 0.15; // secondary efficiency gain

  // 2. AC setpoint delta (+1 deg C ~ 6% HVAC savings, -1 deg C increases)
  const hvacBaseKwh = 3200;
  const hvacSavings = hvacBaseKwh * (params.acSetpointDeltaC * 0.06);
  savingsKwh += hvacSavings;

  // 3. Auto-shutdown idle equipment
  if (params.autoShutdownIdleDelayMin < 30) {
    const idleSavingsPct = (30 - params.autoShutdownIdleDelayMin) / 100;
    savingsKwh += dailyKwhBefore * idleSavingsPct * 0.35;
  }

  // 4. VFD retrofit on motors
  if (params.vfdRetrofit) {
    savingsKwh += 1450; // motors running at part-load
    capitalExpenditureInr += 380000;
  }

  // 5. LED retrofit
  if (params.ledRetrofit) {
    savingsKwh += 320;
    capitalExpenditureInr += 95000;
  }

  // 6. Rooftop Solar kWp (daily generation ~ 4.2 peak sun hours)
  const solarGenKwh = params.addSolarKwp * 4.2;
  savingsKwh += solarGenKwh;
  capitalExpenditureInr += params.addSolarKwp * 48000;

  // 7. Battery Storage kWh (time-shift value + peak clipping)
  capitalExpenditureInr += params.addBatteryKwh * 28000;

  // 8. Occupancy-based lighting
  if (params.occupancyLighting) {
    savingsKwh += 210;
    capitalExpenditureInr += 45000;
  }

  // Bound savings sensibly
  savingsKwh = Math.max(0, Math.min(savingsKwh, dailyKwhBefore * 0.75));

  const dailyKwhAfter = dailyKwhBefore - savingsKwh;
  const dailyCostInrAfter = dailyKwhAfter * tariffInrPerKwh;
  const dailyCo2KgAfter = dailyKwhAfter * emissionFactor;
  const peakKwAfter = Math.max(200, peakKwBefore - (params.shiftLoadsOffPeakPct * 2.8) - (params.addBatteryKwh * 0.35));

  const annualSavingsInr = (dailyCostInrBefore - dailyCostInrAfter) * 365;
  const annualCo2SavedKg = (dailyCo2KgBefore - dailyCo2KgAfter) * 365;

  const paybackYears = capitalExpenditureInr > 0 ? parseFloat((capitalExpenditureInr / Math.max(1, annualSavingsInr)).toFixed(2)) : 0.2;
  const roiPct = capitalExpenditureInr > 0 ? Math.round((annualSavingsInr / capitalExpenditureInr) * 100) : 340;

  // Equivalencies (1 tree absorbs ~22kg CO2/year; 1 car emits ~0.19 kg CO2/km)
  const treesEquivalent = Math.round(annualCo2SavedKg / 22);
  const carKmEquivalent = Math.round(annualCo2SavedKg / 0.19);

  // Monte Carlo simulation for 10th and 90th percentile confidence bounds
  const monteCarloTrials: number[] = [];
  for (let i = 0; i < 300; i++) {
    const weatherFactor = 1 + (Math.random() - 0.5) * 0.18;
    const plantShiftNoise = 1 + (Math.random() - 0.5) * 0.12;
    monteCarloTrials.push(savingsKwh * weatherFactor * plantShiftNoise);
  }
  monteCarloTrials.sort((a, b) => a - b);
  const monteCarloLowKwh = Math.round(monteCarloTrials[30]); // 10th percentile
  const monteCarloHighKwh = Math.round(monteCarloTrials[270]); // 90th percentile

  return {
    dailyKwhBefore: Math.round(dailyKwhBefore),
    dailyKwhAfter: Math.round(dailyKwhAfter),
    dailyCostInrBefore: Math.round(dailyCostInrBefore),
    dailyCostInrAfter: Math.round(dailyCostInrAfter),
    dailyCo2KgBefore: Math.round(dailyCo2KgBefore),
    dailyCo2KgAfter: Math.round(dailyCo2KgAfter),
    peakKwBefore: Math.round(peakKwBefore),
    peakKwAfter: Math.round(peakKwAfter),
    annualSavingsInr: Math.round(annualSavingsInr),
    annualCo2SavedKg: Math.round(annualCo2SavedKg),
    paybackYears,
    roiPct,
    treesEquivalent,
    carKmEquivalent,
    monteCarloLowKwh,
    monteCarloHighKwh,
  };
}
