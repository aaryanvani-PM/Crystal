import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Sliders,
  Download,
  LayoutTemplate,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  MousePointerClick,
  Layers,
} from 'lucide-react';

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  proTip?: string;
  icon: React.ReactNode;
  badge: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'prompt',
    selector: '[data-tour="tour-prompt"]',
    title: 'AI Command Center & Prompting',
    description:
      'Describe any concept, system architecture, metabolic protocol, or financial model in natural language. VisualizerAI will synthesize a live, interactive visualization card.',
    proTip: 'You can also click any of the multi-domain preset cards below the prompt to test instant blueprints.',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    badge: 'Step 1 of 5',
  },
  {
    id: 'canvas',
    selector: '[data-tour="tour-canvas"]',
    title: 'Interactive Visual Canvas',
    description:
      'Every generated diagram is alive. Click pipeline stepper stages to advance state, adjust dynamic schedule sliders, inspect telemetry specs, and toggle scenarios in real time.',
    proTip: 'Try clicking on the pipeline stages or scenario tabs right on the canvas.',
    icon: <Layers className="w-4 h-4 text-sky-400" />,
    badge: 'Step 2 of 5',
  },
  {
    id: 'editor',
    selector: '[data-tour="tour-editor"]',
    title: 'Live Editor & AI Refinement',
    description:
      'Fine-tune your visual cards without writing code. Rename stages, edit metrics, adjust parameters, or prompt Gemini to refactor structure conversationally.',
    proTip: 'Click the "Edit" button right on top of the card or inside the card header to open the slide-over live editor drawer.',
    icon: <Sliders className="w-4 h-4 text-amber-400" />,
    badge: 'Step 3 of 5',
  },
  {
    id: 'export',
    selector: '[data-tour="tour-export"]',
    title: 'Production Export & PDF Generation',
    description:
      'Export production-ready PDF documents, vector SVG, and high-res PNG for slide decks and executive memos, or copy standalone React + Tailwind TypeScript code to drop into your apps.',
    proTip: 'Click "Export" directly on the card to choose between PDF, PNG, SVG, React code, or raw JSON.',
    icon: <Download className="w-4 h-4 text-rose-400" />,
    badge: 'Step 4 of 5',
  },
  {
    id: 'templates',
    selector: '[data-tour="tour-templates"]',
    title: 'Multi-Domain Template Gallery',
    description:
      'Explore 18 curated blueprints across Tech & Systems, Health & Fitness, Business & Finance, and Science & Biotech. Load any template with 1 click.',
    proTip: 'Use search and domain filter tabs inside the gallery to quickly discover proven industry designs.',
    icon: <LayoutTemplate className="w-4 h-4 text-purple-400" />,
    badge: 'Step 5 of 5',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const OnboardingWalkthrough: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Measure and highlight target element
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Smoothly bring element into viewport if outside
      const isInView =
        rect.top >= 60 &&
        rect.bottom <= window.innerHeight - 60 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!isInView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow layout changes
    const timer = setTimeout(updateTargetRect, 60);

    const handleResize = () => updateTargetRect();
    const handleScroll = () => {
      // Re-measure on scroll
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  const handleFinish = () => {
    onClose();
    if (onComplete) onComplete();
  };

  // Compute tooltip position relative to targetRect
  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 380;
    const tooltipHeight = 220;
    const padding = 16;

    if (!targetRect) {
      // Fallback: center in screen
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${tooltipWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
      };
    }

    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;

    let top = 0;
    // Prefer below if there's enough room, else place above
    if (spaceBelow >= tooltipHeight + 20 || spaceBelow > spaceAbove) {
      top = targetRect.top + targetRect.height + 14;
    } else {
      top = Math.max(16, targetRect.top - tooltipHeight - 14);
    }

    // Horizontal centering relative to target, clamped to viewport
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 60,
    };
  };

  const padding = 8;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
      {/* SVG Spotlight Mask */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        onClick={handleDismiss}
      >
        <defs>
          <mask id="walkthrough-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - padding)}
                y={Math.max(0, targetRect.top - padding)}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={14}
                ry={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(8, 8, 10, 0.78)"
          mask="url(#walkthrough-spotlight-mask)"
          className="transition-all duration-300"
        />
      </svg>

      {/* Pulsing highlight border around active target */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
          className="rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(52,211,153,0.35)] pointer-events-none z-50 transition-all duration-300 animate-pulse"
        />
      )}

      {/* Floating Walkthrough Tooltip Card */}
      <div
        style={getTooltipStyle()}
        className="z-60 flex flex-col rounded-2xl border border-zinc-700/80 bg-[#161619] shadow-2xl p-5 text-zinc-100 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                {currentStep.badge}
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close walkthrough (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-3 flex flex-col gap-2.5">
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentStep.description}
          </p>

          {currentStep.proTip && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400">
              <MousePointerClick className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong className="text-zinc-200">Pro Tip: </strong>
                {currentStep.proTip}
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-5 bg-emerald-400'
                    : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Skip
            </button>

            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>
                {currentStepIndex === TOUR_STEPS.length - 1
                  ? "Got it, Let's Build"
                  : 'Next'}
              </span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
