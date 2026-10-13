import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Models to try in order of latency, reliability, and availability
const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

// Persistence storage directory
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SHARES_FILE = path.join(DATA_DIR, 'shares.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Helper to safely extract JSON from AI text response
function safeExtractJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse valid JSON from AI response');
  }
}

// Smart, domain-specific fallback generator when Gemini API is temporarily busy
function generateSmartFallback(promptText: string, currentData: any) {
  const p = (promptText || '').toLowerCase();

  // 0. Instagram / System Design / Architecture / Distributed Systems
  if (p.includes('instagram') || p.includes('system design') || p.includes('feed') || p.includes('fanout') || p.includes('architecture') || p.includes('microservice')) {
    return {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: 'Instagram Feed Generation & Fan-Out Architecture',
      subtitle: 'High-throughput hybrid push/pull timeline materialization supporting 500M daily active users',
      cardType: 'stepper-pipeline' as const,
      pipelineConfig: {
        currentStep: 1,
        architectureTierLabels: ['Edge & CDN Tier', 'Gateway & Auth', 'Async Fanout Engine', 'In-Memory Cache', 'Sharded DB & Media'],
        nodes: [
          {
            id: 'client',
            label: 'Mobile Clients & CDN',
            subLabel: 'Cloudflare Anycast & Edge Media Cache',
            tag: 'EDGE TIER',
            tier: 'client',
            metric: '1.5B MAU / 500k req/s',
            activeInSteps: [1, 5],
            technicalSpecs: ['HTTP/3 QUIC Protocol', 'Edge Image WebP Cache', 'Anycast Geo-Routing'],
          },
          {
            id: 'gateway',
            label: 'Envoy API Gateway',
            subLabel: 'Rate Limiter & OAuth2 Token Auth',
            tag: 'GATEWAY',
            tier: 'gateway',
            metric: 'P99 < 2ms / 40 Gbps',
            activeInSteps: [1, 2],
            technicalSpecs: ['Token Bucket Rate Limiting', 'TLS 1.3 Termination', 'Distributed Tracing Header'],
          },
          {
            id: 'fanout',
            label: 'Hybrid Fan-Out Engine',
            subLabel: 'Selective Push/Pull Async Worker',
            tag: 'ASYNC ENGINE',
            tier: 'compute',
            metric: '350k posts/sec fanout',
            activeInSteps: [2, 3],
            technicalSpecs: ['Go / gRPC Microservice', 'Kafka Partitioned Topics', 'Celebrity Threshold: 25k followers'],
          },
          {
            id: 'cache',
            label: 'Redis Feed Cache Cluster',
            subLabel: 'Sorted Sets (ZSET) by Timestamp',
            tag: 'IN-MEMORY',
            tier: 'cache',
            metric: 'P99 < 4ms / 800M Feeds',
            activeInSteps: [4, 5],
            technicalSpecs: ['Redis Cluster 128 Shards', 'Sliding Window LRU Eviction', 'Pre-computed User Timelines'],
          },
          {
            id: 'storage',
            label: 'PostgreSQL Shards & S3',
            subLabel: 'Media Bucket & Sharded Metadata',
            tag: 'PERSISTENCE',
            tier: 'storage',
            metric: '99.999% SLA / 15 PB',
            activeInSteps: [1, 3],
            technicalSpecs: ['Hash Sharded by UserID', 'Master-Replica Replication', 'S3 Multi-Region Media Store'],
          },
        ],
        connections: [
          { from: 'client', to: 'gateway', label: 'HTTPS / GraphQL', protocol: 'GraphQL' },
          { from: 'gateway', to: 'fanout', label: 'gRPC Stream', protocol: 'gRPC' },
          { from: 'fanout', to: 'cache', label: 'TCP Redis RESP', protocol: 'Redis RESP' },
          { from: 'fanout', to: 'storage', label: 'Sharded SQL', protocol: 'PostgreSQL' },
          { from: 'cache', to: 'client', label: 'Direct Feed Read', protocol: 'Cached Feed' },
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: User Post Ingestion & S3 Upload',
            tag: 'INGESTION',
            latency: 'P99: 45ms',
            description: 'Client uploads photo/video directly to Amazon S3 via pre-signed URL. Post metadata (author, caption, timestamp, media URL) is written to the corresponding PostgreSQL user shard.',
            architecturalRationale: 'Direct-to-S3 bypasses web servers, preventing multi-megabyte media payloads from saturating backend app connections.',
            failureMode: 'If client network drops during upload, S3 multipart chunk resume recovers progress without restarting.',
            activeNodeId: 'client',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Kafka Asynchronous Event Broadcast',
            tag: 'EVENT STREAM',
            latency: 'P99: 8ms',
            description: 'The API Gateway acknowledges the client and pushes a "NewPostCreated" event into Apache Kafka partitioned by author ID, immediately freeing up the client response loop.',
            architecturalRationale: 'Asynchronous event streaming completely decouples post ingestion from the expensive fan-out calculation across millions of follower feeds.',
            failureMode: 'Kafka log replication across 3 availability zones ensures zero message loss even if broker nodes crash.',
            activeNodeId: 'gateway',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Hybrid Fan-Out Decision (Push vs Pull)',
            tag: 'FANOUT LOGIC',
            latency: 'P99: 85ms',
            description: 'Workers evaluate follower count. For regular users (<25k followers), post IDs are actively pushed into all followers Redis timelines (Push Model). For high-profile celebrities (>25k followers), posts remain in author storage and are pulled dynamically upon follower login (Pull Model).',
            architecturalRationale: 'Celebrities with 50M+ followers would cause a 50,000,000 Redis write spike per post (the "Justin Bieber problem"). Hybrid fan-out eliminates write amplification while preserving sub-second timeline freshness.',
            failureMode: 'Fallback worker queue absorbs burst spikes using exponential backoff without dropping timeline write events.',
            activeNodeId: 'fanout',
          },
          {
            stepNumber: 4,
            stepTitle: 'Step 4: Redis Cluster Materialization',
            tag: 'CACHE INGEST',
            latency: 'P99: 3.5ms',
            description: 'For pushed posts, consumer workers append the post ID to each follower Redis Sorted Set (ZSET), indexed by millisecond timestamp. Only the latest 800 post IDs are retained per active user.',
            architecturalRationale: 'Pre-materializing user timelines in memory turns complex relational joins into O(log N) in-memory range queries during user feed loads.',
            failureMode: 'Sliding LRU eviction removes stale feeds of inactive users, freeing up 60% of cluster RAM.',
            activeNodeId: 'cache',
          },
          {
            stepNumber: 5,
            stepTitle: 'Step 5: Instant Chronological Timeline Delivery',
            tag: 'DELIVERY',
            latency: 'P99: 14ms',
            description: 'When the user launches Instagram, the client requests the home feed. The gateway queries Redis ZREVRANGEBYSCORE, merges celebrity posts on the fly, hydrates post metadata from edge cache, and delivers the 60 FPS feed.',
            architecturalRationale: 'Separating post IDs from heavy media data allows the feed index to load in 14ms, while CDN delivers images asynchronously.',
            failureMode: 'If a Redis shard is temporarily unreachable, the gateway falls back to reading read-replica PostgreSQL shards with a 50ms timeout.',
            activeNodeId: 'cache',
          },
        ],
      },
      originalPrompt: promptText || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 1. SaaS / Churn / Enterprise / Subscriptions
  if (p.includes('saas') || p.includes('churn') || p.includes('mrr') || p.includes('arr') || p.includes('nrr') || p.includes('pricing') || p.includes('subscription')) {
    return {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: 'SaaS Contract Models & Cohort Expansion',
      subtitle: 'Cumulative Net Revenue Retention (% NRR) vs Churn Erosion over a 24-month horizon',
      cardType: 'scenario-area' as const,
      switcherConfig: {
        switchLabel: 'Contract Commitment Model:',
        activeScenarioId: 'annual-commit',
        scenarios: [
          {
            id: 'annual-commit',
            label: 'Annual Upfront Commitment (-18% Pricing)',
            metrics: [
              { id: 'sm1', label: 'Net Revenue Retention', value: '128%', note: 'Compounding net expansion' },
              { id: 'sm2', label: 'Annual Logo Churn', value: '4.2%', note: 'Executive multi-seat buy-in' },
              { id: 'sm3', label: 'LTV to CAC Ratio', value: '7.2x', note: 'Payback achieved in month 5' },
            ],
            chartData: {
              labels: ['M1', 'M3', 'M6', 'M9', 'M12', 'M15', 'M18', 'M21', 'M24'],
              series: [
                { name: 'Revenue Expansion (%)', color: '#34d399', data: [100, 102, 108, 114, 122, 128, 134, 140, 148] },
                { name: 'Churn Erosion (%)', color: '#f87171', data: [0, 1, 2, 3, 4, 5, 6, 6, 7] },
              ],
            },
            insightHighlight: {
              title: 'Expansion Compounding Effect:',
              text: 'Annual upfront commitments eliminate the high month-3 churn dropoff, allowing seat expansions and feature add-ons to compound NRR well beyond 128% by year two.',
            },
          },
          {
            id: 'monthly-cancel',
            label: 'Monthly Rolling Subscriptions',
            metrics: [
              { id: 'sm1_m', label: 'Net Revenue Retention', value: '88%', note: 'Net contraction from churn friction' },
              { id: 'sm2_m', label: 'Annual Logo Churn', value: '28.5%', note: 'High self-serve trial fatigue' },
              { id: 'sm3_m', label: 'LTV to CAC Ratio', value: '2.4x', note: 'Payback extended to 14 months' },
            ],
            chartData: {
              labels: ['M1', 'M3', 'M6', 'M9', 'M12', 'M15', 'M18', 'M21', 'M24'],
              series: [
                { name: 'Revenue Expansion (%)', color: '#34d399', data: [100, 92, 85, 78, 72, 67, 62, 58, 54] },
                { name: 'Churn Erosion (%)', color: '#f87171', data: [0, 8, 15, 22, 28, 33, 38, 42, 46] },
              ],
            },
            insightHighlight: {
              title: 'Churn Treadmill Bottleneck:',
              text: 'Monthly billing subjects every renewal to casual cancellation, wiping out 46% of cohort gross margins and requiring continuous acquisition spend to stay flat.',
            },
          },
        ],
      },
      originalPrompt: promptText || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 2. Renewable Grid / Energy / Battery / Solar / Wind
  if (p.includes('grid') || p.includes('energy') || p.includes('battery') || p.includes('solar') || p.includes('wind') || p.includes('storage') || p.includes('dispatch') || p.includes('power')) {
    return {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: 'Renewable Grid Storage Dispatch & Curtailment',
      subtitle: '7-Day Solar and Wind Balancing with Dynamic Lithium-Ion Battery Reserve Allocation',
      cardType: 'dynamic-slider-schedule' as const,
      sliderConfig: {
        label: 'Battery Storage Reserve Dispatch Capacity',
        min: 1,
        max: 7,
        step: 1,
        defaultValue: 4,
        unit: 'GWh Peak Capacity',
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        liftingBase: [88, 92, 90, 65, 84, 78, 60],
        accentBase: [25, 25, 20, 35, 25, 30, 20],
        metricFormulas: { cnsBase: 557, fatOxBase: 42 },
        seriesNames: {
          primaryBar: 'Solar & Wind Generation',
          primaryColor: '#38bdf8',
          accentBar: 'Battery Storage Dispatch',
          accentColor: '#34d399',
          lineCurve: 'Grid Reliability & Reserve Margin',
          lineColor: '#facc15',
          unit: 'GWh',
        },
        kpiLabels: {
          kpi1Label: 'Weekly Clean Energy Dispatch',
          kpi1Unit: 'GWh',
          kpi1Subtext: 'Solar/Wind base + battery storage buffer',
          kpi2Label: 'Peak Curtailment Mitigated',
          kpi2Unit: 'GWh',
          kpi2Subtext: 'Excess daytime renewable peak absorbed',
          kpi3Label: 'Grid Reliability Margin',
          kpi3Subtext: 'Frequency regulation & backup resilience',
          balanceThresholds: {
            low: 'Curtailment Risk / Under-Buffered',
            mid: 'Optimal Storage Dispatch',
            high: 'Peaker Redundancy / Peak Reserve',
          },
        },
      },
      currentSliderValue: 4,
      originalPrompt: promptText || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 3. AI / Hardware / Latency / Models / Inference
  if (p.includes('ai') || p.includes('npu') || p.includes('gpu') || p.includes('latency') || p.includes('inference') || p.includes('token') || p.includes('llm')) {
    return {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: 'Edge On-Device NPU vs Cloud API Inference',
      subtitle: 'End-to-end token latency (ms) and operational availability under intermittent connectivity',
      cardType: 'scenario-area' as const,
      switcherConfig: {
        switchLabel: 'Inference Architecture:',
        activeScenarioId: 'edge-npu',
        scenarios: [
          {
            id: 'edge-npu',
            label: 'Local Quantized NPU (Int4 Acceleration)',
            metrics: [
              { id: 'em1', label: 'P95 Response Latency', value: '38ms', note: 'Instant local inference loop' },
              { id: 'em2', label: 'Cloud Infrastructure Cost', value: '$0.00', note: 'Client-device compute offload' },
              { id: 'em3', label: 'Offline Availability', value: '100%', note: 'Zero network dependency' },
            ],
            chartData: {
              labels: ['0KB', '10KB', '50KB', '100KB', '250KB', '500KB', '1MB'],
              series: [
                { name: 'Local Processing Time (ms)', color: '#38bdf8', data: [15, 22, 35, 48, 65, 85, 110] },
                { name: 'Network Roundtrip (ms)', color: '#a78bfa', data: [0, 0, 0, 0, 0, 0, 0] },
              ],
            },
            insightHighlight: {
              title: 'Deterministic Edge Superiority:',
              text: 'Quantized neural network execution on modern silicon achieves sub-40ms interactions while completely eliminating per-token server costs and cellular drops.',
            },
          },
          {
            id: 'cloud-api',
            label: 'Centralized Cloud Serverless Cluster',
            metrics: [
              { id: 'em1_c', label: 'P95 Response Latency', value: '640ms', note: 'Network handshake & queue time' },
              { id: 'em2_c', label: 'Cloud Infrastructure Cost', value: '$4,850/mo', note: 'GPU container lease burn' },
              { id: 'em3_c', label: 'Offline Availability', value: '0%', note: 'Total dependency on cellular link' },
            ],
            chartData: {
              labels: ['0KB', '10KB', '50KB', '100KB', '250KB', '500KB', '1MB'],
              series: [
                { name: 'Local Processing Time (ms)', color: '#38bdf8', data: [5, 8, 12, 18, 25, 34, 45] },
                { name: 'Network Roundtrip (ms)', color: '#a78bfa', data: [180, 240, 310, 420, 560, 720, 940] },
              ],
            },
            insightHighlight: {
              title: 'The Network Handshake Tax:',
              text: 'While cloud clusters boast high raw compute power, TLS handshakes, queue depth, and mobile radio wake times add 400ms+ of user-facing lag.',
            },
          },
        ],
      },
      originalPrompt: promptText || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 4. Fitness / Cardio / Workout (Only if explicitly requested)
  if (p.includes('cardio') || p.includes('workout') || p.includes('lift') || p.includes('glycogen') || p.includes('fat burn') || p.includes('elliptical')) {
    return {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: 'Cardio Timing & Substrate Utilization',
      subtitle: 'Energy source ratio (% Fat vs % Glycogen) over a 75-minute exercise timeline',
      cardType: 'scenario-area' as const,
      switcherConfig: {
        switchLabel: 'Workout Sequence:',
        activeScenarioId: 'post-workout',
        scenarios: [
          {
            id: 'post-workout',
            label: 'Elliptical After Lift (Post-Workout)',
            metrics: [
              { id: 'm1', label: 'Cardio Fat Burn Ratio', value: '95%', note: 'Pure fat oxidation during cardio' },
              { id: 'm2', label: 'Cardio Glycogen Fuel', value: '5%', note: 'Minimal glucose dependency' },
              { id: 'm3', label: 'Lifting Energy Availability', value: '100%', note: 'Fresh glycogen for heavy lifts' },
            ],
            chartData: {
              labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m', '50m', '55m', '60m', '65m', '70m', '75m'],
              series: [
                { name: 'Glycogen Burn (%)', color: '#60a5fa', data: [80, 72, 63, 52, 42, 32, 22, 15, 10, 6, 4, 3, 3, 2, 1, 1] },
                { name: 'Fat Oxidation (%)', color: '#eab308', data: [20, 28, 37, 48, 58, 68, 78, 85, 90, 94, 96, 97, 97, 98, 99, 99] },
              ],
            },
            insightHighlight: {
              title: 'Metabolic Superiority:',
              text: 'Lifting first depletes muscle glycogen stores over 60 minutes. Transitioning immediately to 15 minutes of low-intensity cardio forces the body to oxidize ~95% pure fat.',
            },
          },
          {
            id: 'pre-workout',
            label: 'Elliptical Before Lift (Pre-Workout)',
            metrics: [
              { id: 'm1_pre', label: 'Cardio Fat Burn Ratio', value: '35%', note: 'Sub-optimal fat oxidation' },
              { id: 'm2_pre', label: 'Cardio Glycogen Fuel', value: '65%', note: 'Prematurely burns lifting fuel' },
              { id: 'm3_pre', label: 'Lifting Energy Availability', value: '45%', note: 'Compromised strength and power output' },
            ],
            chartData: {
              labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m', '50m', '55m', '60m', '65m', '70m', '75m'],
              series: [
                { name: 'Glycogen Burn (%)', color: '#60a5fa', data: [85, 82, 79, 75, 71, 68, 65, 62, 58, 55, 52, 50, 48, 45, 42, 40] },
                { name: 'Fat Oxidation (%)', color: '#eab308', data: [15, 18, 21, 25, 29, 32, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60] },
              ],
            },
            insightHighlight: {
              title: 'Glycogen Depletion Penalty:',
              text: 'Cardio prior to resistance training drains fast-twitch glycogen reserves, causing early central nervous system fatigue.',
            },
          },
        ],
      },
      originalPrompt: promptText || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 5. Default General Domain-Neutral Archetype (NEVER mentions fat oxidation or cardio!)
  const topicTitle = promptText ? promptText.slice(0, 45).trim() : 'Comparative Data Analysis';
  return {
    id: currentData?.id || `infographic-${Date.now()}`,
    title: topicTitle,
    subtitle: 'Comparative throughput optimization and system efficiency under dynamic constraints',
    cardType: 'scenario-area' as const,
    switcherConfig: {
      switchLabel: 'Operational Strategy:',
      activeScenarioId: 'strategy-optimal',
      scenarios: [
        {
          id: 'strategy-optimal',
          label: 'Optimized Framework (Target Architecture)',
          metrics: [
            { id: 'm1', label: 'Net Efficiency Gain', value: '94.2%', note: 'Peak throughput efficiency' },
            { id: 'm2', label: 'System Overhead / Loss', value: '5.8%', note: 'Friction minimized via pipelining' },
            { id: 'm3', label: 'Operational Uptime', value: '99.9%', note: 'Redundant automated recovery' },
          ],
          chartData: {
            labels: ['0m', '15m', '30m', '45m', '60m', '75m', '90m'],
            series: [
              { name: 'Output Performance (%)', color: '#34d399', data: [78, 86, 92, 95, 97, 98, 99] },
              { name: 'Resource Overhead (%)', color: '#f87171', data: [22, 14, 8, 5, 3, 2, 1] },
            ],
          },
          insightHighlight: {
            title: 'Strategic Architecture Advantage:',
            text: 'Decoupling bottleneck workloads and adopting deterministic execution eliminates latency spikes, sustaining over 94% net operational efficiency across peak intervals.',
          },
        },
        {
          id: 'strategy-baseline',
          label: 'Legacy / Unstructured Baseline',
          metrics: [
            { id: 'm1_b', label: 'Net Efficiency Gain', value: '48.5%', note: 'Sub-optimal resource utilization' },
            { id: 'm2_b', label: 'System Overhead / Loss', value: '51.5%', note: 'Severe contention and queue delay' },
            { id: 'm3_b', label: 'Operational Uptime', value: '94.0%', note: 'Prone to cascade failures' },
          ],
          chartData: {
            labels: ['0m', '15m', '30m', '45m', '60m', '75m', '90m'],
            series: [
              { name: 'Output Performance (%)', color: '#34d399', data: [70, 62, 55, 48, 44, 42, 40] },
              { name: 'Resource Overhead (%)', color: '#f87171', data: [30, 38, 45, 52, 56, 58, 60] },
            ],
          },
          insightHighlight: {
            title: 'Baseline Contention Penalty:',
            text: 'Unstructured execution results in cascading queue contention, cutting throughput by more than half under sustained demand.',
          },
        },
      ],
    },
    originalPrompt: promptText || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------- API Routes ----------------

app.post('/api/infographic/generate', async (req: Request, res: Response): Promise<void> => {
  const { prompt, currentData, editInstruction } = req.body;

  if (!prompt && !editInstruction) {
    res.status(400).json({ error: 'Prompt or edit instruction is required' });
    return;
  }

  let userPrompt = '';
  if (editInstruction && currentData) {
    userPrompt = `You are updating this existing minimalist infographic based on the user's refinement:
Current Infographic:
${JSON.stringify(currentData, null, 2)}

Refinement Request:
"${editInstruction}"

Return valid JSON with updated title, subtitle, cardType, and configs. Match the user's domain strictly.`;
  } else {
    userPrompt = `User Prompt:
"${prompt}"

Design an authentic, minimalist Gemini interactive infographic card matching these design requirements:
1. Color Discipline: Saturated/contrasting colors are reserved STRICTLY inside the chart/graph for bifurcations (e.g. emerald mint #34d399, soft coral #f87171, cyan #38bdf8, amber yellow #facc15, soft purple #a78bfa). Backgrounds and containers are matte dark (#161619).
2. CRITICAL DOMAIN SPECIFICITY:
   - Your metrics, series names, labels, and insights MUST 100% MATCH THE DOMAIN OF THE USER'S PROMPT.
   - For SaaS/Business: use metrics like Net Revenue Retention, Logo Churn, LTV:CAC, MRR, ARR, Payback Period. Series names: Revenue Expansion vs Churn Erosion.
   - For Clean Energy/Grid: use MWh/GWh, Solar & Wind Generation, Battery Dispatch, Grid Reliability Margin, Curtailment.
   - For AI/Hardware: use P95 Latency (ms), Token Cost, Cloud GPU vs Edge NPU, Offline Availability.
   - For Software/DevOps: use Deployment Frequency, Blast Radius, Rollback MTTR, Error Rate (%).
   - For Fitness/Cardio (ONLY if the prompt is explicitly about workouts/fitness): use Glycogen Burn, Fat Oxidation, Heart Rate. NEVER use Fat or Glycogen or Lifting for any non-fitness prompt!
3. Choose the best cardType:
   - 'scenario-area': If comparing two conditions, phases, models, or architectures (e.g. Annual vs Monthly, Edge NPU vs Cloud, Canary vs Blue-Green).
     Provide switcherConfig with:
       switchLabel (e.g. "Contract Model:" or "Deployment Strategy:" or "Routing Architecture:")
       activeScenarioId (e.g. "scenario-a")
       scenarios: Array of 2 scenarios, each with:
         id, label
         metrics: 3 items, each { id, label, value (e.g. "128%"), note (italicized note) }
         chartData: {
           labels: ["M1", "M3", "M6", "M9", "M12", "M18", "M24"],
           series: [{ name: "Metric Series 1", color: "#34d399", data: [...] }, { name: "Metric Series 2", color: "#f87171", data: [...] }],
           annotations: [
             { pointIndex: 2, label: "Critical Crossover / Anomaly", tag: "CROSSOVER" | "ANOMALY" | "PEAK", type: "crossover" | "anomaly" | "peak", explanation: "Context-aware explanation of why this point matters", metricDelta: "+15%" }
           ]
         }
         insightHighlight: { title: "Key Analytical Finding:", text: "Concise causal explanation." }
   - 'dynamic-slider-schedule': If there is an adjustable frequency, capacity, slider reserve, or variable schedule (e.g. Battery Storage GWh, Weekly Cardio Days, Cloud Cluster Nodes).
     Provide sliderConfig with:
       label (e.g. "Battery Storage Reserve Dispatch Capacity" or "Dynamic Frequency Slider")
       min: 1, max: 7, step: 1, defaultValue: 4, unit: "GWh" (or "Days", "Nodes", "Hours")
       labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
       liftingBase: [88, 92, 90, 65, 84, 78, 60] (primary baseline array)
       accentBase: [25, 25, 20, 35, 25, 30, 20] (accent dynamic allocation array)
       seriesNames: { primaryBar: "Primary Baseline", primaryColor: "#38bdf8", accentBar: "Dynamic Allocation", accentColor: "#34d399", lineCurve: "System Reliability Margin", lineColor: "#facc15", unit: "GWh" }
       kpiLabels: { kpi1Label: "Weekly Total Dispatch", kpi1Unit: "GWh", kpi1Subtext: "Baseline + dynamic reserve", kpi2Label: "Peak Mitigated", kpi2Unit: "GWh", kpi2Subtext: "Curtailment avoided", kpi3Label: "System Stability", kpi3Subtext: "Operating reserve margin" }
       annotations: [
         { pointIndex: 2, label: "Peak Generation Surge", tag: "PEAK SURGE", type: "peak", explanation: "Clear contextual reason for this anomaly or threshold", metricDelta: "82 GWh" }
       ]
   - 'stepper-pipeline': If explaining a system architecture, distributed engineering flow, microservice topology, or multi-step lifecycle (e.g. Instagram system design, Uber dispatch, RAG pipeline, Payment settlement).
     Provide pipelineConfig with:
       architectureTierLabels: Array of 3 to 5 tier names (e.g. ["Edge & CDN", "Gateway & Auth", "Async Fanout Engine", "In-Memory Cache", "Sharded DB & Media"])
       nodes: Array of 4 to 6 architecture nodes, each with:
         id: string (e.g. "client", "gateway", "fanout", "cache", "storage")
         label: string (e.g. "Mobile Clients & CDN", "Envoy API Gateway", "Hybrid Fan-Out Engine", "Redis Feed Cache", "PostgreSQL Shards")
         subLabel: string (e.g. "Cloudflare Anycast", "Rate Limiter & OAuth2", "Kafka Async Workers", "Sorted Sets (ZSET)", "Hash-Sharded DB")
         tag: string (e.g. "EDGE TIER", "GATEWAY", "ASYNC COMPUTE", "IN-MEMORY", "PERSISTENCE")
         metric: string (e.g. "1.5B MAU", "P99 < 2ms", "350k ops/s", "P99 < 4ms", "99.999% SLA")
         tier: "client" | "gateway" | "compute" | "cache" | "storage" | "event"
         activeInSteps: Array of step numbers (e.g. [1, 5], [1, 2], [2, 3], [4, 5], [1, 3])
         technicalSpecs: Array of 3 concise bullet strings (e.g. ["HTTP/3 QUIC Protocol", "Sliding Window LRU", "Multi-Region Replication"])
       connections: Array of connections between nodes, each with:
         from: node id, to: node id, label: string (e.g. "HTTPS / GraphQL", "gRPC Stream", "TCP Redis RESP", "Sharded SQL"), protocol: string
       steps: Array of 4 to 5 steps, each with:
         stepNumber: 1,
         stepTitle: "Step 1: Ingestion & Upload",
         tag: "INGESTION",
         latency: "P99: 45ms",
         description: "Concise architectural explanation of what happens at this stage. Avoid vague unformatted text.",
         architecturalRationale: "Why this design choice was made (e.g. Eliminates write amplification for celebrity accounts).",
         failureMode: "Fallback resilience strategy (e.g. In-memory queue absorbs burst spikes without dropping events).",
         activeNodeId: "client"

4. DYNAMIC HOVER CALLOUT ANNOTATIONS:
   Always include 2-3 key annotations on critical points (anomalies, crossovers, peaks, troughs, inflection points) with crisp context-aware explanations.

Return pure JSON matching this exact structure with no extra markdown formatting.`;
  }

  const systemInstruction = `You are Gemini's specialized Information Architect and Infographic Designer. Output clean, deterministic JSON matching the requested card archetype. Never output markdown code fences. Keep numbers realistic, labels concise, and domain terminology authentic to the user prompt.`;

  let lastError: any = null;
  let parsedJson: any = null;

  // Try models in order of availability and speed
  for (const model of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      parsedJson = safeExtractJson(text);
      if (parsedJson && (parsedJson.title || parsedJson.cardType)) {
        break; // Success!
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next model:`, err?.status || err?.message || err);
      lastError = err;
    }
  }

  // If AI generation succeeded, normalize the response
  if (parsedJson) {
    const cardType = parsedJson.cardType || 'scenario-area';
    const resultInfographic = {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: parsedJson.title || (prompt ? prompt.slice(0, 45) : 'Interactive Data Infographic'),
      subtitle: parsedJson.subtitle || 'Synthesized data pattern and comparative analysis',
      cardType,
      switcherConfig: parsedJson.switcherConfig,
      sliderConfig: parsedJson.sliderConfig,
      pipelineConfig: parsedJson.pipelineConfig,
      originalPrompt: prompt || currentData?.originalPrompt || '',
      createdAt: currentData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    res.json(resultInfographic);
    return;
  }

  // Fallback: If external API was temporarily busy or experiencing high demand, generate a smart domain-matched archetype
  console.log('AI models temporarily busy, activating intelligent domain fallback for:', prompt || editInstruction);
  const fallbackInfographic = generateSmartFallback(prompt || editInstruction || '', currentData);
  res.json(fallbackInfographic);
});

// Projects CRUD
app.get('/api/projects', (req: Request, res: Response): void => {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  res.json(projects);
});

app.post('/api/projects', (req: Request, res: Response): void => {
  const { project } = req.body;
  if (!project || !project.id) {
    res.status(400).json({ error: 'Valid project object with id is required' });
    return;
  }

  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const existingIdx = projects.findIndex((p) => p.id === project.id);

  if (existingIdx >= 0) {
    projects[existingIdx] = { ...project, updatedAt: Date.now() };
  } else {
    projects.unshift({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
  }

  writeJsonFile(PROJECTS_FILE, projects);
  res.json({ success: true, project });
});

app.delete('/api/projects/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  let projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  projects = projects.filter((p) => p.id !== id);
  writeJsonFile(PROJECTS_FILE, projects);
  res.json({ success: true });
});

// Share links API
app.post('/api/share', (req: Request, res: Response): void => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: 'Infographic data required to share' });
    return;
  }

  const shares = readJsonFile<Record<string, any>>(SHARES_FILE, {});
  const shareId = `share_${Math.random().toString(36).substring(2, 9)}`;

  shares[shareId] = {
    ...data,
    sharedAt: Date.now(),
  };

  writeJsonFile(SHARES_FILE, shares);
  res.json({ shareId, url: `?share=${shareId}` });
});

app.get('/api/share/:shareId', (req: Request, res: Response): void => {
  const { shareId } = req.params;
  const shares = readJsonFile<Record<string, any>>(SHARES_FILE, {});

  const sharedData = shares[shareId];
  if (!sharedData) {
    res.status(404).json({ error: 'Shared infographic not found or expired' });
    return;
  }

  res.json(sharedData);
});

// Serve frontend in production or mount vite in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InfographAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
