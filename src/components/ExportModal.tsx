import React, { useState } from 'react';
import { MinimalInfographicData } from '../types/infographic';
import {
  exportCardAsPng,
  exportCardAsPdf,
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
  FileText,
  FileCode,
  Layers,
  Sparkles,
  Loader2,
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
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const safeFilename = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-infographic.pdf`;
      await exportCardAsPdf('infographic-export-card', safeFilename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
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
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#0e0e12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121216]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-zinc-300" />
            <h3 className="text-base font-bold text-white">Export & Embed Infographic</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-zinc-800 px-6 bg-[#121216]/50 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'image'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            Document & Image (PNG / PDF / SVG)
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'react'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            React Component
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'html'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            HTML / CSS Snippet
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'json'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            JSON Data
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-zinc-300 bg-[#0d0d10]">
          {/* TAB: VISUAL DOCUMENT (PNG / PDF / SVG) */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PNG Card */}
                <div className="p-5 rounded-xl border border-zinc-800 bg-[#141418] flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                      <FileImage className="w-4 h-4 text-sky-400" />
                      High-Res PNG
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Pixel-perfect transparent or solid raster export. Ideal for Keynote, PowerPoint, Google Slides, and LinkedIn/X social cards.
                    </p>

                    {/* Scale Picker */}
                    <div className="flex items-center gap-2 mt-4 text-xs">
                      <span className="text-zinc-400">Scale:</span>
                      <button
                        type="button"
                        onClick={() => setScale(1)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                          scale === 1 ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        1x
                      </button>
                      <button
                        type="button"
                        onClick={() => setScale(2)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                          scale === 2 ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        2x Retina
                      </button>
                      <button
                        type="button"
                        onClick={() => setScale(3)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                          scale === 3 ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        3x Print
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPng}
                    disabled={isExporting}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 border border-zinc-700/60"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isExporting ? 'Generating PNG...' : 'Download PNG'}</span>
                  </button>
                </div>

                {/* PDF Document Card */}
                <div className="p-5 rounded-xl border border-zinc-700/80 bg-[#16161c] flex flex-col justify-between gap-4 relative ring-1 ring-zinc-700/50">
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      New
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Vector PDF Document
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Print-ready vector PDF document matching the canvas dimensions. Perfect for executive briefings, design reviews, board memos, and email attachments.
                    </p>
                    <div className="mt-4 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Auto-fit landscape / portrait format
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 text-black" />}
                    <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>
                </div>

                {/* Vector SVG Card */}
                <div className="p-5 rounded-xl border border-zinc-800 bg-[#141418] flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      Scalable Vector (SVG)
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Infinite resolution vector graphics. Editable directly inside Figma, Adobe Illustrator, Sketch, or embedded natively into web documentation.
                    </p>
                    <div className="mt-4 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Directly importable into Figma
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadSvg}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700/60"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                </div>
              </div>

              {/* Quick Deck Tip */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#121216] flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="text-zinc-400 leading-relaxed text-xs">
                  <span className="font-semibold text-zinc-200">Export Pro-Tip:</span> Use <strong>PDF</strong> for executive presentations and customer reports, <strong>PNG</strong> for slides or social sharing, and <strong>SVG</strong> for custom Figma vector editing.
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
