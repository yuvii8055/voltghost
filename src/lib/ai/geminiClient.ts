import { CoachContext, generateOfflineResponse } from './offlineCoach';
import { Strategy } from '../../types';

export async function askCarbonCoach(
  userQuery: string,
  context: CoachContext,
  onStreamChunk?: (chunk: string) => void
): Promise<{ text: string; strategies?: Strategy[] }> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    // Graceful offline fallback with simulated streaming typing
    const offlineResult = generateOfflineResponse(userQuery, context);
    if (onStreamChunk) {
      const words = offlineResult.text.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 25));
        onStreamChunk(words.slice(0, i + 1).join(' '));
      }
    }
    return offlineResult;
  }

  try {
    const systemPrompt = `You are Carbon Coach, an industrial energy efficiency and ESG expert for the VoltGhost platform.
Use ONLY the supplied operational context:
- Tariff: ₹${context.tariffPerKwh}/kWh
- Emission Factor: ${context.emissionFactor} kg CO2/kWh
- Persona Mode: ${context.persona} (cfo: emphasize ROI and ₹ savings; eco: emphasize CO2; engineer: technical telemetry and PID/VFD details; eli10: super simple relatable analogies).
- Target Language: ${context.language} (en: English, hi: Hindi, kn: Kannada).
- Top equipment status: ${JSON.stringify(
      context.equipment.slice(0, 6).map((e) => ({
        id: e.id,
        name: e.name,
        currentKw: e.currentKw,
        idealKw: e.idealKw,
        gapKw: Math.max(0, e.currentKw - e.idealKw),
      }))
    )}
- Active Ghost Anomalies: ${JSON.stringify(
      context.ghostEvents.filter((g) => !g.resolved).map((g) => ({
        machine: g.equipmentName,
        type: g.type,
        wastedKwh: g.wastedKwh,
      }))
    )}

Give concise, ranked, specific, quantified recommendations with estimated kWh, Rs, and CO2 saved, effort, and payback. Cite machine names accurately.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      if (onStreamChunk) {
        onStreamChunk(candidateText);
      }
      return { text: candidateText };
    }
    throw new Error('No text in response');
  } catch (err) {
    console.warn('Gemini API call failed, using offline fallback', err);
    return generateOfflineResponse(userQuery, context);
  }
}
