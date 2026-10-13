import { MinimalInfographicData } from '../types/infographic';
import { SAMPLE_INFOGRAPHICS } from './sampleInfographics';

export type TemplateCategory = 'All' | 'Business' | 'Tech' | 'Education' | 'Health';

export interface TemplateItem {
  id: string;
  sampleIndex: number;
  title: string;
  subtitle: string;
  category: 'Business' | 'Tech' | 'Education' | 'Health';
  subCategory: string;
  archetype: 'stepper-pipeline' | 'scenario-area' | 'dynamic-slider-schedule';
  archetypeLabel: string;
  complexity: 'Production-Grade' | 'Advanced' | 'Enterprise';
  description: string;
  keyMetrics: Array<{ label: string; value: string }>;
  tags: string[];
  starterPrompt: string;
  data: MinimalInfographicData;
}

export const TEMPLATES_DATA: TemplateItem[] = [
  // 1. Business: SaaS Pricing & Churn Cohorts
  {
    id: 'template-saas-pricing',
    sampleIndex: 2,
    title: 'SaaS Contract Models & Cohort Expansion',
    subtitle: 'Annual upfront commitments vs monthly rolling subscriptions over 24-month horizon',
    category: 'Business',
    subCategory: 'SaaS & Subscriptions',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Enterprise',
    description: 'Models customer lifetime value, Net Revenue Retention (NRR), and logo retention dynamics to present recurring revenue strategy to executive boards.',
    keyMetrics: [
      { label: 'Net Revenue Retention', value: '128%' },
      { label: '24-Mo Cash Flow', value: '$2.84M' },
      { label: 'Annual Logo Churn', value: '0.8%/mo' },
    ],
    tags: ['SaaS', 'NRR', 'MRR', 'LTV', 'Cohort Retention', 'Financial Modeling'],
    starterPrompt: 'Compare Annual Upfront commitments (-18% discount) vs Monthly Rolling subscriptions over a 24-month horizon showing Net Revenue Retention (128% vs 88%), logo churn, and customer LTV.',
    data: SAMPLE_INFOGRAPHICS[2],
  },

  // 2. Business: Stripe Payment Settlement
  {
    id: 'template-stripe-settlement',
    sampleIndex: 11,
    title: 'Stripe Global Payment Settlement Architecture',
    subtitle: 'High-volume transaction ledger, distributed idempotency, and ISO 8583 banking rails',
    category: 'Business',
    subCategory: 'FinTech & Payments',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive System Architecture Flow',
    complexity: 'Production-Grade',
    description: 'End-to-end payment authorization, zero-token vaulting, multi-region idempotent settlement, and immutable double-entry ledger bookkeeping.',
    keyMetrics: [
      { label: 'P99 Auth Latency', value: '185ms' },
      { label: 'Idempotency TTL', value: '24 Hours' },
      { label: 'Peak Throughput', value: '12,500 TPS' },
    ],
    tags: ['FinTech', 'ISO 8583', 'Idempotency', 'Double-Entry', 'PCI Vault', 'Redis'],
    starterPrompt: 'Architect Stripe global payment settlement engine with client tokenization, distributed Redis idempotency vault, ISO 8583 bank authorization, and immutable double-entry ledger.',
    data: SAMPLE_INFOGRAPHICS[11],
  },

  // 3. Business: Smart Order Router Slippage
  {
    id: 'template-trading-sor',
    sampleIndex: 8,
    title: 'Algorithmic Order Routing & Slippage',
    subtitle: 'Institutional multi-venue dark pool routing vs single lit exchange fill execution',
    category: 'Business',
    subCategory: 'Quantitative Finance',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Advanced',
    description: 'Demonstrates microsecond order slice routing, dark pool hidden liquidity sweeps, and price impact minimization for institutional trade desks.',
    keyMetrics: [
      { label: 'Net Slippage Delta', value: '-18.4 bps' },
      { label: 'Lit Toxicity Shield', value: '94.2%' },
      { label: 'Order Fill Ratio', value: '98.6%' },
    ],
    tags: ['FinTech', 'SOR', 'Dark Pools', 'Slippage', 'Execution Algorithms', 'Market Microstructure'],
    starterPrompt: 'Compare algorithmic multi-venue dark pool order routing against single lit exchange execution slippage and fill probability for institutional trades.',
    data: SAMPLE_INFOGRAPHICS[8],
  },

  // 4. Business: E-Commerce Mobile Checkout Funnel
  {
    id: 'template-checkout-pipeline',
    sampleIndex: 6,
    title: 'E-Commerce Mobile Checkout Funnel',
    subtitle: '5-step conversion dropoff optimization from cart reservation to biometric settlement',
    category: 'Business',
    subCategory: 'E-Commerce & Conversion',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive Stepper Pipeline',
    complexity: 'Production-Grade',
    description: 'Visualizes micro-conversion checkpoints, passkey biometric authentication, and friction elimination in high-growth mobile shopping flows.',
    keyMetrics: [
      { label: 'End-to-End Conversion', value: '64.2%' },
      { label: 'Passkey Auth Speed', value: '450ms' },
      { label: 'Cart Dropoff Rate', value: '14.8%' },
    ],
    tags: ['E-Commerce', 'Checkout', 'Passkeys', 'Conversion Rate', 'Cart Abandonment'],
    starterPrompt: 'Map a frictionless 5-step mobile checkout funnel from cart item reservation and biometric passkey login to geocoded shipping and 1-click tokenized payment authorization.',
    data: SAMPLE_INFOGRAPHICS[6],
  },

  // 5. Tech: Instagram System Design
  {
    id: 'template-instagram-architecture',
    sampleIndex: 9,
    title: 'Instagram Feed Generation & Fan-Out Architecture',
    subtitle: 'High-throughput post distribution to 500M DAU using hybrid push/pull fan-out',
    category: 'Tech',
    subCategory: 'System Design & Distributed Systems',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive System Architecture Flow',
    complexity: 'Production-Grade',
    description: 'Industry-standard distributed systems reference: Edge Anycast ingress, hybrid celebrity fan-out queue, Redis Sorted Sets timeline materialization, and PostgreSQL horizontal shards.',
    keyMetrics: [
      { label: 'P99 Feed Read Latency', value: '< 12ms' },
      { label: 'Peak Ingestion TPS', value: '350,000' },
      { label: 'Celebrity Fan-Out Cutoff', value: '25K Followers' },
    ],
    tags: ['System Design', 'Redis ZSET', 'Kafka', 'PostgreSQL Sharding', 'CDN', 'Envoy'],
    starterPrompt: 'Design Instagram high-throughput feed generation and fan-out system architecture with interactive stepper tabs (Mobile CDN, Envoy Gateway, Hybrid Push/Pull Fanout, Redis Sorted Sets, PostgreSQL Shards) handling 500M daily active users.',
    data: SAMPLE_INFOGRAPHICS[9],
  },

  // 6. Tech: Uber Geospatial Dispatch
  {
    id: 'template-uber-dispatch',
    sampleIndex: 10,
    title: 'Uber Real-Time Geospatial Driver Dispatch Architecture',
    subtitle: 'Sub-second rider-driver matching across Uber H3 hexagonal spatial indexing clusters',
    category: 'Tech',
    subCategory: 'Real-Time & Spatial Systems',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive System Architecture Flow',
    complexity: 'Production-Grade',
    description: 'Geospatial stream processing engine featuring H3 hexagonal partition rings, 4-second batch Kuhn-Munkres bipartite matching, and Cassandra immutable trip state.',
    keyMetrics: [
      { label: 'Batch Match Frequency', value: 'Every 4.0s' },
      { label: 'Median ETA Pickup', value: '3.4 min' },
      { label: 'H3 Spatial Resolution', value: 'Res 8 (~460m)' },
    ],
    tags: ['Uber H3', 'Spatial Indexing', 'Bipartite Matching', 'Kafka', 'Cassandra', 'GeoStreams'],
    starterPrompt: 'Map Uber real-time driver dispatch architecture across H3 hexagonal spatial indexing clusters with batch bipartite matching, Kafka location streams, and Cassandra trip ledger.',
    data: SAMPLE_INFOGRAPHICS[10],
  },

  // 7. Tech: Enterprise LLM RAG Pipeline
  {
    id: 'template-rag-pipeline',
    sampleIndex: 12,
    title: 'Enterprise LLM RAG & Hybrid Search Pipeline',
    subtitle: 'Vector embeddings, BM25 sparse keyword fusion, cross-encoder re-ranking, and grounded generation',
    category: 'Tech',
    subCategory: 'AI Systems & LLMs',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive System Architecture Flow',
    complexity: 'Enterprise',
    description: 'Production generative search pipeline with chunk deduplication, reciprocal rank fusion (RRF), cross-encoder neural scoring, and grounded Gemini inference with inline citation anchoring.',
    keyMetrics: [
      { label: 'Mean Reciprocal Rank', value: 'MRR@10: 0.89' },
      { label: 'Hallucination Suppression', value: '99.4%' },
      { label: 'End-to-End P95', value: '420ms' },
    ],
    tags: ['RAG', 'Vector Search', 'BM25', 'Cross-Encoder', 'Gemini Flash', 'Qdrant'],
    starterPrompt: 'Create an enterprise RAG search architecture with hybrid dense vector retrieval, BM25 keyword fusion, cross-encoder re-ranking, and grounded Gemini synthesis with citation anchoring.',
    data: SAMPLE_INFOGRAPHICS[12],
  },

  // 8. Tech: Edge NPU vs Cloud Inference
  {
    id: 'template-edge-ai',
    sampleIndex: 5,
    title: 'Edge On-Device NPU vs Cloud API Inference',
    subtitle: 'Quantized Int4 local execution vs centralized GPU cluster latency and unit economics',
    category: 'Tech',
    subCategory: 'AI Systems & Edge Compute',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Advanced',
    description: 'Cost and latency inflection curves contrasting on-device privacy-first INT4 local inference against hyperscaler GPU cluster API egress costs.',
    keyMetrics: [
      { label: 'P95 Local Latency', value: '38ms' },
      { label: 'Cloud Egress Cost', value: '$0.00 / device' },
      { label: 'Zero Network Uptime', value: '100% Offline' },
    ],
    tags: ['NPU', 'Quantization', 'INT4', 'Cloud GPU', 'Local AI', 'Inference Latency'],
    starterPrompt: 'Compare on-device quantized Int4 NPU local execution against centralized cloud GPU clusters across P95 token latency (38ms vs 640ms), monthly compute bills, and offline availability.',
    data: SAMPLE_INFOGRAPHICS[5],
  },

  // 9. Tech: Text-to-UI JSON Pipeline
  {
    id: 'template-pipeline-architecture',
    sampleIndex: 3,
    title: 'Text-to-UI JSON Pipeline Architecture',
    subtitle: 'Separation of concerns between stochastic LLM reasoning and deterministic React rendering',
    category: 'Tech',
    subCategory: 'Software Architecture & Tooling',
    archetype: 'stepper-pipeline',
    archetypeLabel: 'Interactive Stepper Pipeline',
    complexity: 'Advanced',
    description: 'Structured generation framework isolating prompt intent, JSON Schema validation, headless AST compilation, and zero-runtime React canvas delivery.',
    keyMetrics: [
      { label: 'P99 Cold-Start', value: '180ms' },
      { label: 'Schema Validation', value: '100% Deterministic' },
      { label: 'Bundle Overhead', value: '0 kB Runtime' },
    ],
    tags: ['React', 'JSON Schema', 'Compilers', 'AST', 'UI Generation', 'TypeScript'],
    starterPrompt: 'Create a text-to-UI JSON pipeline system architecture with interactive stepper tabs (Prompt, LLM, JSON, React, Export API) showing separation of concerns between LLM reasoning and deterministic UI rendering.',
    data: SAMPLE_INFOGRAPHICS[3],
  },

  // 10. Tech: DevOps Deployment Strategy
  {
    id: 'template-devops-deployment',
    sampleIndex: 7,
    title: 'Deployment Strategy & Blast Radius Analysis',
    subtitle: 'Progressive canary rollout vs blue-green deploy across 100K active microservices',
    category: 'Tech',
    subCategory: 'DevOps & Reliability',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Production-Grade',
    description: 'Evaluates HTTP 5xx error anomalies, MTTR recovery speed, and automated automated canary rollback triggers across production Kubernetes clusters.',
    keyMetrics: [
      { label: 'Mean Time to Recovery', value: '45 seconds' },
      { label: 'Error Anomaly Ceiling', value: '0.04%' },
      { label: 'Blast Radius Impact', value: '5% Max Pods' },
    ],
    tags: ['Canary', 'Blue-Green', 'Kubernetes', 'MTTR', 'Prometheus', 'SRE'],
    starterPrompt: 'Analyze progressive canary rollout vs all-at-once deployment across 100K active microservices, showing HTTP error anomaly reduction and automated rollback MTTR.',
    data: SAMPLE_INFOGRAPHICS[7],
  },

  // 11. Education & Science: CRISPR Prime Editing
  {
    id: 'template-crispr-prime-editing',
    sampleIndex: 13,
    title: 'CRISPR Prime Editing vs Standard Cas9 DSB Specificity',
    subtitle: 'Precision search-and-replace reverse transcription vs double-strand break indel risks',
    category: 'Education',
    subCategory: 'Genomics & Molecular Biology',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Advanced',
    description: 'Biomedical research template comparing pegRNA nickase-directed reverse transcription precision against wild-type Cas9 double-strand break chromosome translocations.',
    keyMetrics: [
      { label: 'On-Target Efficiency', value: '88%' },
      { label: 'Translocation Risk', value: '< 0.1%' },
      { label: 'Precise Edit Ratio', value: '94.2%' },
    ],
    tags: ['CRISPR', 'Prime Editing', 'pegRNA', 'Genomics', 'Nickase', 'Bioinformatics'],
    starterPrompt: 'Compare CRISPR Prime Editing search-and-replace against standard Cas9 blunt double-strand breaks across on-target efficiency (88% vs 62%) and off-target translocation indel safety (<0.1% vs 14.8%).',
    data: SAMPLE_INFOGRAPHICS[13],
  },

  // 12. Education & Science: Renewable Grid Storage
  {
    id: 'template-grid-storage',
    sampleIndex: 4,
    title: 'Renewable Grid Storage Dispatch & Curtailment',
    subtitle: '7-day solar & wind generation balancing with dynamic lithium-ion battery reserve dispatch',
    category: 'Education',
    subCategory: 'Clean Energy & Power Systems',
    archetype: 'dynamic-slider-schedule',
    archetypeLabel: 'Dynamic Slider Schedule & Balancer',
    complexity: 'Production-Grade',
    description: 'Educational simulation of clean energy grid stability, showing daytime solar peak generation, duck-curve evening peak demand, and battery dispatch buffering.',
    keyMetrics: [
      { label: 'Grid Renewable Share', value: '64.5%' },
      { label: 'Curtailment Saved', value: '412 MWh' },
      { label: 'P99 Peaker Avoidance', value: '91.8%' },
    ],
    tags: ['Solar', 'Wind', 'Battery Storage', 'Duck Curve', 'Grid Balance', 'Clean Energy'],
    starterPrompt: '7-Day solar and wind balancing schedule with dynamic lithium-ion battery reserve dispatch slider, daytime solar output bars, and evening discharge supply curve.',
    data: SAMPLE_INFOGRAPHICS[4],
  },

  // 13. Health & Fitness: Cardio Timing & Substrates
  {
    id: 'template-cardio-timing',
    sampleIndex: 0,
    title: 'Cardio Timing & Substrate Utilization',
    subtitle: 'Metabolic fuel ratio (% Fat vs % Glycogen) over a 75-minute exercise timeline',
    category: 'Health',
    subCategory: 'Exercise Physiology & Metabolism',
    archetype: 'scenario-area',
    archetypeLabel: 'Scenario Comparison & Crossover',
    complexity: 'Production-Grade',
    description: 'Evidence-based exercise physiology infographic demonstrating glycogen depletion dynamics and high fat oxidation during post-lifting cardio.',
    keyMetrics: [
      { label: 'Cardio Fat Burn Ratio', value: '95%' },
      { label: 'Cardio Glycogen Fuel', value: '5%' },
      { label: 'Lifting Energy Availability', value: '100%' },
    ],
    tags: ['Fat Oxidation', 'Glycogen', 'Lifting', 'Cardio', 'Metabolism', 'Physiology'],
    starterPrompt: 'Compare fat oxidation vs glycogen burn (% Fat vs % Glycogen) over a 75-minute exercise timeline for Elliptical After Lift (post-workout) vs Elliptical Before Lift (pre-workout) with 3 key metrics and metabolic takeaway.',
    data: SAMPLE_INFOGRAPHICS[0],
  },

  // 14. Health & Fitness: Weekly Stress & Recovery
  {
    id: 'template-weekly-stress',
    sampleIndex: 1,
    title: 'Weekly Stress & Fat Oxidation Schedule',
    subtitle: '5-day lifting split with dynamic Zone 2 cardio frequency slider from Mon to Sun',
    category: 'Health',
    subCategory: 'Athletic Training & Periodization',
    archetype: 'dynamic-slider-schedule',
    archetypeLabel: 'Dynamic Slider Schedule & Balancer',
    complexity: 'Advanced',
    description: 'Sports science training periodization schedule balancing systemic neurological stress against aerobic mitochondrial density and fat adaptation.',
    keyMetrics: [
      { label: 'Total Weekly Stress', value: '620 AU' },
      { label: 'Fat Adaptation Index', value: '88/100' },
      { label: 'CNS Recovery Readiness', value: 'Optimal' },
    ],
    tags: ['Zone 2', 'Hypertrophy', 'Stress Load', 'CNS Recovery', 'Periodization'],
    starterPrompt: '5-Day lifting split + dynamic 45-min Zone 2 cardio frequency schedule from Mon to Sun with an interactive slider for cardio days per week, pink lifting stress bars, yellow cardio stress bars, and cyan fat oxidation curve.',
    data: SAMPLE_INFOGRAPHICS[1],
  },
];
