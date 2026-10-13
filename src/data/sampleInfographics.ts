import { MinimalInfographicData } from '../types/infographic';

export const SAMPLE_INFOGRAPHICS: MinimalInfographicData[] = [
  // 1. Image 1: Cardio Timing & Substrate Utilization (Scenario Switcher + Area Chart)
  {
    id: 'sample-cardio-timing',
    title: 'Cardio Timing & Substrate Utilization',
    subtitle: 'Energy source ratio (% Fat vs % Glycogen) over a 75-minute exercise timeline',
    cardType: 'scenario-area',
    switcherConfig: {
      switchLabel: 'Workout Sequence:',
      activeScenarioId: 'post-workout',
      scenarios: [
        {
          id: 'post-workout',
          label: 'Elliptical After Lift (Post-Workout)',
          metrics: [
            {
              id: 'm1',
              label: 'Cardio Fat Burn Ratio',
              value: '95%',
              note: 'Pure fat oxidation during cardio',
            },
            {
              id: 'm2',
              label: 'Cardio Glycogen Fuel',
              value: '5%',
              note: 'Minimal glucose dependency',
            },
            {
              id: 'm3',
              label: 'Lifting Energy Availability',
              value: '100%',
              note: 'Fresh glycogen for heavy lifts',
            },
          ],
          chartData: {
            labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m', '50m', '55m', '60m', '65m', '70m', '75m'],
            series: [
              {
                name: 'Glycogen Burn (%)',
                color: '#60a5fa', // Soft blue
                fillColor: '#3b82f6',
                data: [80, 72, 63, 52, 42, 32, 22, 15, 10, 6, 4, 3, 3, 2, 1, 1],
              },
              {
                name: 'Fat Oxidation (%)',
                color: '#eab308', // Warm yellow/olive
                fillColor: '#ca8a04',
                data: [20, 28, 37, 48, 58, 68, 78, 85, 90, 94, 96, 97, 97, 98, 99, 99],
              },
            ],
          },
          insightHighlight: {
            title: 'Metabolic Superiority:',
            text: 'Lifting first depletes muscle glycogen stores over 60 minutes. Transitioning immediately to 15 minutes of low-intensity cardio forces the body to oxidize ~95% pure fat without compromising hypertrophy adaptations.',
          },
        },
        {
          id: 'pre-workout',
          label: 'Elliptical Before Lift (Pre-Workout)',
          metrics: [
            {
              id: 'm1_pre',
              label: 'Cardio Fat Burn Ratio',
              value: '35%',
              note: 'Sub-optimal fat oxidation',
            },
            {
              id: 'm2_pre',
              label: 'Cardio Glycogen Fuel',
              value: '65%',
              note: 'Prematurely burns lifting fuel',
            },
            {
              id: 'm3_pre',
              label: 'Lifting Energy Availability',
              value: '45%',
              note: 'Compromised strength and power output',
            },
          ],
          chartData: {
            labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m', '50m', '55m', '60m', '65m', '70m', '75m'],
            series: [
              {
                name: 'Glycogen Burn (%)',
                color: '#60a5fa',
                fillColor: '#3b82f6',
                data: [85, 82, 79, 75, 71, 68, 65, 62, 58, 55, 52, 50, 48, 45, 42, 40],
              },
              {
                name: 'Fat Oxidation (%)',
                color: '#eab308',
                fillColor: '#ca8a04',
                data: [15, 18, 21, 25, 29, 32, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60],
              },
            ],
          },
          insightHighlight: {
            title: 'Glycogen Depletion Penalty:',
            text: 'Cardio prior to resistance training drains fast-twitch glycogen reserves, causing early central nervous system fatigue and a 55% reduction in top-end strength performance.',
          },
        },
      ],
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },

  // 2. Image 2: Weekly Stress & Fat Oxidation Schedule (Dynamic Slider + Combo Bar/Line)
  {
    id: 'sample-weekly-stress',
    title: 'Weekly Stress & Fat Oxidation Schedule',
    subtitle: '5-Day Lifting Split + Dynamic 45-min Zone 2 Cardio Frequency',
    cardType: 'dynamic-slider-schedule',
    sliderConfig: {
      label: 'Zone 2 Cardio Days / Week',
      min: 1,
      max: 7,
      step: 1,
      defaultValue: 5,
      unit: 'Days',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      liftingBase: [75, 75, 82, 0, 75, 70, 0], // Mon, Tue, Wed, Fri, Sat are lifting days
      metricFormulas: {
        cnsBase: 300,
        fatOxBase: 75,
      },
    },
    currentSliderValue: 5,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },

  // 3. Image 3: Text-to-UI JSON Pipeline (Interactive Flow Diagram + Stepper Tabs)
  {
    id: 'sample-pipeline-architecture',
    title: 'Text-to-UI JSON Pipeline',
    subtitle: 'Separation of concerns between LLM reasoning and deterministic UI rendering',
    cardType: 'stepper-pipeline',
    pipelineConfig: {
      currentStep: 1,
      nodes: [
        {
          id: 'prompt',
          label: 'User Prompt',
          subLabel: 'Unstructured Text',
          tag: 'USER INPUT',
          activeInSteps: [1],
          x: 18,
          y: 30,
        },
        {
          id: 'llm',
          label: 'LLM Engine',
          subLabel: 'Intent & Math Reason',
          tag: 'REASONING',
          activeInSteps: [2],
          x: 42,
          y: 30,
        },
        {
          id: 'json',
          label: 'JSON Schema',
          subLabel: 'Data, Labels, Controls',
          tag: 'STRICT JSON',
          activeInSteps: [3],
          x: 74,
          y: 30,
        },
        {
          id: 'react',
          label: 'React App',
          subLabel: 'Safe JSON Consumer',
          tag: 'RENDER UI',
          activeInSteps: [4],
          x: 44,
          y: 72,
        },
        {
          id: 'export',
          label: 'Export API',
          subLabel: 'Code / Image / Media',
          tag: 'GEN MEDIA',
          activeInSteps: [5],
          x: 74,
          y: 72,
        },
      ],
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Step 1: Unstructured User Prompt',
          tag: 'USER INPUT',
          description:
            'The user enters a natural language prompt describing a complex visualization, data flow, or system architecture.',
          activeNodeId: 'prompt',
        },
        {
          stepNumber: 2,
          stepTitle: 'Step 2: Server-Side LLM Engine',
          tag: 'REASONING',
          description:
            'Gemini 3.8 Flash parses entities, performs mathematical extrapolations, and selects the ideal visualization archetype without hallucinating layout HTML.',
          activeNodeId: 'llm',
        },
        {
          stepNumber: 3,
          stepTitle: 'Step 3: Validated Strict JSON Schema',
          tag: 'STRICT JSON',
          description:
            'Structured contracts guarantee numeric series integrity, control parameters, and localized text annotations for 100% deterministic client rendering.',
          activeNodeId: 'json',
        },
        {
          stepNumber: 4,
          stepTitle: 'Step 4: Interactive React Consumer',
          tag: 'RENDER UI',
          description:
            'React components mount clean vector SVGs, binding slider gestures, tab state, and hover tooltips without layout jitter.',
          activeNodeId: 'react',
        },
        {
          stepNumber: 5,
          stepTitle: 'Step 5: Multi-Format Asset Export',
          tag: 'GEN MEDIA',
          description:
            'Instant high-resolution PNG rasterization, vector SVG extraction, and clean React code copy ready for slides, documentation, and web apps.',
          activeNodeId: 'export',
        },
      ],
    },
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
];
