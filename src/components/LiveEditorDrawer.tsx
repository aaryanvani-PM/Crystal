import React, { useState } from 'react';
import { MinimalInfographicData, InfographicCardType } from '../types/infographic';
import { X, Sparkles, Sliders, Send, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MinimalInfographicData;
  onChange: (updated: MinimalInfographicData) => void;
  onAiRefine: (instruction: string) => Promise<void>;
  isAiRefining: boolean;
  onReset?: () => void;
}

export const LiveEditorDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onChange,
  onAiRefine,
  isAiRefining,
  onReset,
}) => {
  const [aiInstruction, setAiInstruction] = useState('');

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof MinimalInfographicData>(
    key: K,
    val: MinimalInfographicData[K]
  ) => {
    onChange({
      ...data,
      [key]: val,
      updatedAt: Date.now(),
    });
  };

  const handleSendAiRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInstruction.trim() || isAiRefining) return;
    await onAiRefine(aiInstruction.trim());
    setAiInstruction('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#121214] border-l border-zinc-800/80 shadow-2xl flex flex-col text-xs text-zinc-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#161619]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-300" />
          <h3 className="text-sm font-bold text-white">Live Card Editor</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title & Subtitle */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Headline Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161619] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 font-medium text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Descriptive Subtitle
            </label>
            <textarea
              value={data.subtitle}
              onChange={(e) => handleUpdate('subtitle', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#161619] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 leading-relaxed text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Card Archetype
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'scenario-area', label: 'Scenario Area' },
                { type: 'dynamic-slider-schedule', label: 'Slider Schedule' },
                { type: 'stepper-pipeline', label: 'Pipeline Stepper' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleUpdate('cardType', item.type as InfographicCardType)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    data.cardType === item.type
                      ? 'border-zinc-500 bg-[#222227] text-white'
                      : 'border-zinc-800/80 bg-[#161619] text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Co-Pilot Refiner */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Gemini AI Refiner</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            Ask Gemini to change scenario labels, recalculate numbers, or adjust the analytical explanation.
          </p>

          <form onSubmit={handleSendAiRefine} className="space-y-3">
            <textarea
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="e.g. 'Add a 3rd scenario for fasted cardio', 'Change weekly CNS stress to 500 pts', 'Switch slider to 30-min intervals'"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#161619] border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 text-xs leading-relaxed"
              disabled={isAiRefining}
            />

            <button
              type="submit"
              disabled={!aiInstruction.trim() || isAiRefining}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-all"
            >
              {isAiRefining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Refining with Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Refinement</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Local Storage Persistence & Reset Bar */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Auto-saved to local storage</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Protected from refresh</span>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="w-full py-2 px-3 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-white text-[11px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reset to default template</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
