import React, { useState, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles, LayoutTemplate } from 'lucide-react';

interface Props {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  onSelectSample: (index: number) => void;
  onOpenTemplates?: () => void;
  currentPrompt?: string;
}

const PRESET_TOPICS = [
  {
    category: 'System Design',
    label: 'Instagram Feed Fan-Out',
    prompt: 'Design Instagram high-throughput feed generation and fan-out system architecture with interactive stepper tabs (Mobile CDN, Envoy Gateway, Hybrid Push/Pull Fanout, Redis Sorted Sets, PostgreSQL Shards) handling 500M daily active users.',
    sampleIdx: 9,
  },
  {
    category: 'System Design',
    label: 'Uber Geospatial Dispatch',
    prompt: 'Map Uber real-time driver dispatch architecture across H3 hexagonal spatial indexing clusters with batch bipartite matching, Kafka location streams, and Cassandra trip ledger.',
    sampleIdx: 10,
  },
  {
    category: 'AI Systems',
    label: 'Enterprise LLM RAG Pipeline',
    prompt: 'Create an enterprise RAG search architecture with hybrid dense vector retrieval, BM25 keyword fusion, cross-encoder re-ranking, and grounded Gemini synthesis with citation anchoring.',
    sampleIdx: 12,
  },
  {
    category: 'FinTech',
    label: 'Stripe Payment Settlement',
    prompt: 'Architect Stripe global payment settlement engine with client tokenization, distributed Redis idempotency vault, ISO 8583 bank authorization, and immutable double-entry ledger.',
    sampleIdx: 11,
  },
  {
    category: 'Healthcare',
    label: 'CRISPR Prime Editing vs Cas9',
    prompt: 'Compare CRISPR Prime Editing search-and-replace against standard Cas9 blunt double-strand breaks across on-target efficiency (88% vs 62%) and off-target translocation indel safety (<0.1% vs 14.8%).',
    sampleIdx: 13,
  },
  {
    category: 'Fitness',
    label: 'Cardio Timing & Substrates',
    prompt: 'Compare fat oxidation vs glycogen burn (% Fat vs % Glycogen) over a 75-minute exercise timeline for Elliptical After Lift (post-workout) vs Elliptical Before Lift (pre-workout) with 3 key metrics and metabolic takeaway.',
    sampleIdx: 0,
  },
  {
    category: 'Athletics',
    label: 'Weekly Stress & Recovery',
    prompt: '5-Day lifting split + dynamic 45-min Zone 2 cardio frequency schedule from Mon to Sun with an interactive slider for cardio days per week, pink lifting stress bars, yellow cardio stress bars, and cyan fat oxidation curve.',
    sampleIdx: 1,
  },
  {
    category: 'SaaS',
    label: 'SaaS Pricing & Churn Cohorts',
    prompt: 'Compare Annual Upfront commitments (-18% discount) vs Monthly Rolling subscriptions over a 24-month horizon showing Net Revenue Retention (128% vs 88%), logo churn, and customer LTV.',
    sampleIdx: 2,
  },
  {
    category: 'Software',
    label: 'Text-to-UI JSON Pipeline',
    prompt: 'Create a text-to-UI JSON pipeline system architecture with interactive stepper tabs (Prompt, LLM, JSON, React, Export API) showing separation of concerns between LLM reasoning and deterministic UI rendering.',
    sampleIdx: 3,
  },
  {
    category: 'Energy',
    label: 'Renewable Grid Storage Dispatch',
    prompt: '7-Day solar and wind balancing schedule with dynamic lithium-ion battery reserve dispatch slider, daytime solar output bars, and evening discharge supply curve.',
    sampleIdx: 4,
  },
  {
    category: 'AI Systems',
    label: 'Edge NPU vs Cloud Inference',
    prompt: 'Compare on-device quantized Int4 NPU local execution against centralized cloud GPU clusters across P95 token latency (38ms vs 640ms), monthly compute bills, and offline availability.',
    sampleIdx: 5,
  },
  {
    category: 'E-Commerce',
    label: 'Mobile Checkout Funnel',
    prompt: 'Map a frictionless 5-step mobile checkout funnel from cart item reservation and biometric passkey login to geocoded shipping and 1-click tokenized payment authorization.',
    sampleIdx: 6,
  },
  {
    category: 'DevOps',
    label: 'Canary vs Blue-Green Blast Radius',
    prompt: 'Analyze progressive canary rollout vs all-at-once deployment across 100K active microservices, showing HTTP error anomaly reduction and automated rollback MTTR.',
    sampleIdx: 7,
  },
  {
    category: 'FinTech',
    label: 'Smart Order Router Slippage',
    prompt: 'Compare algorithmic multi-venue dark pool order routing against single lit exchange execution slippage and fill probability for institutional trades.',
    sampleIdx: 8,
  },
];

export const PromptBar: React.FC<Props> = ({
  onGenerate,
  isLoading,
  onSelectSample,
  onOpenTemplates,
  currentPrompt,
}) => {
  const [prompt, setPrompt] = useState(currentPrompt || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    if (currentPrompt !== undefined) {
      setPrompt(currentPrompt);
    }
  }, [currentPrompt]);

  const categories = ['All', 'System Design', 'AI Systems', 'FinTech', 'Healthcare', 'SaaS', 'Energy', 'Software', 'Fitness', 'DevOps', 'E-Commerce'];

  const filteredTopics = activeCategory === 'All'
    ? PRESET_TOPICS
    : PRESET_TOPICS.filter((t) => t.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim());
  };

  const handleSelectPreset = (idx: number, promptText: string) => {
    setPrompt(promptText);
    onSelectSample(idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* VisualizerAI Onboarding Hero Heading & Subheading */}
      <div className="text-center flex flex-col items-center gap-2 pt-2 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-[#161619]/90 text-xs font-medium tracking-wide shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-semibold">VisualizerAI</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">Interactive Systems & Data Visualizer</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
          Turn Complex Ideas into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
            Interactive Visualizations
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
          Describe any system architecture, distributed pipeline, business tradeoff, or engineering metric to generate Gemini-style interactive infographics with real-time controls, telemetry specs, and code export. Type a prompt below or select a template to start.
        </p>
      </div>

      {/* Centered Minimal Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-2xl bg-[#161619] border border-zinc-800/80 p-2 shadow-xl focus-within:border-zinc-600 transition-all"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a system architecture, tradeoff scenario, or raw data (e.g. 'Instagram feed system design')..."
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none px-3 py-1.5 focus:outline-none min-h-[46px] max-h-32 leading-relaxed"
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div className="flex items-center gap-2 pr-1 shrink-0">
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow"
            title="Generate Infographic"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>

      {/* Domain Category Filter Tabs + Template Gallery CTA */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-zinc-500 font-medium mr-1 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Use Cases:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 font-medium ${
                activeCategory === cat
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {onOpenTemplates && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-700/80 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 hover:text-white transition-all cursor-pointer shrink-0 font-medium ml-auto shadow-xs"
          >
            <LayoutTemplate className="w-3 h-3 text-zinc-300" />
            <span>Template Gallery</span>
            <span className="text-[10px] font-mono text-zinc-400">14</span>
          </button>
        )}
      </div>

      {/* Preset Inspiration Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {filteredTopics.map((preset) => (
          <button
            key={preset.sampleIdx}
            type="button"
            onClick={() => handleSelectPreset(preset.sampleIdx, preset.prompt)}
            className="px-3 py-1.5 rounded-xl border border-zinc-800/80 bg-[#161619]/60 hover:bg-[#202026] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5"
          >
            <span className="text-[10px] text-zinc-500 font-mono">[{preset.category}]</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
