# VisualizerAI: Universal Multi-Domain Repositioning Plan

Reposition **VisualizerAI** from a narrow tech-only architecture tool into an **all-purpose interactive visualizer** for any concept, workflow, or data domain. This retains high-value technical architecture pipelines while elevating Health & Fitness, Business & Finance, and Science & Biotech use cases with distinct visual domain bifurcation via curated emojis and expanded real-world templates.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during Phase 1 interactive clarification:
> - **Core Positioning & Headline:** Framed as an *All-Purpose Interactive Visualizer for any data or concept*.
> - **Domain Taxonomy & Organization:** Multi-domain tabs organized across **💻 Tech & Systems**, **🏃 Health & Fitness**, **💼 Business & Finance**, and **🔬 Science & Biotech**.
> - **Default Canvas & First Impression:** Retains the high-throughput **Instagram Feed Fan-Out Architecture** as the initial loaded canvas for first-time visitors, while highlighting multi-domain quick presets directly below with domain emoji badges.
> - **Expanded Use Cases:** Expands the library with high-fidelity real-world templates across fitness/metabolism, SaaS/corporate finance, machine learning/cloud pipelines, and biochemical/clean-tech systems.

---

## 1. Overview & Core Concept

- **What It Does:** VisualizerAI transforms unstructured natural language prompts, complex workflows, or quantitative data models into interactive, responsive visualization cards. Users can switch scenarios, adjust dynamic timeline sliders, step through end-to-end multi-tier pipelines, inspect technical annotations, live-edit specs, and export production assets (PNG, SVG, Code, JSON).
- **Target Audience / Persona:** 
  - Software engineers & systems architects modeling cloud and distributed systems.
  - Fitness coaches, kinesiologists, and athletes comparing metabolic substrate utilization and training load.
  - Product managers, founders, and finance operators modeling cohort retention, payment rails, and unit economics.
  - Scientists, researchers, and educators illustrating biochemical mechanisms and clean energy grids.
- **Key Value:** Eliminates the barrier between complex mental models and interactive visual artifacts. Users can explore trade-offs dynamically rather than staring at static, unengaging charts.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Universal Landing Experience:** The user lands on a clear hero header reading *"Turn Any Idea, Data, or System into Interactive Visuals"*. The default interactive canvas immediately showcases the 5-tier Instagram system design.
2. **Domain Discovery via Segmented Tabs:** Beneath the prompt bar, a segmented control features domain-bifurcated tabs:
   - `✨ Featured` (Curated cross-domain highlights)
   - `💻 Tech & Systems` (System design, Kafka pipelines, RAG retrieval)
   - `🏃 Health & Fitness` (Metabolic cardio timing, Zone 2 scheduling, recovery)
   - `💼 Business & Finance` (SaaS cohort NRR, Stripe payments, liquidity pools)
   - `🔬 Science & Biotech` (CRISPR prime editing, battery storage grid, RNA transcription)
3. **1-Click Card Inspiration:** Clicking any quick card populates the prompt input, loads the respective interactive model, and updates local storage persistence.
4. **Expanded Template Gallery Modal:** The gallery modal groups 16+ production-grade templates with domain filter buttons, search input, and emoji-tagged archetype badges.
5. **Live Editing & AI Refinement:** The slide-over editor supports real-time editing and natural language Gemini refinement across any domain.

### Visual Identity & Theme
- **Aesthetic Direction:** Dark graphite studio theme (`#101012` base, `#161619` cards, `#222227` active accents) following the *SaaS & Dashboard* and *Universal Frontend Design Constitution* rules.
- **Visual Domain Bifurcation:**
  - **💻 Tech & Systems:** Indigo / Cyan accents with terminal/pipeline iconography.
  - **🏃 Health & Fitness:** Emerald / Lime accents with metabolic timeline indicators.
  - **💼 Business & Finance:** Amber / Violet accents with currency and cohort indicators.
  - **🔬 Science & Biotech:** Sky / Rose accents with biochemical structure badges.
