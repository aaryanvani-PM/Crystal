import React, { useState, useRef, useEffect } from 'react';
import { MinimalInfographicData } from '../../types/infographic';
import { ChevronDown, Sparkles } from 'lucide-react';
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

export const DynamicSliderScheduleCard: React.FC<Props> = ({ data }) => {
  const config = data.sliderConfig;
  const [sliderVal, setSliderVal] = useState<number>(
    data.currentSliderValue || config?.defaultValue || 3
  );
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerDims, setContainerDims] = useState<{ width: number; height: number }>({
    width: 800,
    height: 320,
  });

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

  if (!config) {
    return (
      <div className="text-zinc-500 text-sm">
        No dynamic slider configuration provided
      </div>
    );
  }

  const days = config.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Domain-flexible series labels and colors
  const seriesNames = {
    primaryBar: config.seriesNames?.primaryBar || 'Baseline Volume',
    primaryColor: config.seriesNames?.primaryColor || '#60a5fa',
    accentBar: config.seriesNames?.accentBar || 'Dynamic Allocation',
    accentColor: config.seriesNames?.accentColor || '#f59e0b',
    lineCurve: config.seriesNames?.lineCurve || 'Systemic Impact',
    lineColor: config.seriesNames?.lineColor || '#ec4899',
    unit: config.seriesNames?.unit || config.unit || 'units',
  };

  // Primary baseline values
  const primaryValues = config.primaryBase || config.liftingBase || [75, 0, 80, 0, 75, 85, 0];

  // Map slider value to active days
  const stepDaysMapping: Record<number, number[]> = {
    0: [],
    1: [1],
    2: [1, 4],
    3: [1, 3, 5],
    4: [0, 2, 4, 6],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  const activeStepIndices = stepDaysMapping[Math.min(sliderVal, 7)] || [1, 3, 5];

  // Accent values
  const accentValues = config.accentBase || [0, 18, 0, 18, 0, 18, 0];

  // Calculate dynamic curve line values for each day
  const lineValues = days.map((_, i) => {
    const hasAccent = activeStepIndices.includes(i);
    const prim = primaryValues[i] || 0;
    const accent = hasAccent ? (accentValues[i] || 18) : 0;
    // Calculate composite intensity
    const composite = prim * 0.45 + accent * 2.2;
    return Math.min(100, Math.round(composite));
  });

  // Calculate composite cumulative KPI metric
  const kpi1CalculatedValue = Math.min(
    100,
    Math.round(
      (primaryValues.reduce((a, b) => a + b, 0) / 400) * 45 +
        (activeStepIndices.length / 7) * 40
    )
  );

  // Dynamic KPI Labels
  const kpiLabels = {
    kpi1Label: config.kpiLabels?.kpi1Label || 'Cumulative Load',
    kpi1Unit: config.kpiLabels?.kpi1Unit || '%',
    kpi1Subtext:
      config.kpiLabels?.kpi1Subtext ||
      `${sliderVal} ${config.unit} active setting`,
    kpi2Label: config.kpiLabels?.kpi2Label || 'Utilization Index',
    kpi2Unit: config.kpiLabels?.kpi2Unit || (seriesNames.unit === 'GWh' ? 'GWh' : 'pts'),
    kpi2Subtext:
      config.kpiLabels?.kpi2Subtext ||
      `${activeStepIndices.length} active allocation stages`,
    kpi3Label: config.kpiLabels?.kpi3Label || 'System Balance',
    kpi3Subtext:
      config.kpiLabels?.kpi3Subtext || 'Real-time operating threshold',
  };

  // KPI 2 value calculation
  const kpi2CalculatedValue = config.metricFormulas?.fatOxBase
    ? activeStepIndices.length * config.metricFormulas.fatOxBase
    : activeStepIndices.length * 75;

  // System balance status calculation
  let balanceStatus = 'Optimal Balance';
  let balanceColor = '#34d399';
  if (sliderVal <= 2) {
    balanceStatus =
      config.kpiLabels?.balanceThresholds?.low || 'Low Allocation / Minimal Strain';
    balanceColor = '#38bdf8';
  } else if (sliderVal <= 4) {
    balanceStatus =
      config.kpiLabels?.balanceThresholds?.mid || 'Optimal Adaptive Balance';
    balanceColor = '#34d399';
  } else if (sliderVal === 5) {
    balanceStatus =
      config.kpiLabels?.balanceThresholds?.mid || 'Moderate High Capacity';
    balanceColor = '#facc15';
  } else {
    balanceStatus =
      config.kpiLabels?.balanceThresholds?.high || 'Peak Load / High Strain';
    balanceColor = '#f87171';
  }

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 230;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = padBottom - padTop;

  const getX = (idx: number) => {
    return padLeft + (idx + 0.5) * (plotWidth / days.length);
  };

  const getY = (val: number) => {
    return padBottom - (val / 100) * plotHeight;
  };

  // Convert SVG coordinate to container pixel coordinate
  const svgToContainer = (svgX: number, svgY: number) => {
    const scaleX = containerDims.width / svgWidth;
    const scaleY = containerDims.height / svgHeight;
    return {
      x: svgX * scaleX,
      y: svgY * scaleY,
    };
  };

  // Build smooth spline for the dynamic curve line
  const splinePoints = days.map((_, i) => ({ x: getX(i), y: getY(lineValues[i]) }));
  let linePath = '';
  if (splinePoints.length > 0) {
    linePath = `M ${splinePoints[0].x} ${splinePoints[0].y}`;
    for (let i = 0; i < splinePoints.length - 1; i++) {
      const p0 = splinePoints[i === 0 ? 0 : i - 1];
      const p1 = splinePoints[i];
      const p2 = splinePoints[i + 1];
      const p3 = splinePoints[i + 2 < splinePoints.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  // Virtual series for annotation engine
  const chartSeries = [
    {
      name: seriesNames.primaryBar,
      color: seriesNames.primaryColor,
      data: primaryValues,
    },
    {
      name: seriesNames.lineCurve,
      color: seriesNames.lineColor,
      data: lineValues,
    },
  ];

  const keyMilestones = getAllChartMilestones(
    days,
    chartSeries,
    config.annotations,
    config.label
  );

  const activeAnnotation: ResolvedAnnotation | null =
    hoveredDayIdx !== null
      ? resolveChartAnnotation({
          labels: days,
          series: chartSeries,
          pointIndex: hoveredDayIdx,
          predefinedAnnotations: config.annotations,
          contextTitle: config.label,
          unit: seriesNames.unit,
        })
      : null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 3 Dynamic KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium">
            {kpiLabels.kpi1Label}
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums text-white my-2">
            {kpi1CalculatedValue}
            {kpiLabels.kpi1Unit}
          </div>
          <div className="text-[11px] text-zinc-500">
            {kpiLabels.kpi1Subtext}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium">
            {kpiLabels.kpi2Label}
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums text-white my-2">
            {kpi2CalculatedValue}
            <span className="text-xl ml-1 text-zinc-400 font-normal">
              {kpiLabels.kpi2Unit}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500">
            {kpiLabels.kpi2Subtext}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium">
            {kpiLabels.kpi3Label}
          </div>
          <div
            className="text-2xl font-bold my-2 truncate"
            style={{ color: balanceColor }}
          >
            {balanceStatus}
          </div>
          <div className="text-[11px] text-zinc-500">
            {kpiLabels.kpi3Subtext}
          </div>
        </div>
      </div>

      {/* Main Combo Bar + Line Chart */}
      <div className="relative w-full rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 sm:p-6 overflow-hidden">
        {/* Header toolbar with Annotations Toggle */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-800/80">
          <div className="text-xs text-zinc-400 font-medium">
            <span className="text-white font-semibold mr-1.5">{config.label}</span>
            <span>({seriesNames.unit})</span>
          </div>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
              showAnnotations
                ? 'bg-blue-950/30 border-blue-500/50 text-sky-300'
                : 'bg-[#161619] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle dynamic callout annotations"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>
              {showAnnotations ? `Annotations (${keyMilestones.length})` : 'Muted'}
            </span>
          </button>
        </div>

        <div ref={chartContainerRef} className="relative w-full h-80">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredDayIdx(null)}
          >
            {/* Grid lines (100, 50, 0) */}
            {[100, 50, 0].map((val) => {
              const y = getY(val);
              return (
                <g key={`grid-${val}`}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotWidth}
                    y2={y}
                    stroke="#27272a"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontStyle="italic"
                    fill="#71717a"
                    className="font-mono tabular-nums select-none"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Primary Volume Bars */}
            {days.map((_, i) => {
              const val = primaryValues[i];
              if (!val || val === 0) return null;
              const x = getX(i);
              const barWidth = 32;
              const barHeight = (val / 100) * plotHeight;
              const barY = padBottom - barHeight;

              return (
                <rect
                  key={`prim-${i}`}
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="8"
                  fill={seriesNames.primaryColor}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Accent Allocation Bars */}
            {days.map((_, i) => {
              const hasAccent = activeStepIndices.includes(i);
              if (!hasAccent) return null;
              const x = getX(i);
              const barWidth = 26;
              const barHeight = 18;
              const barY = padBottom - barHeight;

              return (
                <rect
                  key={`accent-${i}`}
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={seriesNames.accentColor}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Dynamic Metric Curve (Spline) */}
            <path
              d={linePath}
              fill="none"
              stroke={seriesNames.lineColor}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Node Dots on the line */}
            {splinePoints.map((pt, i) => {
              const isHovered = hoveredDayIdx === i;
              return (
                <circle
                  key={`node-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#161619"
                  stroke={seriesNames.lineColor}
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${seriesNames.lineColor})` : 'none',
                  }}
                />
              );
            })}

            {/* Key Milestone & Anomaly Pin Indicators */}
            {showAnnotations &&
              keyMilestones.map((m) => {
                const pinX = getX(m.pointIndex);
                const pinY = getY(lineValues[m.pointIndex]);
                const isHovered = hoveredDayIdx === m.pointIndex;

                return (
                  <g
                    key={`slider-pin-${m.pointIndex}`}
                    onClick={() => setHoveredDayIdx(m.pointIndex)}
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

            {/* Hover Crosshair */}
            {hoveredDayIdx !== null && (
              <line
                x1={getX(hoveredDayIdx)}
                y1={padTop}
                x2={getX(hoveredDayIdx)}
                y2={padBottom}
                stroke={activeAnnotation?.color || '#e0f2fe'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
            )}

            {/* X-axis Day Labels */}
            {days.map((day, i) => {
              const x = getX(i);
              const isHovered = hoveredDayIdx === i;
              return (
                <g key={`day-col-${i}`}>
                  <text
                    x={x}
                    y={padBottom + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fill={isHovered ? '#ffffff' : '#a1a1aa'}
                    fontWeight={isHovered ? '600' : '400'}
                    className="select-none transition-colors"
                  >
                    {day}
                  </text>

                  {/* Wide invisible click/hover hitbox */}
                  <rect
                    x={x - plotWidth / (days.length * 2)}
                    y={padTop}
                    width={plotWidth / days.length}
                    height={plotHeight + 30}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDayIdx(i)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Dynamic Callout Annotation on Hover */}
          {showAnnotations && activeAnnotation && hoveredDayIdx !== null && (
            (() => {
              const anchor = svgToContainer(
                getX(hoveredDayIdx),
                getY(lineValues[hoveredDayIdx])
              );
              return (
                <DynamicCalloutAnnotation
                  annotation={activeAnnotation}
                  timelineLabel={days[hoveredDayIdx]}
                  x={anchor.x}
                  y={anchor.y}
                  containerWidth={containerDims.width}
                  containerHeight={containerDims.height}
                />
              );
            })()
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <div className="flex items-center gap-2 text-zinc-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: seriesNames.primaryColor }}
              />
              <span className="italic">{seriesNames.primaryBar}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: seriesNames.accentColor }}
              />
              <span className="italic">{seriesNames.accentBar}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: seriesNames.lineColor }}
              />
              <span className="italic">{seriesNames.lineCurve}</span>
            </div>
          </div>

          {/* Quick jump milestone tags */}
          {keyMilestones.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 font-mono">Pins:</span>
              {keyMilestones.slice(0, 3).map((m) => (
                <button
                  key={m.pointIndex}
                  onClick={() => setHoveredDayIdx(m.pointIndex)}
                  onMouseEnter={() => setHoveredDayIdx(m.pointIndex)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium border transition-all cursor-pointer ${
                    hoveredDayIdx === m.pointIndex
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-[#1a1a20] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  style={{
                    color: hoveredDayIdx === m.pointIndex ? m.color : undefined,
                  }}
                >
                  <span>{days[m.pointIndex]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Range Slider Bar */}
      <div className="relative rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs sm:text-sm font-semibold text-zinc-200">
          {config.label}
        </div>

        <div className="flex-1 max-w-md flex items-center gap-4">
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
          />

          <div className="w-28 text-right font-mono font-bold text-sm text-white shrink-0">
            {sliderVal} {config.unit}
          </div>
        </div>

        <button
          className="w-8 h-8 rounded-full bg-[#1e1e24] border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white shrink-0 transition-colors"
          title="Scroll or expand"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
