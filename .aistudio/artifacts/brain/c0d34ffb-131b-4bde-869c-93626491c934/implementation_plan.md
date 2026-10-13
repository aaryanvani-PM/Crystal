# Minimalist Gemini Interactive Infographic Studio

A minimalist, distraction-free web app that transforms any topic, data, or scenario into authentic Gemini-style interactive infographic cards featuring dynamic scenario switchers, parameter sliders, pipeline walkthrough tabs, and code/image exports.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following revisions directly address the user's feedback and reference screenshots:

- **Confirmed Minimalist Website Aesthetics**:
  - The website chrome is stripped down to an ultra-clean, matte dark canvas (`#121214` / `#18181b`) with zero dashboard clutter, no noisy sidebars, and no contrasting colored cards on the site layout.
  - Saturated/vibrant colors are reserved strictly *inside the charts and graphs for bifurcations* (e.g. pink bars for lifting stress, soft yellow for cardio stress, cyan/pastel blue for oxidation stimulus/glycogen curves).
- **Confirmed Interactive In-Card Controls** (as seen in user's attached Gemini screenshots):
  1. *Scenario & Mode Switchers*: Segmented switches right inside the card (e.g., `Elliptical After Lift (Post-Workout)` vs `Elliptical Before Lift (Pre-Workout)`) that recalculate the curves and metrics.
  2. *Dynamic Parameter Sliders*: Interactive range sliders (e.g., `Zone 2 Cardio Days / Week: 1-7 Days`) that dynamically recalculate and animate the chart points and KPI totals in real-time.
  3. *Step-by-Step Pipeline & Architecture Steppers*: Interactive tabs (e.g., `1. Prompt`, `2. LLM`, `3. JSON`, `4. React`, `5. Render/Export`) with Previous/Next buttons, active step details, and connected architecture node maps.
- **Dual-Mode Editing & Export**:
  - Clean inline editing + AI chat prompt for prompt refinement.
  - Crisp PNG image export (retina ready for pitch decks and posts), vector SVG download, and clean standalone React/HTML code.

---

### 1. Overview & Core Concept

- **What It Does**: Users throw any text, problem, scientific theory, business scenario, or raw data into a minimalist, chat-like prompt box. Gemini processes the intent and outputs a beautiful, interactive card that feels exactly like a native Gemini response.
- **Target Audience**: Anyone wanting to explain complex ideas, data patterns, or workflows visually for presentations, team syncs, blogs, or marketing posts.
- **Key Value**: Turns dense cognitive concepts into intuitive visual mechanisms that users can physically interact with (flipping scenarios, dragging sliders, clicking steps).

---

### 2. User Experience & Visual Design

#### Layout Structure

- **Minimalist Top Bar**:
  - Subtle wordmark (`InfographAI`), quiet status, and essential action icons (Export PNG/SVG, Copy Code, Share Link, Cloud Saved).
- **Centered Prompt & Ingestion**:
  - Clean, distraction-free input bar with prompt inspiration pills (e.g. `Cardio Timing & Substrates`, `Weekly Stress & Recovery Schedule`, `Text-to-UI JSON Pipeline`, `SaaS Conversion Funnel`).
- **Hero Interactive Card**:
  - Matte dark surface (`#18181b` / `#1e1e24`), subtle 1px border (`#27272a`).
  - Title in clean Plus Jakarta Sans, italicized/muted subtitle explaining the thesis.
  - Interactive controls block (Scenario Switcher / Slider / Stepper).
  - 3 clean KPI metric blocks with tabular bold numbers and italicized explanatory notes.
  - The chart or diagram:
    - *Area / Line Curve*: Multi-substrate area fills with contrasting bifurcation colors (e.g. golden-olive vs blue-grey), smooth Catmull-Rom curves, and hover tooltips.
    - *Combo Bar + Line Schedule*: Pink pill bars, yellow cardio bars, and overlaid cyan spline line over days of the week.
    - *Architecture Flow & Stepper*: Connected pill nodes with flow arrows, active step highlighting, and rich step detail panel.
  - Bottom takeaway card with prominent highlight ("Metabolic Superiority", "Key Insight").

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Pure Minimalist Canvas vs Multi-Section Dashboard
- **Chosen Approach**: Completely replace the multi-section dashboard layout with a focused, single-view canvas. The user enters a prompt, and the resulting Gemini card takes center stage.
- **Why**: Perfectly aligns with the user's requirement and screenshots. Avoids generic SaaS dashboard aesthetic.

#### Decision 2: In-Card Interactive Mechanisms (Stateful Logic)
- **Chosen Approach**: When Gemini generates an infographic, it generates multiple data states (e.g., Scenario A vs Scenario B, or Slider value mapping, or Step 1-5 definitions) so that clicking the switch, dragging the slider, or stepping through the pipeline immediately updates the chart in real time on the client with zero latency.
- **Why**: Recreates the magic of Gemini's interactive response cards where users explore the problem dynamically.

#### Decision 3: Local + Cloud Persistence without UI Noise
- **Chosen Approach**: Quiet auto-saving with subtle "Saved" indicator in the top bar and a minimal modal for share links and exports.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│               Minimalist Web Canvas (Matte Dark #121214)               │
│                                                                        │
│  [Top Bar: InfographAI · Export PNG/SVG · Code · Share Link]           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Prompt Input Bar: "Throw any problem, topic, or raw data here..."│  │
│  │ Presets: [Cardio Timing] [Weekly Stress] [Text-to-UI Pipeline]   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Hero Gemini Interactive Card (#18181b)                           │  │
│  │                                                                  │  │
│  │ 1. Header & Subtitle                                             │  │
│  │ 2. Interactive Switcher / Slider / Stepper Tabs                   │  │
│  │ 3. 3 KPI Metric Blocks (with italicized notes)                   │  │
│  │ 4. Dynamic Chart (Area / Combo Bar+Line / Node Diagram)          │  │
│  │ 5. Legend (● Pink Lifting  ● Yellow Cardio  ● Blue Stimulus)     │  │
│  │ 6. Bottom Highlight Insight Banner                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Enhanced Interactive Schema

```typescript
export interface InteractiveInfographic {
  id: string;
  title: string;
  subtitle: string;
  topicKicker?: string;
  type: 'scenario-area' | 'dynamic-slider-schedule' | 'stepper-pipeline' | 'funnel' | 'comparison-bar';
  
  // Scenario Switcher (e.g. Post-Workout vs Pre-Workout)
  scenarios?: Array<{
    id: string;
    label: string;
    metrics: Array<{ label: string; value: string; note: string }>;
    chartData: {
      labels: string[];
      series: Array<{ name: string; color: string; data: number[] }>;
    };
    insightHighlight: { title: string; text: string };
  }>;

  // Dynamic Slider Configuration (e.g. Zone 2 Cardio Days / Week: 1-7)
  sliderConfig?: {
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit: string;
    // Map slider value to metrics and chart data
    calculateState: (value: number) => {
      metrics: Array<{ label: string; value: string; note: string }>;
      series: Array<{ name: string; color: string; type: 'bar' | 'line'; data: number[] }>;
    };
  };

  // Pipeline Stepper (e.g. 1. Prompt -> 2. LLM -> 3. JSON -> 4. React -> 5. Export)
  pipelineConfig?: {
    nodes: Array<{ id: string; label: string; subLabel: string; activeInSteps: number[] }>;
    steps: Array<{
      stepNumber: number;
      stepTitle: string;
      tag: string;
      description: string;
    }>;
  };

  // Current active interactive state
  activeScenarioId?: string;
  activeSliderValue?: number;
  activeStepIndex?: number;
}
```
