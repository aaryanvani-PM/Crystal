import React from 'react';
import { ResolvedAnnotation, getAnnotationIcon } from '../utils/annotationEngine';
import { Sparkles, AlertTriangle, TrendingUp, Zap, Info } from 'lucide-react';

interface Props {
  annotation: ResolvedAnnotation;
  timelineLabel: string;
  x: number; // Anchor coordinate in pixels within container
  y: number; // Anchor coordinate in pixels within container
  containerWidth: number;
  containerHeight: number;
}

export const DynamicCalloutAnnotation: React.FC<Props> = ({
  annotation,
  timelineLabel,
  x,
  y,
  containerWidth,
  containerHeight,
}) => {
  // Determine positioning to keep callout within container
  const calloutWidth = 280;
  const isRightSide = x > containerWidth * 0.55;
  const isNearBottom = y > containerHeight * 0.65;

  // Offset callout from anchor point
  const leftPos = isRightSide
    ? Math.max(12, x - calloutWidth - 14)
    : Math.min(containerWidth - calloutWidth - 12, x + 16);

  const topPos = isNearBottom
    ? Math.max(12, y - 130)
    : Math.max(12, Math.min(containerHeight - 160, y - 20));

  const tagIcon = getAnnotationIcon(annotation.type);

  return (
    <div
      className="absolute pointer-events-none z-30 transition-all duration-200 ease-out"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
        width: `${calloutWidth}px`,
      }}
    >
      <div
        className="relative rounded-2xl bg-[#16161b]/95 border shadow-2xl backdrop-blur-xl p-3.5 sm:p-4 text-xs transition-transform"
        style={{
          borderColor: annotation.isAnomaly ? '#f43f5e' : `${annotation.color}66`,
          boxShadow: `0 10px 30px -5px rgba(0,0,0,0.8), 0 0 16px -2px ${annotation.color}25`,
        }}
      >
        {/* Subtle top indicator glow bar */}
        <div
          className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${annotation.color}, transparent)`,
          }}
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"
              style={{
                backgroundColor: `${annotation.color}20`,
                color: annotation.color,
                border: `1px solid ${annotation.color}40`,
              }}
            >
              <span>{tagIcon}</span>
              <span>{annotation.tag}</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 font-medium">
            {timelineLabel}
          </span>
        </div>

        {/* Callout Title */}
        <div className="font-semibold text-white text-xs sm:text-[13px] leading-snug mb-1.5 flex items-start justify-between gap-2">
          <span>{annotation.label}</span>
          {annotation.metricDelta && (
            <span
              className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
              style={{
                backgroundColor: '#22222a',
                color: annotation.color,
                border: `1px solid ${annotation.color}40`,
              }}
            >
              {annotation.metricDelta}
            </span>
          )}
        </div>

        {/* Dynamic Context-Aware Explanation */}
        <p className="text-[11px] text-zinc-300 leading-relaxed mb-2.5">
          {annotation.explanation}
        </p>

        {/* Series Values Breakdown */}
        {annotation.seriesBreakdown && annotation.seriesBreakdown.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-1 font-mono text-[11px]">
            {annotation.seriesBreakdown.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400 truncate max-w-[170px]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-bold text-white shrink-0">
                  {s.formattedValue}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Reusable glowing SVG Pin for anomalies and key milestones on chart curves
 */
interface PinProps {
  cx: number;
  cy: number;
  color: string;
  isAnomaly?: boolean;
  type?: string;
  isHovered?: boolean;
}

export const ChartAnnotationPin: React.FC<PinProps> = ({
  cx,
  cy,
  color,
  isAnomaly,
  isHovered,
}) => {
  return (
    <g className="cursor-pointer transition-all duration-300">
      {/* Outer pulse aura */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 12 : 8}
        fill={color}
        opacity={isAnomaly ? 0.35 : 0.2}
        className={isAnomaly ? 'animate-ping' : ''}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Mid ring */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 7 : 5}
        fill="#141417"
        stroke={color}
        strokeWidth={isHovered ? 2.5 : 1.75}
      />
      {/* Center core */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 3.5 : 2.5}
        fill={color}
      />
    </g>
  );
};
