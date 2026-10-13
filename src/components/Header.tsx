import React from 'react';
import { Share2, Download, Sliders, Sparkles } from 'lucide-react';

interface Props {
  onOpenEditor: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenEditor,
  onOpenExport,
  onOpenShare,
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
            Infograph<span className="text-zinc-400 font-normal">AI</span>
          </span>
        </div>

        {/* Quiet Minimal Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Share</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold transition-all shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
