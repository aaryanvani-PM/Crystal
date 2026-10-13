import { ChartAnnotation, AnnotationType } from '../types/infographic';

export interface SeriesPointBreakdown {
  name: string;
  color: string;
  value: number;
  formattedValue: string;
}

export interface ResolvedAnnotation {
  pointIndex: number;
  label: string;
  tag: string;
  type: AnnotationType;
  explanation: string;
  metricDelta?: string;
  color: string;
  badge?: string;
  seriesBreakdown: SeriesPointBreakdown[];
  isAnomaly: boolean;
  isKeyMilestone: boolean;
}

interface EngineInput {
  labels: string[];
  series: Array<{
    name: string;
    color: string;
    data: number[];
  }>;
  pointIndex: number;
  predefinedAnnotations?: ChartAnnotation[];
  contextTitle?: string;
  contextSubtitle?: string;
  unit?: string;
}

/**
 * Returns color mapping for different annotation types
 */
export function getAnnotationColor(type: AnnotationType): string {
  switch (type) {
    case 'anomaly':
    case 'warning':
      return '#f43f5e'; // Rose / Red for anomalies
    case 'crossover':
      return '#38bdf8'; // Sky blue for crossover
    case 'peak':
    case 'optimal':
      return '#34d399'; // Emerald for peak/optimal
    case 'trough':
      return '#fbbf24'; // Amber for trough
    case 'inflection':
      return '#a78bfa'; // Purple for inflection
    case 'equilibrium':
    case 'milestone':
    default:
      return '#38bdf8'; // Cyan
  }
}

/**
 * Returns icon or symbol character for tags
 */
export function getAnnotationIcon(type: AnnotationType): string {
  switch (type) {
    case 'anomaly':
    case 'warning':
      return '⚠️';
    case 'crossover':
      return '⚡';
    case 'peak':
      return '▲';
    case 'optimal':
      return '★';
    case 'trough':
      return '▼';
    case 'inflection':
      return '∿';
    case 'equilibrium':
      return '⚖️';
    case 'milestone':
      return '◆';
    default:
      return '●';
  }
}

/**
 * Analyze an entire series and detect statistical anomalies and structural milestones
 */
export function detectSeriesCharacteristics(
  labels: string[],
  series: Array<{ name: string; color: string; data: number[] }>
) {
  const n = labels.length;
  const milestones: Record<number, {
    type: AnnotationType;
    tag: string;
    label: string;
    explanation: string;
    metricDelta?: string;
    color: string;
    isAnomaly: boolean;
  }> = {};

  if (n === 0 || series.length === 0) return milestones;

  // 1. Detect Crossovers between 2 series (e.g. fat vs glycogen, generation vs demand, canary vs baseline)
  if (series.length >= 2) {
    const s1 = series[0].data;
    const s2 = series[1].data;
    for (let i = 1; i < n; i++) {
      const prevDiff = s1[i - 1] - s2[i - 1];
      const currDiff = s1[i] - s2[i];

      // Sign flipped or landed right on equality
      if ((prevDiff < 0 && currDiff >= 0) || (prevDiff > 0 && currDiff <= 0) || Math.abs(currDiff) <= 1) {
        const leader = currDiff >= 0 ? series[0].name : series[1].name;
        const trailer = currDiff >= 0 ? series[1].name : series[0].name;
        milestones[i] = {
          type: 'crossover',
          tag: 'CROSSOVER POINT',
          label: `${series[0].name} & ${series[1].name} Parity`,
          explanation: `Equilibrium threshold reached at ${labels[i]}. ${leader} overtakes ${trailer} (${s1[i]} vs ${s2[i]}), initiating a strategic shift in regime.`,
          metricDelta: `${s1[i]} vs ${s2[i]}`,
          color: '#38bdf8',
          isAnomaly: false,
        };
      }
    }
  }

  // 2. Detect Peaks, Troughs, and Sudden Spikes / Anomalies for primary series
  const primarySeries = series[0];
  const vals = primarySeries.data;
  if (vals.length > 0) {
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const maxIdx = vals.indexOf(maxVal);
    const minIdx = vals.indexOf(minVal);

    // Compute mean and standard deviation for anomaly detection
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const stdDev = Math.sqrt(variance);

    // Peak
    if (maxIdx >= 0 && maxVal > minVal) {
      if (!milestones[maxIdx]) {
        milestones[maxIdx] = {
          type: 'peak',
          tag: 'CYCLE PEAK',
          label: `Peak ${primarySeries.name}`,
          explanation: `Maximum observed level reached at ${labels[maxIdx]} with ${maxVal}. Operates at 100% relative capacity ceiling.`,
          metricDelta: `High: ${maxVal}`,
          color: '#34d399',
          isAnomaly: false,
        };
      }
    }

    // Trough
    if (minIdx >= 0 && minVal < maxVal && minIdx !== 0 && minIdx !== n - 1) {
      if (!milestones[minIdx]) {
        milestones[minIdx] = {
          type: 'trough',
          tag: 'TROUGH FLOOR',
          label: `Minimum ${primarySeries.name}`,
          explanation: `Trough valley observed at ${labels[minIdx]} (${minVal}). Represents optimal exhaustion or recovery baseline.`,
          metricDelta: `Low: ${minVal}`,
          color: '#fbbf24',
          isAnomaly: false,
        };
      }
    }

    // Statistical Anomaly / Sudden Slope Discontinuity (> 1.6 std dev step change)
    for (let i = 1; i < n; i++) {
      const stepDelta = Math.abs(vals[i] - vals[i - 1]);
      if (stdDev > 4 && stepDelta > 1.6 * stdDev && !milestones[i]) {
        const direction = vals[i] > vals[i - 1] ? 'surge' : 'sharp decline';
        milestones[i] = {
          type: 'anomaly',
          tag: 'ANOMALY DETECTED',
          label: `Sudden ${direction.toUpperCase()}`,
          explanation: `Discontinuous delta of ${vals[i] - vals[i - 1] > 0 ? '+' : ''}${vals[i] - vals[i - 1]} between ${labels[i - 1]} and ${labels[i]}. Statistical variance exceeds standard operating tolerance.`,
          metricDelta: `${vals[i] - vals[i - 1] > 0 ? '+' : ''}${vals[i] - vals[i - 1]}`,
          color: '#f43f5e',
          isAnomaly: true,
        };
      }
    }
  }

  return milestones;
}