- **Typography & Formatting:** High-density tabular figures (`tabular-nums`) for all numeric counters and latency specs; clean, unboxed metadata typography with subtle bullet/slash separators.
- **Zero-Pill Discipline:** Avoids decorative pill sandwiches; filter controls are implemented as functional segmented buttons with active state feedback.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Reposition as All-Purpose instead of Splitting Products**
  - *Chosen Approach:* Maintain a single universal engine that handles pipelines, trade-off models, and schedules across tech, fitness, business, and science.
  - *Why:* Demonstrates the full flexibility of the AI-powered visualizer engine. Keeps the platform unified and provides immediate value to diverse user personas without requiring separate apps.
  - *Alternatives Considered:* Removing fitness/business templates to create a tech-only tool. Rejected as it discards rich existing interactive capabilities (e.g., metabolic crossover charts and SaaS cohort models).

- **Decision 2: Default Canvas Selection**
  - *Chosen Approach:* Keep the Instagram Feed Fan-Out architecture as the initial loaded canvas, with immediate visible access to other domain presets.
  - *Why:* The Instagram architecture provides an instant "wow" factor with its 5-stage interactive stepper, node inspection, and latency metrics, establishing production-grade quality immediately.
  - *Alternatives Considered:* Randomizing default or defaulting to cardio timeline. Rejected to prevent landing visual inconsistency and maintain strong first impressions.

- **Decision 3: Local Storage Persistence & Multi-Domain State**
  - *Chosen Approach:* Save active domain category and last loaded template in `localStorage`.
  - *Why:* Prevents loss of context when refreshing and ensures users stay in their selected domain workflow.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Viewport (App.tsx)                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ Header: Logo + Domain Stats       │ Modals: TemplateGallery, Editor,   │
│ + Tour, Edit, Share, Export       │ Export, Share, Onboarding Tour     │
├───────────────────────────────────┴────────────────────────────────────┤
│ PromptBar.tsx                                                          │
│  - Universal Headline & Subtitle                                       │
│  - Natural Language Input + Gemini Generator Bridge                    │
│  - Domain Segmented Tabs (💻 Tech, 🏃 Health, 💼 Business, 🔬 Science) │
│  - Quick Example Architecture & Model Cards with Active Checkmarks     │
├────────────────────────────────────────────────────────────────────────┤
│ InfographicCanvas.tsx                                                  │
│  - StepperPipeline: Node graph, tier lanes, latency telemetry          │
│  - ScenarioArea: Metabolic crossover, NRR retention, trade-offs        │
│  - DynamicSliderSchedule: Interactive weekly volume & fatigue models   │
├────────────────────────────────────────────────────────────────────────┤
│ Utilities & Engine                                                     │
│  - storage.ts (Local draft persistence & schema validator)             │
│  - templateGalleryData.ts (16+ multi-domain templates with emojis)     │
│  - sampleInfographics.ts (Multi-domain dataset)                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping
- `PromptBar.tsx`:
  - `activeDomain`: Filter state (`'Featured' | 'Tech' | 'Health' | 'Business' | 'Science'`).
  - `FEATURED_MODELS`: Curated cards for each domain with domain emojis, metrics, and starter prompts.
  - `onSelectSample`: Updates canvas data and synchronizes local storage.
- `TemplateGallery.tsx`:
  - Category filter tabs updated to `['All Domains', '💻 Tech', '🏃 Health & Fitness', '💼 Business', '🔬 Science']`.
  - Added new sample templates: e.g. *CRISPR Cas9 vs Prime Editing*, *SaaS Churn Cohort Dynamics*, *High-Performance Zone 2 Cardio Engine*, *Uber Geospatial H3 Dispatch*.
- `App.tsx`:
  - Contextual banner displaying the active domain category and card archetype.
  - Seamless persistence across refresh.
