import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface Props {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  onSelectSample: (index: number) => void;
}

const PRESET_TOPICS = [
  {
    label: 'Cardio Timing & Substrates',
    prompt: 'Compare fat oxidation vs glycogen burn (% Fat vs % Glycogen) over a 75-minute exercise timeline for Elliptical After Lift (post-workout) vs Elliptical Before Lift (pre-workout) with 3 key metrics and metabolic takeaway.',
    sampleIdx: 0,
  },
  {
    label: 'Weekly Stress & Recovery Schedule',
    prompt: '5-Day lifting split + dynamic 45-min Zone 2 cardio frequency schedule from Mon to Sun with an interactive slider for cardio days per week, pink lifting stress bars, yellow cardio stress bars, and cyan fat oxidation curve.',
    sampleIdx: 1,
  },
  {
    label: 'Text-to-UI JSON Pipeline',
    prompt: 'Create a text-to-UI JSON pipeline system architecture with interactive stepper tabs (Prompt, LLM, JSON, React, Export API) showing separation of concerns between LLM reasoning and deterministic UI rendering.',
    sampleIdx: 2,
  },
];

export const PromptBar: React.FC<Props> = ({ onGenerate, isLoading, onSelectSample }) => {
  const [prompt, setPrompt] = useState('');

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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {/* Centered Minimal Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-2xl bg-[#161619] border border-zinc-800/80 p-2 shadow-xl focus-within:border-zinc-600 transition-all"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Throw any problem, topic, or raw data here..."
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none px-3 py-1.5 focus:outline-none min-h-[44px] max-h-32 leading-relaxed"
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

      {/* Preset Inspiration Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-zinc-500 shrink-0 text-[11px] font-medium mr-1">
          Examples:
        </span>
        {PRESET_TOPICS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset.sampleIdx, preset.prompt)}
            className="px-3 py-1.5 rounded-xl border border-zinc-800/80 bg-[#161619]/60 hover:bg-[#202026] text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer text-xs"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