/**
 * Resolves a context-aware dynamic callout annotation for any hovered chart coordinate
 */
export function resolveChartAnnotation({
  labels,
  series,
  pointIndex,
  predefinedAnnotations,
  contextTitle = '',
  contextSubtitle = '',
  unit = '',
}: EngineInput): ResolvedAnnotation {
  const pointLabel = labels[pointIndex] || `Point #${pointIndex + 1}`;

  // 1. Build series breakdown for this point
  const seriesBreakdown: SeriesPointBreakdown[] = series.map((s) => {
    const val = s.data[pointIndex] ?? 0;
    const formattedValue = unit ? `${val} ${unit}` : `${val}`;
    return {
      name: s.name,
      color: s.color,
      value: val,
      formattedValue,
    };
  });

  // 2. Check if there is an explicit curated annotation for this pointIndex
  const explicit = predefinedAnnotations?.find((a) => a.pointIndex === pointIndex);
  if (explicit) {
    const type = explicit.type || 'milestone';
    return {
      pointIndex,
      label: explicit.label,
      tag: explicit.tag || (type === 'anomaly' ? 'ANOMALY' : 'KEY MILESTONE'),
      type,
      explanation: explicit.explanation,
      metricDelta: explicit.metricDelta || (seriesBreakdown[0] ? seriesBreakdown[0].formattedValue : undefined),
      color: explicit.accentColor || getAnnotationColor(type),
      badge: explicit.badge,
      seriesBreakdown,
      isAnomaly: type === 'anomaly' || type === 'warning',
      isKeyMilestone: true,
    };
  }

  // 3. Check characteristics computed from the dataset
  const characteristics = detectSeriesCharacteristics(labels, series);
  const detected = characteristics[pointIndex];
  if (detected) {
    return {
      pointIndex,
      label: detected.label,
      tag: detected.tag,
      type: detected.type,
      explanation: detected.explanation,
      metricDelta: detected.metricDelta,
      color: detected.color,
      seriesBreakdown,
      isAnomaly: detected.isAnomaly,
      isKeyMilestone: true,
    };
  }

  // 4. Default dynamic context-aware interpretation
  const primary = seriesBreakdown[0];
  const secondary = seriesBreakdown[1];

  let explanation = '';
  let tag = 'DATA POINT';
  let type: AnnotationType = 'milestone';
  let metricDelta = primary ? primary.formattedValue : undefined;

  if (secondary && primary) {
    const total = primary.value + secondary.value;
    const pct0 = total > 0 ? Math.round((primary.value / total) * 100) : 50;
    const pct1 = 100 - pct0;
    tag = `${primary.name.toUpperCase().slice(0, 14)} RATIO`;
    explanation = `At ${pointLabel}, ${primary.name} represents ${primary.formattedValue} (${pct0}%) while ${secondary.name} holds ${secondary.formattedValue} (${pct1}%). Operating balance remains steady.`;
    metricDelta = `${pct0}% vs ${pct1}%`;
  } else if (primary) {
    tag = 'CURRENT VALUE';
    explanation = `${primary.name} records ${primary.formattedValue} at ${pointLabel}. Within baseline projection envelope.`;
  } else {
    explanation = `Selected step: ${pointLabel}.`;
  }

  return {
    pointIndex,
    label: `${pointLabel} Status`,
    tag,
    type,
    explanation,
    metricDelta,
    color: '#60a5fa',
    seriesBreakdown,
    isAnomaly: false,
    isKeyMilestone: false,
  };
}

/**
 * Returns all key milestone annotations for a chart (for render pins on the SVG curve)
 */
export function getAllChartMilestones(
  labels: string[],
  series: Array<{ name: string; color: string; data: number[] }>,
  predefined?: ChartAnnotation[],
  contextTitle?: string
): ResolvedAnnotation[] {
  const result: ResolvedAnnotation[] = [];
  const characteristics = detectSeriesCharacteristics(labels, series);

  // Predefined annotations take precedence
  const explicitIndices = new Set<number>();
  if (predefined) {
    for (const ann of predefined) {
      if (ann.pointIndex >= 0 && ann.pointIndex < labels.length) {
        explicitIndices.add(ann.pointIndex);
        result.push(
          resolveChartAnnotation({
            labels,
            series,
            pointIndex: ann.pointIndex,
            predefinedAnnotations: predefined,
            contextTitle,
          })
        );
      }
    }
  }

  // Add algorithmic milestones that were not explicitly overwritten
  Object.keys(characteristics).forEach((idxStr) => {
    const idx = parseInt(idxStr, 10);
    if (!explicitIndices.has(idx)) {
      result.push(
        resolveChartAnnotation({
          labels,
          series,
          pointIndex: idx,
          contextTitle,
        })
      );
    }
  });

  return result.sort((a, b) => a.pointIndex - b.pointIndex);
}
