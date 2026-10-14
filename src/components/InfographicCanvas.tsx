import React from 'react';
import { MinimalInfographicData } from '../types/infographic';
import { ScenarioAreaCard } from './cards/ScenarioAreaCard';
import { DynamicSliderScheduleCard } from './cards/DynamicSliderScheduleCard';
import { PipelineStepperCard } from './cards/PipelineStepperCard';
import { Sliders, Share2, Download, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  data: MinimalInfographicData;
  domainInfo?: { emoji: string; category: string };
  onOpenEditor?: () => void;
  onOpenShare?: () => void;
  onOpenExport?: () => void;
  onReset?: () => void;
}

export const InfographicCanvas: React.FC<Props> = ({
  data,
  domainInfo,
  onOpenEditor,
  onOpenShare,
  onOpenExport,
  onReset,
}) => {
  return (
    <div className="w-full flex justify-center py-2">
      {/* Target export card matching user's Gemini screenshots */}
      <div
        id="infographic-export-card"
        className="w-full max-w-4xl rounded-3xl bg-[#111113] border border-zinc-800/90 p-6 sm:p-9 shadow-2xl flex flex-col gap-6 text-white font-sans relative"
      >
        {/* Title, Subtitle & In-Card Contextual Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {domainInfo && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 bg-zinc-800/80 border-zinc-700/60 text-zinc-300 shadow-xs shrink-0">
                  <span>{domainInfo.emoji}</span>
                  <span>{domainInfo.category}</span>
                </span>
                <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
                  {data.cardType === 'stepper-pipeline'
                    ? 'Interactive Architecture Pipeline'
                    : data.cardType === 'scenario-area'
                    ? 'Comparative Trade-Off Model'
                    : 'Dynamic Schedule & Slider'}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {data.title}
            </h1>
            {data.subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Action buttons inside the card (excluded from PNG/PDF export) */}
          {(onOpenEditor || onOpenShare || onOpenExport || onReset) && (
            <div
              data-html2canvas-ignore="true"
              className="flex items-center gap-2 shrink-0 self-start pt-0.5 flex-wrap"
            >
              {/* Saved locally status */}
              <div
                className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1.5 rounded-xl shadow-xs"
                title="Your work is automatically saved in browser local storage and preserved on page refresh"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Saved</span>
              </div>

              {/* Reset button */}
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-zinc-800"
                  title="Reset to default template"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {onOpenEditor && (
                <button
                  type="button"
                  data-tour="tour-editor"
                  onClick={onOpenEditor}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#18181d] hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
                  title="Edit infographic specs & data"
                >
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit</span>
                </button>
              )}

              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#18181d] hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
                  title="Share infographic"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Share</span>
                </button>
              )}

              {onOpenExport && (
                <button
                  type="button"
                  data-tour="tour-export"
                  onClick={onOpenExport}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  title="Export as PNG, PDF, SVG, React Code, or JSON"
                >
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>Export</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Card Archetype */}
        {data.cardType === 'scenario-area' && <ScenarioAreaCard data={data} />}
        {data.cardType === 'dynamic-slider-schedule' && (
          <DynamicSliderScheduleCard data={data} />
        )}
        {data.cardType === 'stepper-pipeline' && (
          <PipelineStepperCard data={data} />
        )}

        {/* Fallback for general combo/area cards */}
        {data.cardType !== 'scenario-area' &&
          data.cardType !== 'dynamic-slider-schedule' &&
          data.cardType !== 'stepper-pipeline' && (
            <ScenarioAreaCard data={data} />
          )}
      </div>
    </div>
  );
};
