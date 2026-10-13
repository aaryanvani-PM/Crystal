import React, { useState } from 'react';
import { MinimalInfographicData } from '../types/infographic';
import {
  exportCardAsPng,
  exportCardAsSvg,
  exportDataAsJson,
} from '../utils/exportHelpers';
import {
  generateReactComponentCode,
  generateHtmlSnippet,
} from '../utils/codeGenerators';
import {
  X,
  Download,
  Code2,
  Copy,
  Check,
  FileImage,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MinimalInfographicData;
}

type ExportTab = 'image' | 'react' | 'html' | 'json';

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('image');
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const reactCode = generateReactComponentCode(data);
  const htmlCode = generateHtmlSnippet(data);
  const jsonCode = JSON.stringify(data, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    try {
      setIsExporting(true);
      const safeFilename = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-infographic.png`;
      await exportCardAsPng('infographic-export-card', safeFilename, scale);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    const safeFilename = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-infographic.svg`;
    exportCardAsSvg('infographic-export-card', safeFilename);
  };

  const handleDownloadJson = () => {
    const safeFilename = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-data.json`;
    exportDataAsJson(data, safeFilename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0c1222] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Export & Embed Infographic</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 bg-[#090d16]/50 text-xs">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'image'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            Image (PNG / SVG)
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'react'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            React Component
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'html'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            HTML / CSS Snippet
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            JSON Data
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300">
          {/* TAB: IMAGE EXPORT */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PNG Card */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                      <FileImage className="w-4 h-4 text-sky-400" />
                      High-Resolution PNG
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Pixel-perfect transparent or solid raster export. Ideal for Keynote, PowerPoint, Google Slides, and LinkedIn/X social cards.
                    </p>

                    {/* Scale Picker */}
                    <div className="flex items-center gap-2 mt-4 text-xs">
                      <span className="text-slate-400">Resolution:</span>
                      <button
                        type="button"
                        onClick={() => setScale(1)}
                        className={`px-2.5 py-1 rounded font-mono font-semibold transition-colors ${
                          scale === 1 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        1x (Web)
                      </button>
                      <button
                        type="button"
                        onClick={() => setScale(2)}
                        className={`px-2.5 py-1 rounded font-mono font-semibold transition-colors ${
                          scale === 2 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        2x (Retina Slides)
                      </button>
                      <button
                        type="button"
                        onClick={() => setScale(3)}
                        className={`px-2.5 py-1 rounded font-mono font-semibold transition-colors ${
                          scale === 3 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        3x (Print/Banner)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPng}
                    disabled={isExporting}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Generating PNG...' : 'Download PNG Image'}</span>
                  </button>
                </div>

                {/* Vector SVG Card */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Scalable Vector (SVG)
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Infinite resolution vector graphics. Editable directly inside Figma, Adobe Illustrator, or embedded natively on web pages.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadSvg}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Vector SVG</span>
                  </button>
                </div>
              </div>

              {/* Quick Deck Tip */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-slate-400 leading-relaxed text-xs">
                  <span className="font-semibold text-slate-200">Deck Pro-Tip:</span> The 16:9 canvas matches standard presentation slide decks (1920x1080), while 1:1 is optimized for social posts and executive memos.
                </div>
              </div>
            </div>
          )}

          {/* TAB: REACT COMPONENT */}
          {activeTab === 'react' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Ready-to-use React 19 + Tailwind component with self-contained data.
                </span>
                <button
                  onClick={() => handleCopy(reactCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs cursor-pointer shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Code!' : 'Copy React Component'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl border border-slate-800 bg-[#090d16] font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[380px]">
                <code>{reactCode}</code>
              </pre>
            </div>
          )}

          {/* TAB: HTML SNIPPET */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Standalone HTML with inline CSS styling for emails, CMS posts, or Notion.
                </span>
                <button
                  onClick={() => handleCopy(htmlCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs cursor-pointer shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied HTML!' : 'Copy HTML Snippet'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl border border-slate-800 bg-[#090d16] font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[380px]">
                <code>{htmlCode}</code>
              </pre>
            </div>
          )}

          {/* TAB: JSON DATA */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Raw infographic JSON schema for programmatic pipelines and data storage.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(jsonCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl border border-slate-800 bg-[#090d16] font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[380px]">
                <code>{jsonCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
