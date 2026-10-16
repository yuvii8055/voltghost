import { Equipment, VisionZone, GhostEvent } from '../../types';

export interface FusionResult {
  hasAnomaly: boolean;
  ruleTriggered?: string;
  confidence: number;
  explanation: string;
  wastedKwEstimate: number;
  recommendedAction: string;
}

export function evaluateFusion(
  equipmentList: Equipment[],
  zones: VisionZone[]
): FusionResult[] {
  const results: FusionResult[] = [];

  equipmentList.forEach((eq) => {
    // Find matching zone if any
    const zone = zones.find((z) => z.mappedEquipmentId === eq.id);
    if (!zone) return;

    // RULE 1: Equipment ON + No Person in Zone
    if (eq.currentKw > eq.idealProfile.standbyKw * 2 && zone.personCount === 0) {
      const minutesAbsent = Math.round(
        (Date.now() - new Date(zone.lastPersonDetectedAt).getTime()) / 60000
      );
      if (minutesAbsent >= 5) {
        results.push({
          hasAnomaly: true,
          ruleTriggered: 'UNATTENDED_OPERATION_FUSION',
          confidence: 0.96,
          explanation: `Sensor reports ${eq.name} drawing ${eq.currentKw} kW (active load), while Vision confirms 0 occupants in ${zone.name} for ${minutesAbsent} minutes.`,
          wastedKwEstimate: eq.currentKw - eq.idealProfile.standbyKw,
          recommendedAction: `Trigger auto-standby or notify operator to shut down ${eq.name}.`,
        });
      }
    }

    // RULE 2: Lighting Zone at High Luminance with 0 Occupants
    if (eq.type === 'lighting' && zone.brightnessLevel > 80 && zone.personCount === 0) {
      results.push({
        hasAnomaly: true,
        ruleTriggered: 'VACANT_LIGHTING_FUSION',
        confidence: 0.98,
        explanation: `Vision confirms 0 occupants in ${zone.name} with brightness at ${zone.brightnessLevel}%, while sensor registers ${eq.currentKw} kW draw.`,
        wastedKwEstimate: eq.currentKw - 0.2,
        recommendedAction: 'Engage occupancy-linked dimming schedule.',
      });
    }

    // RULE 3: HVAC overcooling in empty cleanroom
    if (eq.type === 'hvac' && zone.personCount === 0 && eq.currentKw > eq.idealProfile.nominalKw * 0.9) {
      results.push({
        hasAnomaly: true,
        ruleTriggered: 'HVAC_EMPTY_ZONE_FUSION',
        confidence: 0.89,
        explanation: `Cleanroom AHU operating at high static pressure (${eq.currentKw} kW) despite zero thermal occupant load detected.`,
        wastedKwEstimate: eq.currentKw - eq.idealProfile.nominalKw * 0.6,
        recommendedAction: 'Adjust setpoint by +2.5°C during unoccupied windows.',
      });
    }
  });

  return results;
}
