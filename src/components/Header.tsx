import React from 'react';
import { Sparkles, LayoutTemplate, HelpCircle } from 'lucide-react';

interface Props {
  onOpenTemplates: () => void;
  onStartTour?: () => void;
  onOpenEditor?: () => void;
  onOpenExport?: () => void;
  onOpenShare?: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenTemplates,
  onStartTour,
}) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-[#101012]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Minimalist Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Visualizer<span className="text-zinc-400 font-normal">AI</span>
          </span>
        </div>

        {/* Global Navigation Controls */}
        <div className="flex items-center gap-2.5 text-xs">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800/80 bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Interactive Feature Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          <button
            data-tour="tour-templates"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 font-medium transition-colors cursor-pointer shadow-xs"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-zinc-300" />
            <span>Templates</span>
            <span className="text-[10px] font-mono bg-zinc-900/80 text-zinc-400 px-1.5 py-0.2 rounded-md ml-0.5 font-bold">
              18
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
