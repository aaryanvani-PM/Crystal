import React, { useState } from 'react';
import { MinimalInfographicData } from '../../types/infographic';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: MinimalInfographicData;
}

export const ScenarioAreaCard: React.FC<Props> = ({ data }) => {
  const switcher = data.switcherConfig;
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    switcher?.activeScenarioId || switcher?.scenarios?.[0]?.id || ''
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const activeScenario =
    switcher?.scenarios.find((s) => s.id === activeScenarioId) ||
    switcher?.scenarios?.[0];

  if (!activeScenario) {
    return <div className="text-zinc-500 text-sm">No scenario data found</div>;
  }

  const { metrics, chartData, insightHighlight } = activeScenario;
  const labels = chartData.labels || [];
  const series = chartData.series || [];

  // Dimensions for SVG Area Chart
  const svgWidth = 840;
  const svgHeight = 320;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 270;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = padBottom - padTop;

  const getX = (idx: number) => {
    if (labels.length <= 1) return padLeft + plotWidth / 2;
    return padLeft + (idx / (labels.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    // Range 0 to 100%
    return padBottom - (Math.max(0, Math.min(100, val)) / 100) * plotHeight;
  };

  // Smooth spline path builder
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Series 0: Glycogen curve (bottom area)
  // Series 1: Fat Oxidation (top background fill)
  const glySeries = series[0] || { name: 'Glycogen Burn (%)', color: '#60a5fa', data: [] };
  const fatSeries = series[1] || { name: 'Fat Oxidation (%)', color: '#eab308', data: [] };

  const glyPoints = labels.map((_, i) => ({ x: getX(i), y: getY(glySeries.data[i] ?? 0) }));
  const glyLinePath = buildSmoothPath(glyPoints);

  const firstPt = glyPoints[0] || { x: padLeft, y: padBottom };
  const lastPt = glyPoints[glyPoints.length - 1] || { x: padLeft + plotWidth, y: padBottom };

  // Bottom Area (Glycogen)
  const glyAreaPath = `${glyLinePath} L ${lastPt.x} ${padBottom} L ${firstPt.x} ${padBottom} Z`;

  // Top Area (Fat Oxidation - fill between glycogen line and 100% top ceiling)
  const fatAreaPath = `${glyLinePath} L ${lastPt.x} ${padTop} L ${firstPt.x} ${padTop} Z`;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Sequence Switcher Pill Container */}
      {switcher && switcher.scenarios.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl bg-[#161619] border border-zinc-800/80 w-fit">
          <span className="text-xs font-semibold text-zinc-400 pl-3">
            {switcher.switchLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {switcher.scenarios.map((scen) => {
              const isActive = scen.id === activeScenarioId;
              return (
                <button
                  key={scen.id}
                  onClick={() => setActiveScenarioId(scen.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#222227] text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  {scen.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3 Minimal KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between"
          >
            <div className="text-xs text-zinc-400 font-medium">
              {m.label}
            </div>
            <div className="text-4xl font-extrabold font-mono tabular-nums text-white my-2">
              {m.value}
            </div>
            {m.note && (
              <div className="text-xs italic text-zinc-400 leading-snug">
                {m.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Area Chart Container */}
      <div className="relative w-full rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 sm:p-6 overflow-hidden">
        <div className="relative w-full h-80 sm:h-96">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              {/* Glycogen Soft Blue Gradient */}
              <linearGradient id="glycogen-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.45" />
              </linearGradient>

              {/* Fat Soft Olive/Khaki Gradient */}
              <linearGradient id="fat-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#85754e" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#4a422b" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
            {[100, 75, 50, 25, 0].map((pct) => {
              const y = getY(pct);
              return (
                <g key={`grid-${pct}`}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotWidth}
                    y2={y}
                    stroke="#27272a"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontStyle="italic"
                    fill="#71717a"
                    className="font-mono tabular-nums select-none"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Top Area: Fat Oxidation Fill */}
            <path d={fatAreaPath} fill="url(#fat-grad)" />

            {/* Bottom Area: Glycogen Burn Fill */}
            <path d={glyAreaPath} fill="url(#glycogen-grad)" />

            {/* Boundary Curve Line */}
            <path
              d={glyLinePath}
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Active Crosshair Guide Line on hover */}
            {hoveredIdx !== null && (
              <line
                x1={getX(hoveredIdx)}
                y1={padTop}
                x2={getX(hoveredIdx)}
                y2={padBottom}
                stroke="#e0f2fe"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            )}

            {/* X-axis time marks */}
            {labels.map((lbl, idx) => {
              const x = getX(idx);
              const isHovered = hoveredIdx === idx;
              return (
                <g key={`lbl-${idx}`}>
                  <text
                    x={x}
                    y={padBottom + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontStyle="italic"
                    fill={isHovered ? '#ffffff' : '#71717a'}
                    className="font-mono select-none"
                  >
                    {lbl}
                  </text>

                  {/* Wide invisible hitbox */}
                  <rect
                    x={x - plotWidth / (labels.length * 2)}
                    y={padTop}
                    width={plotWidth / labels.length}
                    height={plotHeight + 25}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredIdx !== null && (
            <div
              className="absolute top-3 right-4 px-3.5 py-2 rounded-xl bg-[#202026]/95 border border-zinc-700/80 text-xs shadow-2xl backdrop-blur-md pointer-events-none"
            >
              <div className="font-semibold text-zinc-300 font-mono pb-1 border-b border-zinc-800">
                Timeline: {labels[hoveredIdx]}
              </div>
              <div className="flex flex-col gap-1 mt-1.5 font-mono text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Glycogen Burn:
                  </span>
                  <span className="font-bold text-white">
                    {glySeries.data[hoveredIdx]}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    Fat Oxidation:
                  </span>
                  <span className="font-bold text-white">
                    {fatSeries.data[hoveredIdx]}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-800/80 text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>{glySeries.name}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>{fatSeries.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Highlight Insight Banner */}
      {insightHighlight && (
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-blue-950/70 border border-blue-900/40 p-4 sm:p-5 flex items-start justify-between gap-4">
          <div className="text-xs sm:text-sm leading-relaxed text-zinc-300">
            <span className="font-bold text-sky-400 mr-2">
              {insightHighlight.title}
            </span>
            <span className="italic text-zinc-300 font-normal">
              {insightHighlight.text}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-[#18181e] hover:bg-[#22222a] border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white shrink-0 transition-colors cursor-pointer"
            title="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
