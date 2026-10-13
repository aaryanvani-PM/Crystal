import React, { useState, useEffect, useId } from 'react';
import { MinimalInfographicData, PipelineNode, PipelineStep, PipelineConnection } from '../../types/infographic';
import {
  Globe,
  Shield,
  Cpu,
  Zap,
  Database,
  Server,
  HardDrive,
  Radio,
  Share2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  data: MinimalInfographicData;
}

export const PipelineStepperCard: React.FC<Props> = ({ data }) => {
  const componentId = useId().replace(/[:]/g, '');
  const pipeline = data.pipelineConfig;

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(pipeline?.currentStep || 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Sync when data changes
  useEffect(() => {
    if (pipeline?.currentStep) {
      setCurrentStepIdx(pipeline.currentStep);
    } else {
      setCurrentStepIdx(1);
    }
    setSelectedNodeId(null);
  }, [data.id, pipeline?.currentStep]);

  // Steps
  const steps: PipelineStep[] = pipeline?.steps && pipeline.steps.length > 0
    ? pipeline.steps
    : [
        {
          stepNumber: 1,
          stepTitle: 'Step 1: System Ingress',
          tag: 'INGRESS',
          description: 'Client establishes secure connection and dispatches authenticated payload.',
        },
      ];

  // Derive nodes if not provided
  const rawNodes = pipeline?.nodes || [];
  const nodes: PipelineNode[] = rawNodes.length > 0
    ? rawNodes
    : steps.map((s, idx) => ({
        id: `node-${idx + 1}`,
        label: s.stepTitle.replace(/Step \d+:\s*/, ''),
        subLabel: s.tag,
        tag: s.tag,
        activeInSteps: [s.stepNumber],
      }));

  // Auto-generate connections if not provided
  const connections: PipelineConnection[] = pipeline?.connections && pipeline.connections.length > 0
    ? pipeline.connections
    : nodes.slice(0, nodes.length - 1).map((node, i) => {
        const nextNode = nodes[i + 1];
        let label = 'Flow';
        if (i === 0) label = 'HTTPS / API';
        else if (i === 1) label = 'gRPC Stream';
        else if (i === 2) label = 'Kafka Pub/Sub';
        else if (i === 3) label = 'TCP / Sync';
        return {
          from: node.id,
          to: nextNode.id,
          label,
          protocol: label,
        };
      });

  const activeStep = steps.find((s) => s.stepNumber === currentStepIdx) || steps[0];

  // Auto-play stepper
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => (prev >= steps.length ? 1 : prev + 1));
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleNext = () => {
    if (currentStepIdx < steps.length) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setCurrentStepIdx(1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 1) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  // Node dimensions in SVG coordinate space
  const CARD_W = 240;
  const CARD_H = 106;
  const HW = CARD_W / 2; // 120
  const HH = CARD_H / 2; // 53

  // Node position layout calculation (viewBox: 0 0 1200 460)
  const getNodeCoordinates = (index: number, total: number) => {
    if (total <= 3) {
      const step = 900 / (total + 1);
      return { x: 150 + step * (index + 1), y: 220 };
    }
    if (total === 4) {
      // 2x2 Clean Loop Layout with ample spacing
      const positions = [
        { x: 300, y: 120 },
        { x: 900, y: 120 },
        { x: 900, y: 340 },
        { x: 300, y: 340 },
      ];
      return positions[index] || { x: 300 + index * 200, y: 220 };
    }
    if (total === 5) {
      // 5-Node Industry Topology:
      // Row 0: Node 0 (Client: 160), Node 1 (Gateway: 600), Node 2 (Compute: 1040)
      // Row 1: Node 3 (Storage: 1040), Node 4 (Events/Queue: 600)
      const positions = [
        { x: 160, y: 115 },
        { x: 600, y: 115 },
        { x: 1040, y: 115 },
        { x: 1040, y: 345 },
        { x: 600, y: 345 },
      ];
      return positions[index] || { x: 160 + index * 220, y: 220 };
    }
    if (total === 6) {
      // 2 rows of 3:
      // Row 0: 0 -> 1 -> 2
      // Row 1: 5 <- 4 <- 3
      const positions = [
        { x: 160, y: 115 },
        { x: 600, y: 115 },
        { x: 1040, y: 115 },
        { x: 1040, y: 345 },
        { x: 600, y: 345 },
        { x: 160, y: 345 },
      ];
      return positions[index] || { x: 160 + index * 180, y: 220 };
    }
    // 7 or more nodes: 4 columns x 2 rows
    const col = index % 4;
    const row = Math.floor(index / 4);
    const xCoords = [140, 440, 740, 1040];
    const yCoords = [115, 345];
    return { x: xCoords[col] || 600, y: yCoords[row] || 220 };
  };

  // Build coordinate map
  const nodePositions = nodes.map((n, i) => {
    const coords = getNodeCoordinates(i, nodes.length);
    return {
      node: n,
      x: coords.x,
      y: coords.y,
    };
  });

  const nodePosMap = new Map(nodePositions.map((np) => [np.node.id, np]));

  // Selected node
  const currentActiveNodeId = activeStep.activeNodeId || (activeStep.activeNodeIds && activeStep.activeNodeIds[0]);
  const activeNode = nodes.find((n) => n.id === (selectedNodeId || currentActiveNodeId)) || nodes[0];

  // Helper icon selection
  const getNodeIcon = (node: PipelineNode) => {
    const t = (node.tier || '').toLowerCase();
    const l = (node.label || '').toLowerCase();
    const tg = (node.tag || '').toLowerCase();
    if (t.includes('client') || l.includes('prompt') || l.includes('sdk') || l.includes('user') || tg.includes('client')) return Globe;
    if (t.includes('gateway') || l.includes('auth') || l.includes('envoy') || tg.includes('gateway') || tg.includes('idempotency')) return Shield;
    if (t.includes('compute') || l.includes('engine') || l.includes('llm') || tg.includes('reasoning') || tg.includes('switch')) return Cpu;
    if (t.includes('cache') || l.includes('redis') || tg.includes('cache') || tg.includes('in-memory')) return Zap;
    if (t.includes('storage') || l.includes('ledger') || l.includes('db') || tg.includes('storage') || tg.includes('ledger')) return Database;
    if (t.includes('event') || l.includes('webhook') || l.includes('stream') || tg.includes('webhook') || tg.includes('async')) return Radio;
    if (l.includes('export') || l.includes('json') || tg.includes('json')) return HardDrive;
    if (l.includes('react') || tg.includes('render')) return Globe;
    return Server;
  };

  const getTierColor = (node: PipelineNode) => {
    const t = (node.tier || '').toLowerCase();
    const tg = (node.tag || '').toLowerCase();
    if (t.includes('client') || tg.includes('client') || tg.includes('user')) return 'text-sky-400 bg-sky-950/40 border-sky-800/60';
    if (t.includes('gateway') || tg.includes('gateway') || tg.includes('idempotency')) return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60';
    if (t.includes('compute') || tg.includes('reasoning') || tg.includes('switch')) return 'text-blue-400 bg-blue-950/40 border-blue-800/60';
    if (t.includes('cache') || tg.includes('cache') || tg.includes('in-memory')) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    if (t.includes('storage') || tg.includes('ledger') || tg.includes('storage')) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    if (t.includes('event') || tg.includes('webhook') || tg.includes('async')) return 'text-purple-400 bg-purple-950/40 border-purple-800/60';
    return 'text-zinc-300 bg-zinc-800/60 border-zinc-700/60';
  };

  // Pure geometry path routing between nodes that GUARANTEES zero card overlap
  const routeConnection = (src: { x: number; y: number }, dst: { x: number; y: number }) => {
    const dx = dst.x - src.x;
    const dy = dst.y - src.y;

    // 1. Same-Row Horizontal Connection (e.g. Node 0 -> Node 1, Node 1 -> Node 2)
    if (Math.abs(dy) < 30) {
      if (dx > 0) {
        // Flowing Right
        const startX = src.x + HW;
        const endX = dst.x - HW;
        return {
          pathD: `M ${startX} ${src.y} L ${endX} ${dst.y}`,
          labelX: (startX + endX) / 2,
          labelY: src.y,
        };
      } else {
        // Flowing Left (e.g. Node 3 -> Node 4 on Row 1)
        const startX = src.x - HW;
        const endX = dst.x + HW;
        return {
          pathD: `M ${startX} ${src.y} L ${endX} ${dst.y}`,
          labelX: (startX + endX) / 2,
          labelY: src.y,
        };
      }
    }

    // 2. Same-Column Vertical Connection (e.g. Node 2 at Col 2 down to Node 3 at Col 2)
    if (Math.abs(dx) < 30) {
      if (dy > 0) {
        // Top to Bottom
        const startY = src.y + HH;
        const endY = dst.y - HH;
        return {
          pathD: `M ${src.x} ${startY} L ${dst.x} ${endY}`,
          labelX: src.x,
          labelY: (startY + endY) / 2,
        };
      } else {
        // Bottom to Top
        const startY = src.y - HH;
        const endY = dst.y + HH;
        return {
          pathD: `M ${src.x} ${startY} L ${dst.x} ${endY}`,
          labelX: src.x,
          labelY: (startY + endY) / 2,
        };
      }
    }

    // 3. Bottom Row returning to Top Left (e.g. Webhook at 600, 345 back to Client at 160, 115)
    if (src.y > dst.y && dx < 0) {
      // Exits left of src at (src.x - HW, src.y)
      // Travels horizontally left across the empty Col 0, Row 1 space to dst.x (160)
      // Curves up and connects cleanly to bottom connector of dst at (dst.x, dst.y + HH)
      const startX = src.x - HW;
      const startY = src.y;
      const targetX = dst.x;
      const targetY = dst.y + HH;
      const radius = 18;
      const pathD = `M ${startX} ${startY} H ${targetX + radius} Q ${targetX} ${startY}, ${targetX} ${startY - radius} V ${targetY}`;
      return {
        pathD,
        labelX: (startX + targetX) / 2,
        labelY: startY,
      };
    }

    // 4. Any other diagonal (smooth stepped curve)
    const startX = dx > 0 ? src.x + HW : src.x - HW;
    const startY = src.y;
    const endX = dst.x;
    const endY = dy > 0 ? dst.y - HH : dst.y + HH;
    const midX = (startX + endX) / 2;
    const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    return {
      pathD,
      labelX: midX,
      labelY: (startY + endY) / 2,
    };
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Visual System Architecture Diagram Container */}
      <div className="relative w-full rounded-2xl bg-[#141416] border border-zinc-800/80 p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Subtle Architecture Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Diagram Top Bar: Architecture Tier Badges & Active Step Indicator */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase">
              Topology: {pipeline?.architectureTierLabels?.join('  •  ') || 'Distributed System Pipeline'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-300">
              Active Stage: Step {currentStepIdx} of {steps.length}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause replay' : 'Auto-advance replay'}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{isPlaying ? 'Pause' : 'Replay'}</span>
            </button>
          </div>
        </div>

        {/* Responsive Vector Architecture Canvas (Locked 1200:460 Aspect Ratio) */}
        <div className="relative w-full overflow-x-auto no-scrollbar">
          <svg
            className="w-full h-auto min-w-[720px] sm:min-w-0"
            viewBox="0 0 1200 460"
            preserveAspectRatio="xMidYMid meet"
          >
            <style>{`
              @keyframes pulseDash {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: -32; }
              }
              .pulse-flow-wire {
                animation: pulseDash 1.2s linear infinite;
              }
            `}</style>

            <defs>
              {/* Inactive Line Arrow */}
              <marker
                id={`arrow-dim-${componentId}`}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3f3f46" />
              </marker>

              {/* Active Glowing Flow Arrow */}
              <marker
                id={`arrow-active-${componentId}`}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#60a5fa" />
              </marker>

              {/* Active Pulse Glow Filter */}
              <filter id={`glow-${componentId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Connection Lines & Animated Flow Pulses */}
            {connections.map((conn, idx) => {
              const src = nodePosMap.get(conn.from);
              const dst = nodePosMap.get(conn.to);
              if (!src || !dst) return null;

              const isSrcActive = src.node.activeInSteps.includes(currentStepIdx);
              const isDstActive = dst.node.activeInSteps.includes(currentStepIdx);
              const isFlowActive = isSrcActive || isDstActive;

              const route = routeConnection(src, dst);
              const pillWidth = Math.min(160, Math.max(88, (conn.label?.length || 8) * 6.6 + 22));

              return (
                <g key={`conn-${idx}`}>
                  {/* Base Wire Path */}
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke={isFlowActive ? '#3b82f6' : '#27272a'}
                    strokeWidth={isFlowActive ? 2 : 1.5}
                    strokeDasharray={conn.style === 'dashed' || !isFlowActive ? '4 4' : undefined}
                    markerEnd={`url(#${isFlowActive ? `arrow-active-${componentId}` : `arrow-dim-${componentId}`})`}
                    className="transition-colors duration-300"
                  />

                  {/* Active Flow Animated Pulse Effect */}
                  {isFlowActive && (
                    <path
                      d={route.pathD}
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth={2.5}
                      strokeDasharray="6 10"
                      filter={`url(#glow-${componentId})`}
                      className="pulse-flow-wire"
                    />
                  )}

                  {/* Protocol / Flow Label Pill (Opaque dark background with exact padding) */}
                  {conn.label && (
                    <g transform={`translate(${route.labelX}, ${route.labelY})`}>
                      <rect
                        x={-pillWidth / 2}
                        y="-11"
                        width={pillWidth}
                        height="22"
                        rx="11"
                        fill="#121216"
                        stroke={isFlowActive ? '#3b82f6' : '#2e2e38'}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill={isFlowActive ? '#93c5fd' : '#8e8ea0'}
                        fontSize="9.5"
                        fontWeight="600"
                        letterSpacing="0.02em"
                        className="font-mono select-none"
                      >
                        {conn.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 2. Interactive Node Cards (Rendered with foreignObject for 1:1 Vector Alignment) */}
            {nodePositions.map(({ node, x, y }) => {
              const isStepActive = node.activeInSteps.includes(currentStepIdx);
              const isSelected = selectedNodeId === node.id || (!selectedNodeId && isStepActive);
              const Icon = getNodeIcon(node);
              const tierBadgeStyle = getTierColor(node);

              return (
                <foreignObject
                  key={node.id}
                  x={x - HW}
                  y={y - HH}
                  width={CARD_W}
                  height={CARD_H}
                  className="overflow-visible"
                >
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full h-full p-3 rounded-2xl border transition-all duration-300 cursor-pointer select-none flex flex-col justify-between ${
                      isStepActive
                        ? 'bg-[#121929] border-blue-500 shadow-xl shadow-blue-500/25 ring-1 ring-blue-400/50'
                        : isSelected
                        ? 'bg-[#181820] border-zinc-600 shadow-md'
                        : 'bg-[#141418] border-zinc-800 hover:border-zinc-700 hover:bg-[#18181e]'
                    }`}
                  >
                    {/* Top Row: Icon + Tag + Active Beacon */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isStepActive
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        {node.tag && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-medium truncate ${tierBadgeStyle}`}
                          >
                            {node.tag}
                          </span>
                        )}
                      </div>

                      {isStepActive && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Subtitle */}
                    <div className="flex flex-col my-auto">
                      <div
                        className={`text-[12px] font-bold leading-tight truncate ${
                          isStepActive ? 'text-white' : 'text-zinc-200'
                        }`}
                        title={node.label}
                      >
                        {node.label}
                      </div>
                      <div
                        className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate"
                        title={node.subLabel}
                      >
                        {node.subLabel}
                      </div>
                    </div>

                    {/* Bottom: Telemetry SLA */}
                    {node.metric && (
                      <div className="pt-1 border-t border-zinc-800/80 flex items-center gap-1.5 text-[9.5px] font-mono overflow-hidden">
                        <span className="text-zinc-500 shrink-0">Telemetry:</span>
                        <span
                          className={`font-semibold truncate ${
                            isStepActive ? 'text-blue-300' : 'text-zinc-300'
                          }`}
                          title={node.metric}
                        >
                          {node.metric}
                        </span>
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Stepper Control & Deep Architectural Inspection Block */}
      <div className="rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
        {/* Step Numbers & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          {/* Step Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((st) => {
              const isActive = st.stepNumber === currentStepIdx;
              const shortTitle = st.stepTitle.replace(/Step \d+:\s*/, '').split(' ')[0];
              return (
                <button
                  key={st.stepNumber}
                  onClick={() => {
                    setCurrentStepIdx(st.stepNumber);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 bg-zinc-900/60 border border-zinc-800/60'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${isActive ? 'bg-white text-blue-700 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                    {st.stepNumber}
                  </span>
                  <span>{shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1"
            >
              <span>{currentStepIdx === steps.length ? 'Restart Step 1' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Details & Deep Architectural Rationale Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-3 relative">
          {/* Step Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-900/40 border border-blue-500/40 text-blue-300 text-xs font-bold font-mono flex items-center justify-center">
                {activeStep.stepNumber}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {activeStep.stepTitle}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {activeStep.latency && (
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-blue-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-400" />
                  {activeStep.latency}
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                {activeStep.tag}
              </span>
            </div>
          </div>

          {/* Core Step Description */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {activeStep.description}
          </p>

          {/* Two-Column Deep Insights: Architectural Rationale & Failure Mode */}
          {(activeStep.architecturalRationale || activeStep.failureMode) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 pt-3 border-t border-zinc-800/70">
              {activeStep.architecturalRationale && (
                <div className="p-3 rounded-lg bg-[#141418] border border-zinc-800/90 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Architectural Rationale</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    {activeStep.architecturalRationale}
                  </div>
                </div>
              )}

              {activeStep.failureMode && (
                <div className="p-3 rounded-lg bg-[#141418] border border-zinc-800/90 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Resilience & Graceful Degradation</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    {activeStep.failureMode}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Node Inspector Footer: Shows selected node specs */}
          {activeNode && (
            <div className="mt-1 pt-2.5 border-t border-zinc-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Inspecting Node:</span>
                <span className="font-semibold text-zinc-200">{activeNode.label}</span>
                <span className="text-zinc-500">({activeNode.subLabel})</span>
              </div>
              {activeNode.technicalSpecs && activeNode.technicalSpecs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeNode.technicalSpecs.map((spec, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[10px]">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
