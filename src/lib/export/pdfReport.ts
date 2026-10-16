import { Equipment, GhostEvent } from '../../types';

export function generateSustainabilityReport(
  equipment: Equipment[],
  ghosts: GhostEvent[],
  wastedKwh: number,
  costInr: number,
  co2Kg: number
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const topGhosts = ghosts.slice(0, 5);
  const nowStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>VoltGhost Sustainability & Energy Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; }
    .header { border-bottom: 2px solid #00FFC6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    .tagline { color: #0284c7; font-size: 14px; font-weight: 600; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 28px; font-weight: 800; color: #0f172a; }
    .kpi-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #0f172a; color: white; text-align: left; padding: 10px; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .badge-critical { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; }
    .badge-high { background: #ffedd5; color: #9a3412; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; }
    .badge-medium { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">VoltGhost Energy & Carbon Audit</h1>
      <div class="tagline">HUNT YOUR ENERGY GHOSTS • DIGITAL TWIN & COMPUTER VISION FUSION</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      Generated: <strong>${nowStr}</strong><br>
      Facility: <strong>Plant Alpha (Automotive Sub-Assembly)</strong>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-val" style="color: #ef4444;">${wastedKwh.toFixed(1)} kWh</div>
      <div class="kpi-label">Cumulative Ghost Gap (Waste)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val" style="color: #f59e0b;">₹${Math.round(costInr).toLocaleString('en-IN')}</div>
      <div class="kpi-label">Financial Loss (₹8.5/kWh)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val" style="color: #10b981;">${co2Kg.toFixed(1)} kg</div>
      <div class="kpi-label">Avoidable Scope 2 CO₂e</div>
    </div>
  </div>

  <h3 style="margin-bottom: 8px;">Top Identified Energy Ghosts</h3>
  <table>
    <thead>
      <tr>
        <th>Equipment</th>
        <th>Anomaly Type</th>
        <th>Detection Source</th>
        <th>Severity</th>
        <th>Wasted Energy</th>
        <th>Financial Impact</th>
      </tr>
    </thead>
    <tbody>
      ${topGhosts
        .map(
          (g) => `
        <tr>
          <td><strong>${g.equipmentName}</strong></td>
          <td>${g.type}</td>
          <td>${g.detectedBy.toUpperCase()}</td>
          <td><span class="badge-${g.severity}">${g.severity.toUpperCase()}</span></td>
          <td>${g.wastedKwh.toFixed(1)} kWh</td>
          <td>₹${g.costInr.toFixed(0)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h3 style="margin-top: 30px; margin-bottom: 8px;">Active Equipment Registry Status</h3>
  <table>
    <thead>
      <tr>
        <th>Machine Name</th>
        <th>Zone</th>
        <th>Rated Power</th>
        <th>Real kW</th>
        <th>Ghost (Ideal) kW</th>
        <th>Health Score</th>
      </tr>
    </thead>
    <tbody>
      ${equipment
        .slice(0, 8)
        .map(
          (e) => `
        <tr>
          <td>${e.name}</td>
          <td>${e.zone}</td>
          <td>${e.ratedKw} kW</td>
          <td><strong>${e.currentKw} kW</strong></td>
          <td>${e.idealKw} kW</td>
          <td>${e.healthScore}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>VoltGhost Automated Governance & Compliance Report • ISO 50001 Aligned</div>
    <div>Executive Sign-off: _________________________</div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
