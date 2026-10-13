export type InfographicCardType =
  | 'scenario-area'
  | 'dynamic-slider-schedule'
  | 'stepper-pipeline'
  | 'combo-chart'
  | 'area-chart'
  | 'funnel';

export type AnnotationType =
  | 'anomaly'
  | 'peak'
  | 'trough'
  | 'crossover'
  | 'inflection'
  | 'equilibrium'
  | 'milestone'
  | 'optimal'
  | 'warning';

export interface ChartAnnotation {
  pointIndex: number;
  label: string; // e.g. "Metabolic Crossover Point", "Dark Pool Liquidity Shock"
  tag?: string; // e.g. "ANOMALY", "CROSSOVER", "PEAK SURGE", "EQUILIBRIUM"
  type?: AnnotationType;
  explanation: string; // Context-aware explanation of why this point matters
  seriesIndex?: number;
  metricDelta?: string; // e.g. "Fat 58% > Glycogen 42%", "+46 GWh surplus", "-18.4 bps"
  accentColor?: string;
  badge?: string;
}

export interface MetricCardItem {
  id: string;
  label: string;
  value: string | number;
  note?: string;
  highlightColor?: string;
}

export interface ScenarioOption {
  id: string;
  label: string;
  metrics: MetricCardItem[];
  chartData: {
    labels: string[];
    series: Array<{
      name: string;
      color: string;
      data: number[];
      fillColor?: string;
    }>;
    annotations?: ChartAnnotation[];
  };
  insightHighlight?: {
    title: string;
    text: string;
  };
}

export interface SliderScheduleConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  labels: string[]; // e.g. Mon, Tue, Wed, Thu, Fri, Sat, Sun
  liftingBase: number[]; // baseline numbers for primary bars
  primaryBase?: number[];
  accentBase?: number[];
  metricFormulas?: {
    cnsBase?: number;
    fatOxBase?: number;
    kpi1Base?: number;
    kpi2Base?: number;
  };
  seriesNames?: {
    primaryBar: string;
    primaryColor?: string;
    accentBar: string;
    accentColor?: string;
    lineCurve: string;
    lineColor?: string;
    unit?: string;
  };
  kpiLabels?: {
    kpi1Label: string;
    kpi1Unit?: string;
    kpi1Subtext?: string;
    kpi2Label: string;
    kpi2Unit?: string;
    kpi2Subtext?: string;
    kpi3Label: string;
    kpi3Subtext?: string;
    balanceThresholds?: {
      low: string;
      mid: string;
      high: string;
    };
  };
  annotations?: ChartAnnotation[];
}

export interface PipelineConnection {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
  throughput?: string;
  style?: 'solid' | 'dashed';
}

export interface PipelineNode {
  id: string;
  label: string;
  subLabel: string;
  tag?: string;
  metric?: string;
  tier?: 'client' | 'gateway' | 'compute' | 'cache' | 'storage' | 'event' | string;
  icon?: string;
  activeInSteps: number[];
  x?: number;
  y?: number;
  technicalSpecs?: string[];
}

export interface PipelineStep {
  stepNumber: number;
  stepTitle: string;
  tag: string;
  description: string;
  activeNodeId?: string;
  activeNodeIds?: string[];
  latency?: string;
  architecturalRationale?: string;
  failureMode?: string;
}

export interface MinimalInfographicData {
  id: string;
  title: string;
  subtitle: string;
  cardType: InfographicCardType;
  
  // 1. Scenario Switcher (e.g. Elliptical After Lift vs Before Lift)
  switcherConfig?: {
    switchLabel: string;
    activeScenarioId: string;
    scenarios: ScenarioOption[];
  };

  // 2. Dynamic Slider Schedule (e.g. Zone 2 Cardio Days or Grid Battery Capacity)
  sliderConfig?: SliderScheduleConfig;
  currentSliderValue?: number;

  // 3. Pipeline Stepper / System Architecture Flow
  pipelineConfig?: {
    nodes: PipelineNode[];
    steps: PipelineStep[];
    connections?: PipelineConnection[];
    currentStep?: number;
    architectureTierLabels?: string[];
  };

  // Static / Fallback Chart & Metrics
  metrics?: MetricCardItem[];
  chartData?: {
    labels: string[];
    series: Array<{
      name: string;
      color: string;
      data: number[];
      type?: 'bar' | 'line' | 'area';
    }>;
    annotations?: ChartAnnotation[];
  };

  annotations?: ChartAnnotation[];

  // Bottom Insight Banner
  insightHighlight?: {
    title: string;
    text: string;
  };

  originalPrompt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CloudProject {
  id: string;
  name: string;
  updatedAt: number;
  data: MinimalInfographicData;
}
