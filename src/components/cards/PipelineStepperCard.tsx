import React, { useState } from 'react';
import { MinimalInfographicData } from '../../types/infographic';
import { ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  data: MinimalInfographicData;
}

export const PipelineStepperCard: React.FC<Props> = ({ data }) => {
  const pipeline = data.pipelineConfig;
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(1);

  if (!pipeline || !pipeline.steps || pipeline.steps.length === 0) {
    return <div className="text-zinc-500 text-sm">No pipeline steps defined</div>;
  }

  const steps = pipeline.steps;
  const activeStep = steps.find((s) => s.stepNumber === currentStepIdx) || steps[0];

  const handleNext = () => {
    if (currentStepIdx < steps.length) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 1) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Visual Flow Diagram Container (Matches upper diagram in Image 3) */}
      <div className="relative w-full rounded-2xl bg-[#141416] border border-zinc-800/80 p-6 sm:p-10 min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* SVG Flow Map */}
        <div className="relative w-full max-w-3xl h-64">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 760 220">
            {/* Flow Connecting Arrows & Labels */}
            {/* 1 -> 2 */}
            <path d="M 175 70 L 255 70" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="215" y="65" textAnchor="middle" fill="#71717a" fontSize="10" className="font-mono">
              User Text
            </text>

            {/* 2 -> 3 */}
            <path d="M 405 70 L 485 70" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="445" y="65" textAnchor="middle" fill="#71717a" fontSize="10" className="font-mono">
              Reasoning
            </text>

            {/* 3 -> 4 (Down & Left to React App) */}
            <path
              d="M 560 100 L 560 135 L 340 135 L 340 150"
              fill="none"
              stroke="#3f3f46"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect x="420" y="125" width="80" height="20" rx="10" fill="#18181b" stroke="#27272a" />
            <text x="460" y="139" textAnchor="middle" fill="#a1a1aa" fontSize="10" className="font-mono">
              Strict JSON
            </text>

            {/* 4 -> 5 (Right to Export API) */}
            <path d="M 410 175 L 485 175" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="425" y="165" width="75" height="20" rx="10" fill="#18181b" stroke="#27272a" />
            <text x="462" y="179" textAnchor="middle" fill="#a1a1aa" fontSize="10" className="font-mono">
              Gen Media
            </text>
          </svg>

          {/* Node 1: User Prompt */}
          <div
            onClick={() => setCurrentStepIdx(1)}
            className={`absolute top-6 left-2 sm:left-6 w-44 p-3.5 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
              currentStepIdx === 1
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#18181b]/80 border-zinc-800 hover:border-zinc-700 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${currentStepIdx === 1 ? 'text-white' : 'text-zinc-300'}`}>
              User Prompt
            </div>
            <div className="text-[11px] italic text-zinc-400 mt-0.5">
              Unstructured Text
            </div>
          </div>

          {/* Node 2: LLM Engine */}
          <div
            onClick={() => setCurrentStepIdx(2)}
            className={`absolute top-6 left-[255px] w-40 p-3.5 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
              currentStepIdx === 2
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#18181b]/80 border-zinc-800 hover:border-zinc-700 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${currentStepIdx === 2 ? 'text-white' : 'text-zinc-300'}`}>
              LLM Engine
            </div>
            <div className="text-[11px] italic text-zinc-400 mt-0.5">
              Intent & Math Reason
            </div>
          </div>

          {/* Node 3: JSON Schema */}
          <div
            onClick={() => setCurrentStepIdx(3)}
            className={`absolute top-6 right-2 sm:right-6 w-44 p-3.5 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
              currentStepIdx === 3
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#18181b]/80 border-zinc-800 hover:border-zinc-700 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${currentStepIdx === 3 ? 'text-white' : 'text-zinc-300'}`}>
              JSON Schema
            </div>
            <div className="text-[11px] italic text-zinc-400 mt-0.5">
              Data, Labels, Controls
            </div>
          </div>

          {/* Node 4: React App */}
          <div
            onClick={() => setCurrentStepIdx(4)}
            className={`absolute bottom-2 left-[255px] w-40 p-3.5 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
              currentStepIdx === 4
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#18181b]/80 border-zinc-800 hover:border-zinc-700 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${currentStepIdx === 4 ? 'text-white' : 'text-zinc-300'}`}>
              React App
            </div>
            <div className="text-[11px] italic text-zinc-400 mt-0.5">
              Safe JSON Consumer
            </div>
          </div>

          {/* Node 5: Export API */}
          <div
            onClick={() => setCurrentStepIdx(5)}
            className={`absolute bottom-2 right-2 sm:right-6 w-44 p-3.5 rounded-3xl border text-center transition-all duration-300 cursor-pointer ${
              currentStepIdx === 5
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#18181b]/80 border-zinc-800 hover:border-zinc-700 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${currentStepIdx === 5 ? 'text-white' : 'text-zinc-300'}`}>
              Export API
            </div>
            <div className="text-[11px] italic text-zinc-400 mt-0.5">
              Code / Image / Media
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Control Block (Matches lower block in Image 3) */}
      <div className="rounded-2xl bg-[#161619] border border-zinc-800/80 p-5 sm:p-6 flex flex-col gap-5">
        {/* Step Numbers & Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Step Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((st) => {
              const isActive = st.stepNumber === currentStepIdx;
              return (
                <button
                  key={st.stepNumber}
                  onClick={() => setCurrentStepIdx(st.stepNumber)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {st.stepNumber}. {st.stepTitle.replace(/Step \d+:\s*/, '').split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Prev / Next Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIdx === steps.length}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Step Details Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-white">
              {activeStep.stepTitle}
            </h4>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
              {activeStep.tag}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            {activeStep.description}
          </p>

          <div className="flex justify-center mt-2">
            <button
              className="w-7 h-7 rounded-full bg-[#18181e] border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              title="Expand"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
