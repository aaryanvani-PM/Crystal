import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, LayoutTemplate, ArrowRight, Check, HelpCircle } from 'lucide-react';

interface Props {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  onSelectSample: (index: number) => void;
  onOpenTemplates?: () => void;
  onStartTour?: () => void;
  currentPrompt?: string;
  activeSampleId?: string;
}

interface QuickExample {
  id: string;
  domain: 'Tech' | 'Health' | 'Business' | 'Science';
  domainEmoji: string;
  domainLabel: string;
  metric: string;
  title: string;
  highlight: string;
  prompt: string;
  sampleIdx: number;
  sampleId: string;
  isFeatured?: boolean;
}

const FEATURED_MODELS: QuickExample[] = [
  // --- Cross-Domain Featured Highlights ---
  {
    id: 'instagram',
    domain: 'Tech',
    domainEmoji: '💻',
    domainLabel: 'System Design',
    metric: '500M DAU',
    title: 'Instagram Feed Fan-Out',
    highlight: 'Hybrid push/pull fanout & Redis sorted sets',
    prompt: 'Design Instagram high-throughput feed generation and fan-out system architecture with interactive stepper tabs (Mobile CDN, Envoy Gateway, Hybrid Push/Pull Fanout, Redis Sorted Sets, PostgreSQL Shards) handling 500M daily active users.',
    sampleIdx: 9,
    sampleId: 'sample-instagram-architecture',
    isFeatured: true,
  },
  {
    id: 'cardio',
    domain: 'Health',
    domainEmoji: '🏃',
    domainLabel: 'Metabolism',
    metric: '95% Fat Burn',
    title: 'Cardio Timing & Substrates',
    highlight: 'Fat oxidation vs glycogen depletion 75m curve',
    prompt: 'Compare fat oxidation vs glycogen burn (% Fat vs % Glycogen) over a 75-minute exercise timeline for Elliptical After Lift (post-workout) vs Elliptical Before Lift (pre-workout) with 3 key metrics and metabolic takeaway.',
    sampleIdx: 0,
    sampleId: 'sample-cardio-timing',
    isFeatured: true,
  },
  {
    id: 'saas',
    domain: 'Business',
    domainEmoji: '💼',
    domainLabel: 'SaaS Finance',
    metric: '128% NRR',
    title: 'SaaS Cohort Expansion & NRR',
    highlight: 'Annual upfront commitments vs rolling monthly retention',
    prompt: 'Compare Annual Upfront commitments (-18% discount) vs Monthly Rolling subscriptions over a 24-month horizon showing Net Revenue Retention (128% vs 88%), logo churn, and customer LTV.',
    sampleIdx: 2,
    sampleId: 'sample-saas-pricing',
    isFeatured: true,
  },
  {
    id: 'crispr',
    domain: 'Science',
    domainEmoji: '🔬',
    domainLabel: 'Genomics',
    metric: '88% Precision',
    title: 'CRISPR Prime Editing vs Cas9',
    highlight: 'On-target search & replace vs DSB translocations',
    prompt: 'Compare CRISPR Prime Editing search-and-replace against standard Cas9 blunt double-strand breaks across on-target efficiency (88% vs 62%) and off-target translocation indel safety (<0.1% vs 14.8%).',
    sampleIdx: 13,
    sampleId: 'sample-crispr-prime-editing',
    isFeatured: true,
  },

  // --- Tech & Systems ---
  {
    id: 'uber',
    domain: 'Tech',
    domainEmoji: '💻',
    domainLabel: 'Spatial Systems',
    metric: '<50ms P99',
    title: 'Uber Geospatial Dispatch',
    highlight: 'H3 hexagonal indexing & Kafka state streams',
    prompt: 'Map Uber real-time driver dispatch architecture across H3 hexagonal spatial indexing clusters with batch bipartite matching, Kafka location streams, and Cassandra trip ledger.',
    sampleIdx: 10,
    sampleId: 'sample-uber-dispatch',
  },
  {
    id: 'kafka',
    domain: 'Tech',
    domainEmoji: '💻',
    domainLabel: 'Stream Backbone',
    metric: '180K msgs/s',
    title: 'Kafka Real-Time Order Stream',
    highlight: 'KRaft consensus, Flink windows & dual OLAP sink',
    prompt: 'Map Kafka event-driven real-time order streaming architecture across Envoy gateway ingress, partitioned topic log replication with Raft KRaft consensus, Apache Flink stateful aggregations, and dual OLAP analytical sink.',
    sampleIdx: 14,
    sampleId: 'sample-kafka-streaming',
  },
  {
    id: 'rag',
    domain: 'Tech',
    domainEmoji: '💻',
    domainLabel: 'AI & ML',
    metric: 'Sub-300ms',
    title: 'Enterprise LLM RAG Pipeline',
    highlight: 'Hybrid vector search & cross-encoder rerank',
    prompt: 'Create an enterprise RAG search architecture with hybrid dense vector retrieval, BM25 keyword fusion, cross-encoder re-ranking, and grounded Gemini synthesis with citation anchoring.',
    sampleIdx: 12,
    sampleId: 'sample-rag-pipeline',
  },
  {
    id: 'npu',
    domain: 'Tech',
    domainEmoji: '💻',
    domainLabel: 'Edge AI',
    metric: '38ms Tokens',
    title: 'Edge NPU vs Cloud Inference',
    highlight: 'Quantized Int4 local execution vs cloud GPU',
    prompt: 'Compare on-device quantized Int4 NPU local execution against centralized cloud GPU clusters across P95 token latency (38ms vs 640ms), monthly compute bills, and offline availability.',
    sampleIdx: 5,
    sampleId: 'sample-edge-ai',
  },

  // --- Health & Fitness ---
  {
    id: 'weekly-stress',
    domain: 'Health',
    domainEmoji: '🏃',
    domainLabel: 'Periodization',
    metric: '620 AU Load',
    title: 'Weekly Stress & Recovery Schedule',
    highlight: '5-day lifting split with dynamic Zone 2 cardio slider',
    prompt: '5-Day lifting split + dynamic 45-min Zone 2 cardio frequency schedule from Mon to Sun with an interactive slider for cardio days per week, pink lifting stress bars, yellow cardio stress bars, and cyan fat oxidation curve.',
    sampleIdx: 1,
    sampleId: 'sample-weekly-stress',
  },
  {
    id: 'hypertrophy',
    domain: 'Health',
    domainEmoji: '🏃',
    domainLabel: 'Muscle Physiology',
    metric: '94% Stimulus',
    title: 'Hypertrophy vs Systemic Fatigue',
    highlight: 'MPS stimulus plateau vs central nervous system fatigue',
    prompt: 'Compare optimal weekly hypertrophy set volume (14-18 sets per muscle group) against excessive junk volume (28-36 sets) showing muscle protein synthesis stimulus plateau and systemic CNS fatigue accumulation curve.',
    sampleIdx: 15,
    sampleId: 'sample-hypertrophy-volume',
  },

  // --- Business & Finance ---
  {
    id: 'stripe',
    domain: 'Business',
    domainEmoji: '💼',
    domainLabel: 'FinTech Rails',
    metric: '99.999% SLA',
    title: 'Stripe Payment Settlement',
    highlight: 'Redis idempotency vault & double-entry ledger',
    prompt: 'Architect Stripe global payment settlement engine with client tokenization, distributed Redis idempotency vault, ISO 8583 bank authorization, and immutable double-entry ledger.',
    sampleIdx: 11,
    sampleId: 'sample-stripe-settlement',
  },
  {
    id: 'waterfall',
    domain: 'Business',
    domainEmoji: '💼',
    domainLabel: 'Cap Table & VC',
    metric: '$45M Common',
    title: 'VC Liquidation Waterfall',
    highlight: '1x Non-Participating vs 2x Participating preferred',
    prompt: 'Compare startup venture capital liquidation waterfall for 1x Non-Participating Preferred vs 2x Participating Preferred with no cap across exit valuations from $10M to $130M showing common shareholder payout vs preferred recovery.',
    sampleIdx: 16,
    sampleId: 'sample-liquidation-waterfall',
  },
  {
    id: 'sor',
    domain: 'Business',
    domainEmoji: '💼',
    domainLabel: 'Trading Desk',
    metric: '-18.4 bps',
    title: 'Order Routing & Slippage',
    highlight: 'Dark pool hidden liquidity vs single lit fill',
    prompt: 'Compare algorithmic multi-venue dark pool order routing against single lit exchange execution slippage and fill probability for institutional trades.',
    sampleIdx: 8,
    sampleId: 'sample-trading-sor',
  },

  // --- Science & Biotech ---
  {
    id: 'mrna',
    domain: 'Science',
    domainEmoji: '🔬',
    domainLabel: 'Biotechnology',
    metric: '95% Titers',
    title: 'mRNA Lipid Nanoparticle Delivery',
    highlight: 'Endosomal escape, spike synthesis & memory B/T cells',
    prompt: 'Model mRNA vaccine lipid nanoparticle cellular delivery and immune activation cascade across endosomal escape, ribosomal spike protein synthesis, dendritic cell MHC presentation, and long-term neutralizing antibody memory.',
    sampleIdx: 17,
    sampleId: 'sample-mrna-vaccine',
  },
  {
    id: 'grid-storage',
    domain: 'Science',
    domainEmoji: '🔬',
    domainLabel: 'Clean Energy',
    metric: '412 MWh Saved',
    title: 'Renewable Grid Battery Dispatch',
    highlight: '7-day solar & wind with lithium-ion dispatch slider',
    prompt: '7-Day solar and wind balancing schedule with dynamic lithium-ion battery reserve dispatch slider, daytime solar output bars, and evening discharge supply curve.',
    sampleIdx: 4,
    sampleId: 'sample-grid-storage',
  },
];

