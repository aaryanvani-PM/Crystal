import React, { useState, useRef, useEffect } from 'react';
import { MinimalInfographicData } from '../../types/infographic';
import { ChevronDown, ChevronUp, Sparkles, Eye, Info } from 'lucide-react';
import {
  resolveChartAnnotation,
  getAllChartMilestones,
  ResolvedAnnotation,
} from '../../utils/annotationEngine';
import {
  DynamicCalloutAnnotation,
  ChartAnnotationPin,
} from '../DynamicCalloutAnnotation';

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
  const [showAnnotations, setShowAnnotations] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerDims, setContainerDims] = useState<{ width: number; height: number }>({
    width: 800,
    height: 360,
  });

  const activeScenario =
    switcher?.scenarios.find((s) => s.id === activeScenarioId) ||
    switcher?.scenarios?.[0];

  useEffect(() => {
    const updateDims = () => {
      if (chartContainerRef.current) {
        setContainerDims({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  if (!activeScenario) {
    return <div className="text-zinc-500 text-sm">No scenario data found</div>;
  }

  const { metrics, chartData, insightHighlight } = activeScenario;
  const labels = chartData.labels || [];
  const series = chartData.series || [];
  const predefinedAnnotations = chartData.annotations || data.annotations;

  // Calculate dynamic maximum value across all series data points
  let maxDataVal = 100;
  series.forEach((s) => {
    s.data.forEach((v) => {
      if (v > maxDataVal) maxDataVal = v;
    });
  });
  // Nice round ceiling (e.g., 100, 125, 150, 175, 200)
  const roundCeil = Math.ceil(maxDataVal / 25) * 25;
  const gridSteps = [roundCeil, roundCeil * 0.75, roundCeil * 0.5, roundCeil * 0.25, 0];

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
    const clamped = Math.max(0, val);
    return padBottom - (clamped / roundCeil) * plotHeight;
  };

  // Convert SVG coordinates to container CSS pixel coordinates
  const svgToContainer = (svgX: number, svgY: number) => {
    const scaleX = containerDims.width / svgWidth;
    const scaleY = containerDims.height / svgHeight;
    return {
      x: svgX * scaleX,
      y: svgY * scaleY,
    };
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

  // Determine if this is a partitioned substrate card (like cardio timing where series sum to 100%)
  const isPartitionCard = data.id === 'sample-cardio-timing' && series.length === 2;

  // Compute all key milestones and anomalies for pin indicators
  const keyMilestones = getAllChartMilestones(
    labels,
    series,
    predefinedAnnotations,
    activeScenario.label
  );

  // Active annotation for hovered point
  const activeAnnotation: ResolvedAnnotation | null =
    hoveredIdx !== null
      ? resolveChartAnnotation({
          labels,
          series,
          pointIndex: hoveredIdx,
          predefinedAnnotations,
          contextTitle: activeScenario.label,
          contextSubtitle: data.subtitle,
          unit: '%',
        })
      : null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Sequence Switcher Pill Container + Callout Annotations Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {switcher && switcher.scenarios.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-[#161619] border border-zinc-800/80 w-fit">
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

        {/* Dynamic Annotations Indicator Badge / Toggle */}
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            showAnnotations
              ? 'bg-blue-950/30 border-blue-500/50 text-sky-300 shadow-sm'
              : 'bg-[#161619] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle dynamic callout annotations and anomalies"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {showAnnotations
              ? `Context Callouts (${keyMilestones.length} insights)`
              : 'Callouts Muted'}
          </span>
        </button>
      </div>

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
        <div ref={chartContainerRef} className="relative w-full h-80 sm:h-96">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              {series.map((s, sIdx) => {
                const color = s.color || (sIdx === 0 ? '#38bdf8' : '#eab308');
                return (
                  <linearGradient key={`grad-${sIdx}`} id={`area-grad-${sIdx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.55" />
                    <stop offset="85%" stopColor={color} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                  </linearGradient>
                );
              })}

              {/* Special complementary top fill for cardio partition */}
              {isPartitionCard && (
                <linearGradient id="partition-top-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#85754e" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#4a422b" stopOpacity="0.5" />
                </linearGradient>
              )}
            </defs>

            {/* Horizontal Grid lines */}
            {gridSteps.map((pct) => {
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

            {/* If Cardio Partition: render top complementary area and bottom curve */}
            {isPartitionCard && series.length >= 2 ? (
              <>
                {(() => {
                  const pts = labels.map((_, i) => ({ x: getX(i), y: getY(series[0].data[i] ?? 0) }));
                  const line = buildSmoothPath(pts);
                  const firstPt = pts[0] || { x: padLeft, y: padBottom };
                  const lastPt = pts[pts.length - 1] || { x: padLeft + plotWidth, y: padBottom };

                  const topPath = `${line} L ${lastPt.x} ${padTop} L ${firstPt.x} ${padTop} Z`;
                  const bottomPath = `${line} L ${lastPt.x} ${padBottom} L ${firstPt.x} ${padBottom} Z`;

                  return (
                    <g>
                      <path d={topPath} fill="url(#partition-top-grad)" />
                      <path d={bottomPath} fill="url(#area-grad-0)" />
                      <path d={line} fill="none" stroke={series[0].color || '#7dd3fc'} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  );
                })()}
              </>
            ) : (
              /* Standard dynamic area series (e.g. SaaS expansion, Churn, Edge AI) */
              series.map((s, sIdx) => {
                const pts = labels.map((_, i) => ({ x: getX(i), y: getY(s.data[i] ?? 0) }));
                const line = buildSmoothPath(pts);
                const firstPt = pts[0] || { x: padLeft, y: padBottom };
                const lastPt = pts[pts.length - 1] || { x: padLeft + plotWidth, y: padBottom };
                const areaPath = `${line} L ${lastPt.x} ${padBottom} L ${firstPt.x} ${padBottom} Z`;

                return (
                  <g key={`series-layer-${sIdx}`}>
                    <path d={areaPath} fill={`url(#area-grad-${sIdx})`} />
                    <path
                      d={line}
                      fill="none"
                      stroke={s.color || '#38bdf8'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })
            )}

            {/* Key Milestone & Anomaly Pins (rendered on curve) */}
            {showAnnotations &&
              keyMilestones.map((m) => {
                const primaryVal = series[0]?.data[m.pointIndex] ?? 50;
                const pinX = getX(m.pointIndex);
                const pinY = getY(primaryVal);
                const isHovered = hoveredIdx === m.pointIndex;

                return (
                  <g
                    key={`milestone-pin-${m.pointIndex}`}
                    onClick={() => setHoveredIdx(m.pointIndex)}
                  >
                    <ChartAnnotationPin
                      cx={pinX}
                      cy={pinY}
                      color={m.color}
                      isAnomaly={m.isAnomaly}
                      type={m.type}
                      isHovered={isHovered}
                    />
                  </g>
                );
              })}

            {/* Active Crosshair Guide Line on hover */}
            {hoveredIdx !== null && (
              <g>
                <line
                  x1={getX(hoveredIdx)}
                  y1={padTop}
                  x2={getX(hoveredIdx)}
                  y2={padBottom}
                  stroke={activeAnnotation?.color || '#e0f2fe'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                {/* Active node dot on primary series */}
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(series[0]?.data[hoveredIdx] ?? 0)}
                  r="6"
                  fill="#161619"
                  stroke={activeAnnotation?.color || '#38bdf8'}
                  strokeWidth="3"
                  className="filter drop-shadow"
                />
              </g>
            )}

            {/* X-axis marks */}
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

          {/* Dynamic Callout Annotation (Context-Aware Explanations on Hover) */}
          {showAnnotations && activeAnnotation && hoveredIdx !== null && (
            (() => {
              const primaryVal = series[0]?.data[hoveredIdx] ?? 50;
              const anchor = svgToContainer(getX(hoveredIdx), getY(primaryVal));
              return (
                <DynamicCalloutAnnotation
                  annotation={activeAnnotation}
                  timelineLabel={labels[hoveredIdx]}
                  x={anchor.x}
                  y={anchor.y}
                  containerWidth={containerDims.width}
                  containerHeight={containerDims.height}
                />
              );
            })()
          )}
        </div>

        {/* Dynamic Legend + Milestone Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-6 font-medium">
            {series.map((s, sIdx) => {
              const color = s.color || (sIdx === 0 ? '#60a5fa' : '#eab308');
              return (
                <div key={sIdx} className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{s.name}</span>
                </div>
              );
            })}
          </div>

          {/* Anomaly / Milestone Quick Jump Chips */}
          {keyMilestones.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">Highlights:</span>
              {keyMilestones.slice(0, 3).map((m) => (
                <button
                  key={m.pointIndex}
                  onClick={() => setHoveredIdx(m.pointIndex)}
                  onMouseEnter={() => setHoveredIdx(m.pointIndex)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium border transition-all cursor-pointer ${
                    hoveredIdx === m.pointIndex
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-[#1a1a20] text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                  style={{
                    color: hoveredIdx === m.pointIndex ? m.color : undefined,
                  }}
                >
                  <span className="mr-1">{m.tag.split(' ')[0]}</span>
                  <span>{labels[m.pointIndex]}</span>
                </button>
              ))}
            </div>
          )}
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
