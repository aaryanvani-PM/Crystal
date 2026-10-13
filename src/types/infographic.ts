export type InfographicCardType =
  | 'scenario-area'
  | 'dynamic-slider-schedule'
  | 'stepper-pipeline'
  | 'combo-chart'
  | 'area-chart'
  | 'funnel';

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
  // Baseline lifting split per day (0-100)
  liftingBase: number[];
  // Multipliers or mapping for cardio
  metricFormulas: {
    cnsBase: number;
    fatOxBase: number;
  };
}

export interface PipelineNode {
  id: string;
  label: string;
  subLabel: string;
  tag?: string;
  activeInSteps: number[];
  x: number;
  y: number;
}

export interface PipelineStep {
  stepNumber: number;
  stepTitle: string;
  tag: string;
  description: string;
  activeNodeId?: string;
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

  // 2. Dynamic Slider Schedule (e.g. Zone 2 Cardio Days: 1-7 Days)
  sliderConfig?: SliderScheduleConfig;
  currentSliderValue?: number;

  // 3. Pipeline Stepper (e.g. Prompt -> LLM -> JSON -> React -> Export)
  pipelineConfig?: {
    nodes: PipelineNode[];
    steps: PipelineStep[];
    currentStep: number;
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
  };

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