interface DomainTab {
  id: string;
  label: string;
  emoji: string;
}

const DOMAIN_TABS: DomainTab[] = [
  { id: 'Featured', label: 'Featured', emoji: '✨' },
  { id: 'Tech', label: 'Tech & Systems', emoji: '💻' },
  { id: 'Health', label: 'Health & Fitness', emoji: '🏃' },
  { id: 'Business', label: 'Business & Finance', emoji: '💼' },
  { id: 'Science', label: 'Science & Biotech', emoji: '🔬' },
];

export const PromptBar: React.FC<Props> = ({
  onGenerate,
  isLoading,
  onSelectSample,
  onOpenTemplates,
  onStartTour,
  currentPrompt,
  activeSampleId,
}) => {
  const [prompt, setPrompt] = useState(currentPrompt || '');
  const [activeDomain, setActiveDomain] = useState<string>('Featured');

  useEffect(() => {
    if (currentPrompt !== undefined) {
      setPrompt(currentPrompt);
    }
  }, [currentPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim());
  };

  const handleSelectExample = (example: QuickExample) => {
    setPrompt(example.prompt);
    onSelectSample(example.sampleIdx);
  };

  // Filter items based on active domain
  const visibleExamples = React.useMemo(() => {
    if (activeDomain === 'Featured') {
      return FEATURED_MODELS.filter((item) => item.isFeatured);
    }
    return FEATURED_MODELS.filter((item) => item.domain === activeDomain);
  }, [activeDomain]);

  const getDomainStyle = (domain: string) => {
    switch (domain) {
      case 'Tech':
        return 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40';
      case 'Health':
        return 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40';
      case 'Business':
        return 'text-amber-300 bg-amber-950/40 border-amber-800/40';
      case 'Science':
        return 'text-sky-300 bg-sky-950/40 border-sky-800/40';
      default:
        return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Integrated Unified Header (No Redundant Top Bar) */}
      <div className="w-full flex items-center justify-between pt-1 pb-0.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">
              Visualizer<span className="text-zinc-400 font-normal">AI</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hidden sm:inline">
              Universal Visualizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800/80 bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-xs"
              title="Feature Walkthrough Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          {onOpenTemplates && (
            <button
              type="button"
              data-tour="tour-templates"
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 font-medium transition-colors cursor-pointer shadow-xs text-xs"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-zinc-300" />
              <span>Templates</span>
              <span className="text-[10px] font-mono bg-zinc-900/90 text-zinc-400 px-1.5 py-0.2 rounded-md ml-0.5 font-bold">
                18
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Headline & Value Proposition */}
      <div className="text-center flex flex-col items-center gap-2 pt-1 pb-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Turn Any Idea, Data, or System into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
            Interactive Visuals
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
          Transform complex workflows, system architectures, metabolic protocols, and financial models into live, responsive diagrams with interactive sliders and real-time scenario controls.
        </p>
      </div>

      {/* Modern AI Command Center Prompt Bar */}
      <form
        data-tour="tour-prompt"
        onSubmit={handleSubmit}
        className="group relative flex flex-col rounded-2xl bg-[#141417] border border-zinc-800 shadow-2xl focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/20 transition-all p-2.5"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe any concept, workflow, or system (e.g. 'Instagram feed fan-out with Redis' or 'Cardio fat oxidation vs glycogen burn' or 'SaaS NRR cohort retention')..."
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none px-3 pt-1 pb-2 focus:outline-none min-h-[52px] max-h-36 leading-relaxed"
          rows={2}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {/* Input Bar Action Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 px-1">
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 select-none">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[10px] text-zinc-300">
              ↵ Enter
            </kbd>
            <span className="hidden sm:inline">to visualize</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Visualize Concept</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Multi-Domain Presets & Quick Examples Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Domain Category Filter Tabs with Emojis */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-zinc-500 font-medium mr-1.5 shrink-0 hidden sm:inline">
              Domains:
            </span>
            {DOMAIN_TABS.map((tab) => {
              const isActive = activeDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDomain(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="text-xs">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Template Gallery Link CTA */}
          {onOpenTemplates && (
            <button
              type="button"
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer ml-auto group py-1"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
              <span className="font-medium">Browse all 18 templates</span>
              <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Curated Multi-Domain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {visibleExamples.map((ex) => {
            const isActive = activeSampleId === ex.sampleId;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExample(ex)}
                className={`group p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'border-zinc-500 bg-[#1c1c22] ring-1 ring-zinc-500/40 shadow-xs'
                    : 'border-zinc-800/80 bg-[#151518]/60 hover:bg-[#1a1a20] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 ${getDomainStyle(ex.domain)}`}>
                      <span>{ex.domainEmoji}</span>
                      <span>{ex.domain}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline truncate max-w-[80px]">
                      {ex.domainLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-zinc-400">{ex.metric}</span>
                    {isActive && (
                      <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-zinc-100 group-hover:text-white leading-snug line-clamp-1">
                    {ex.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-normal line-clamp-1 mt-0.5">
                    {ex.highlight}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
