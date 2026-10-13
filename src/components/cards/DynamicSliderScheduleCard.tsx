import React, { useState } from 'react';
import { MinimalInfographicData } from '../../types/infographic';
import { ChevronDown } from 'lucide-react';

interface Props {
  data: MinimalInfographicData;
}

export const DynamicSliderScheduleCard: React.FC<Props> = ({ data }) => {
  const config = data.sliderConfig || {
    label: 'Zone 2 Cardio Days / Week',
    min: 1,
    max: 7,
    step: 1,
    defaultValue: 5,
    unit: 'Days',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    liftingBase: [75, 75, 82, 0, 75, 70, 0],
    metricFormulas: { cnsBase: 300, fatOxBase: 75 },
  };

  const [sliderVal, setSliderVal] = useState<number>(data.currentSliderValue || config.defaultValue || 5);
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const days = config.labels;
  const liftingStress = config.liftingBase;

  // Determine which days have cardio based on slider value
  // 1 day: Sun
  // 2 days: Thu, Sun
  // 3 days: Tue, Thu, Sun
  // 4 days: Tue, Thu, Sat, Sun
  // 5 days: Mon, Tue, Thu, Fri, Sun
  // 6 days: Mon, Tue, Wed, Thu, Fri, Sun
  // 7 days: all 7 days
  const cardioDayMap: Record<number, number[]> = {
    1: [6],
    2: [3, 6],
    3: [1, 3, 6],
    4: [1, 3, 5, 6],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 3, 4, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };

  const activeCardioIndices = cardioDayMap[sliderVal] || [0, 1, 3, 4, 6];

  // Cardio stress per day: 15 pts on cardio days
  const cardioStress = days.map((_, i) => (activeCardioIndices.includes(i) ? 15 : 0));

  // Fat oxidation stimulus per day: higher on cardio days, lower on pure lift or rest days
  const fatOxStimulus = days.map((_, i) => {
    const hasCardio = activeCardioIndices.includes(i);
    const hasLift = liftingStress[i] > 0;
    if (hasCardio && hasLift) return 76;
    if (hasCardio && !hasLift) return 74;
    return 8; // minimal stimulus
  });

  // Calculate high-level KPIs
  const totalLiftingCns = liftingStress.reduce((a, b) => a + b, 0);
  const totalCardioCns = activeCardioIndices.length * 15;
  const totalCns = totalLiftingCns + totalCardioCns; // ~450 pts at 5 days
  const fatOxScore = activeCardioIndices.length * 75; // 375 pts at 5 days

  let systemicBalance = 'Moderate High';
  let balanceColor = '#facc15'; // yellow/amber
  if (sliderVal <= 2) {
    systemicBalance = 'Low / Recovery Oriented';
    balanceColor = '#38bdf8';
  } else if (sliderVal <= 4) {
    systemicBalance = 'Optimal Adaptive Range';
    balanceColor = '#34d399';
  } else if (sliderVal === 5) {
    systemicBalance = 'Moderate High';
    balanceColor = '#facc15';
  } else {
    systemicBalance = 'High CNS Strain / Peak Block';
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
    // 0 to 100
    return padBottom - (val / 100) * plotHeight;
  };

  // Build smooth spline for fat oxidation stimulus line
  const splinePoints = days.map((_, i) => ({ x: getX(i), y: getY(fatOxStimulus[i]) }));
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 3 Minimal KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium italic">
            Weekly CNS Stress
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white my-2">
            {totalCns} pts
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {totalLiftingCns} lift + {totalCardioCns} cardio
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium italic">
            Fat Oxidation Score
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white my-2">
            {fatOxScore} pts
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {activeCardioIndices.length} sessions active
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161619] border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-medium italic">
            Systemic Balance
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight my-2" style={{ color: balanceColor }}>
            {systemicBalance}
          </div>
          <div className="text-[11px] text-zinc-500">
            Dynamic nervous system status
          </div>
        </div>
      </div>

      {/* Main Combo Bar + Line Chart */}
      <div className="relative w-full rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 sm:p-6 overflow-hidden">
        <div className="relative w-full h-80">
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

            {/* Lifting Stress Bars (Pink stadium pills) */}
            {days.map((_, i) => {
              const val = liftingStress[i];
              if (val === 0) return null;
              const x = getX(i);
              const barWidth = 32;
              const barHeight = (val / 100) * plotHeight;
              const barY = padBottom - barHeight;

              return (
                <rect
                  key={`lift-${i}`}
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="8"
                  fill="#f472b6" // soft vibrant pink
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Cardio Stress Bars (Small Yellow stadium pills) */}
            {days.map((_, i) => {
              const hasCardio = activeCardioIndices.includes(i);
              if (!hasCardio) return null;
              const x = getX(i);
              const barWidth = 26;
              const barHeight = 18; // small accent bar
              const barY = padBottom - barHeight;

              return (
                <rect
                  key={`cardio-${i}`}
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill="#facc15" // warm yellow
                  className="transition-all duration-300 animate-fade-in"
                />
              );
            })}

            {/* Fat Oxidation Stimulus Line (Cyan Spline) */}
            <path
              d={linePath}
              fill="none"
              stroke="#7dd3fc" // soft cyan/blue
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
                  stroke="#7dd3fc"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px #7dd3fc)' : 'none',
                  }}
                />
              );
            })}

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

          {/* Hover Tooltip */}
          {hoveredDayIdx !== null && (
            <div className="absolute top-2 right-4 px-3.5 py-2 rounded-xl bg-[#202026]/95 border border-zinc-700/80 text-xs shadow-2xl backdrop-blur-md pointer-events-none">
              <div className="font-semibold text-zinc-300 pb-1 border-b border-zinc-800">
                {days[hoveredDayIdx]} Breakdown
              </div>
              <div className="flex flex-col gap-1 mt-1.5 font-mono text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-pink-300">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    Lifting Stress:
                  </span>
                  <span className="font-bold text-white">
                    {liftingStress[hoveredDayIdx]} pts
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-yellow-300">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    Cardio Stress:
                  </span>
                  <span className="font-bold text-white">
                    {activeCardioIndices.includes(hoveredDayIdx) ? '15 pts (Active)' : '0 pts (Off)'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Fat Ox Stimulus:
                  </span>
                  <span className="font-bold text-white">
                    {fatOxStimulus[hoveredDayIdx]} pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-800/80 text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span className="italic">Lifting CNS Stress</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="italic">Cardio CNS Stress</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="italic">Fat Oxidation Stimulus</span>
          </div>
        </div>
      </div>

      {/* Interactive Range Slider Bar (Matches bottom widget in Image 2) */}
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

          <div className="w-20 text-right font-mono font-bold text-sm text-white shrink-0">
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
