import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface RealVsGhostChartProps {
  equipmentId?: string;
  timeRange?: '24h' | '7d';
}

export const RealVsGhostChart: React.FC<RealVsGhostChartProps> = ({
  equipmentId,
  timeRange = '24h',
}) => {
  const { equipment } = useAppStore();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate 24 hourly data points
  const points = 24;
  const targetEq = equipmentId ? equipment.find((e) => e.id === equipmentId) : null;
  const baseIdeal = targetEq ? targetEq.idealKw : equipment.reduce((acc, e) => acc + e.idealKw, 0);
  const baseReal = targetEq ? targetEq.currentKw : equipment.reduce((acc, e) => acc + e.currentKw, 0);

  const data = Array.from({ length: points }).map((_, i) => {
    const hour = i;
    // Diurnal variation: shift peak during 9am - 6pm (hours 9-18)
    const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2);
    const ideal = Math.max(10, baseIdeal * (1 + diurnal * 0.35 + (Math.sin(i * 1.5) * 0.05)));
    const wasteFactor = 1.28 + Math.sin(i * 0.8) * 0.12;
    const real = ideal * wasteFactor + (Math.sin(i * 2.2) * 5);

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      real: parseFloat(real.toFixed(1)),
      ideal: parseFloat(ideal.toFixed(1)),
      gap: parseFloat((real - ideal).toFixed(1)),
      anomaly: i === 14 || i === 18,
    };
  });

  const maxVal = Math.max(...data.map((d) => d.real)) * 1.15;
  const width = 800;
  const height = 240;
  const padding = 40;

  const getX = (index: number) => padding + (index / (points - 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - (val / maxVal) * (height - 2 * padding);

  // Build SVG path strings
  const realPoints = data.map((d, i) => `${getX(i)},${getY(d.real)}`).join(' ');
  const idealPoints = data.map((d, i) => `${getX(i)},${getY(d.ideal)}`).join(' ');

  // Gap area polygon (from real line to ideal line)
  const gapAreaPolygon =
    data.map((d, i) => `${getX(i)},${getY(d.real)}`).join(' ') +
    ' ' +
    data
      .slice()
      .reverse()
      .map((d, i) => `${getX(points - 1 - i)},${getY(d.ideal)}`)
      .join(' ');

  return (
    <div className="w-full relative select-none">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-[#F59E0B] rounded-full" />
            <span className="text-slate-300 font-medium">Real Consumption (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-[#00FFC6] rounded-full" />
            <span className="text-slate-300 font-medium">Ghost Twin Ideal (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500/30 border border-red-500/60 rounded" />
            <span className="text-red-400 font-semibold">Ghost Gap (Avoidable Waste)</span>
          </div>
        </div>

        {hoverIndex !== null && (
          <div className="font-mono text-xs text-[#00FFC6] bg-black/60 px-3 py-1 rounded-lg border border-white/10">
            {data[hoverIndex].hour} • Real:{' '}
            <span className="text-amber-400 font-bold">{data[hoverIndex].real} kW</span> | Ghost:{' '}
            <span className="text-[#00FFC6] font-bold">{data[hoverIndex].ideal} kW</span> | Gap:{' '}
            <span className="text-[#FF3366] font-bold">+{data[hoverIndex].gap} kW</span>
          </div>
        )}
      </div>

      <div className="relative w-full aspect-[16/6] bg-black/40 rounded-2xl border border-white/10 overflow-hidden p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Shaded Red/Orange Glowing Gradient for the Ghost Gap */}
            <linearGradient id="gapGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3366" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF3366" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFC6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00FFC6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = getY(pct * maxVal);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="JetBrains Mono"
                >
                  {Math.round(pct * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Ghost Gap Shaded Region */}
          <polygon points={gapAreaPolygon} fill="url(#gapGlowGrad)" />

          {/* Ideal Ghost Line (Cyan/Mint) */}
          <polyline
            points={idealPoints}
            fill="none"
            stroke="#00FFC6"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />

          {/* Real Load Line (Amber/Solid) */}
          <polyline
            points={realPoints}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points and Hover Crosshair */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.real);
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover trigger */}
                <circle cx={cx} cy={cy} r="14" fill="transparent" />

                {/* Point dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoverIndex === i ? 6 : 3}
                  fill="#F59E0B"
                  stroke="#000"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Anomaly Badge */}
                {d.anomaly && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="none"
                    stroke="#FF3366"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
