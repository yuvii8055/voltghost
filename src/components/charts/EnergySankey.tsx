import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const EnergySankey: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Sankey nodes and connections
  const sources = [
    { id: 'grid', label: 'Grid Supply (415V)', val: 420, color: '#3b82f6', y: 40 },
    { id: 'solar', label: 'Rooftop Solar (PV)', val: 58, color: '#00FFC6', y: 150 },
    { id: 'battery', label: 'Battery ESS Storage', val: 32, color: '#8b5cf6', y: 240 },
  ];

  const zones = [
    { id: 'z1', label: 'Zone 1: Machining', val: 195, color: '#06b6d4', y: 30 },
    { id: 'z2', label: 'Zone 2: Assembly', val: 110, color: '#10b981', y: 110 },
    { id: 'z3', label: 'Zone 3: Thermal & Chiller', val: 135, color: '#f59e0b', y: 180 },
    { id: 'z4', label: 'Zone 4: Cleanroom & IT', val: 70, color: '#ec4899', y: 250 },
  ];

  const destinations = [
    { id: 'productive', label: 'Productive Work (Ideal)', val: 378, color: '#10b981', y: 60 },
    { id: 'waste', label: 'Ghost Gap (Avoidable Waste)', val: 132, color: '#FF3366', y: 220 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div>
          <h4 className="text-sm font-bold text-white">Facility Energy Flow (Sankey Flow)</h4>
          <p className="text-xs text-slate-400">Generation & Grid → Zones → Productive vs Waste</p>
        </div>
        <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-[#00FFC6]">
          Real-time Fusion
        </span>
      </div>

      <div className="w-full aspect-[16/7] relative bg-black/30 rounded-xl p-4 overflow-hidden">
        <svg viewBox="0 0 760 300" className="w-full h-full">
          {/* Links: Sources -> Zones */}
          {sources.map((s) =>
            zones.map((z) => {
              const weight = (s.val * z.val) / 51000;
              const linkWidth = Math.max(1.5, weight * 3);
              const x1 = 140;
              const y1 = s.y + 12;
              const x2 = 360;
              const y2 = z.y + 12;
              const isHovered = hoveredNode === s.id || hoveredNode === z.id;

              return (
                <path
                  key={`${s.id}-${z.id}`}
                  d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={linkWidth}
                  strokeOpacity={isHovered ? 0.75 : 0.25}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Links: Zones -> Destinations */}
          {zones.map((z) =>
            destinations.map((d) => {
              const isWaste = d.id === 'waste';
              const share = isWaste ? 0.26 : 0.74;
              const linkWidth = Math.max(2, (z.val * share) / 12);
              const x1 = 490;
              const y1 = z.y + 12;
              const x2 = 620;
              const y2 = d.y + 16;
              const isHovered = hoveredNode === z.id || hoveredNode === d.id;

              return (
                <path
                  key={`${z.id}-${d.id}`}
                  d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={linkWidth}
                  strokeOpacity={isHovered ? 0.75 : 0.25}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Source Nodes */}
          {sources.map((s) => (
            <g
              key={s.id}
              onMouseEnter={() => setHoveredNode(s.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x="20"
                y={s.y}
                width="120"
                height="28"
                rx="6"
                fill="#0F172A"
                stroke={s.color}
                strokeWidth="1.5"
              />
              <text x="30" y={s.y + 18} fill="#fff" fontSize="10" fontWeight="600">
                {s.label}
              </text>
            </g>
          ))}

          {/* Zone Nodes */}
          {zones.map((z) => (
            <g
              key={z.id}
              onMouseEnter={() => setHoveredNode(z.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x="360"
                y={z.y}
                width="130"
                height="26"
                rx="6"
                fill="#0F172A"
                stroke={z.color}
                strokeWidth="1.5"
              />
              <text x="370" y={z.y + 17} fill="#fff" fontSize="10" fontWeight="600">
                {z.label}
              </text>
            </g>
          ))}

          {/* Destination Nodes */}
          {destinations.map((d) => (
            <g
              key={d.id}
              onMouseEnter={() => setHoveredNode(d.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x="620"
                y={d.y}
                width="130"
                height="32"
                rx="8"
                fill="#0F172A"
                stroke={d.color}
                strokeWidth="2"
              />
              <text
                x="630"
                y={d.y + 20}
                fill={d.color}
                fontSize="10"
                fontWeight="bold"
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
