import React, { useState, useEffect } from 'react';
import { MinimalInfographicData } from './types/infographic';
import { SAMPLE_INFOGRAPHICS } from './data/sampleInfographics';
import { Header } from './components/Header';
import { PromptBar } from './components/PromptBar';
import { InfographicCanvas } from './components/InfographicCanvas';
import { LiveEditorDrawer } from './components/LiveEditorDrawer';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { TemplateGallery } from './components/TemplateGallery';
import { TemplateItem } from './data/templateGalleryData';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<MinimalInfographicData>(SAMPLE_INFOGRAPHICS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  // Modal / Drawer states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);

  // Check URL query parameters for ?share=share_xyz on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      loadSharedInfographic(shareParam);
    }
  }, []);

  const loadSharedInfographic = async (shareId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/share/${shareId}`);
      if (res.ok) {
        const shared = await res.json();
        setData(shared);
        showToast('Loaded shared infographic');
      }
    } catch (err) {
      console.error('Failed to load shared infographic:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate new infographic from natural language prompt
  const handleGenerate = async (prompt: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/infographic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error generating infographic');
      }

      const generated = await res.json();
      setData(generated);
      showToast('Infographic generated!');
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err?.message || 'Failed to generate infographic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Refine existing infographic
  const handleAiRefine = async (editInstruction: string) => {
    try {
      setIsAiRefining(true);
      setErrorMessage(null);

      const res = await fetch('/api/infographic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentData: data,
          editInstruction,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to refine infographic');
      }

      const refined = await res.json();
      setData(refined);
      showToast('Refinement applied!');
    } catch (err: any) {
      console.error('AI refinement error:', err);
      setErrorMessage(err?.message || 'Refinement failed.');
    } finally {
      setIsAiRefining(false);
    }
  };

  const handleSelectSample = (index: number) => {
    const sample = SAMPLE_INFOGRAPHICS[index];
    if (sample) {
      setData(sample);
      showToast(`Loaded ${sample.title}`);
    }
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    setData(template.data);
    setCurrentPrompt(template.starterPrompt);
    setIsTemplateGalleryOpen(false);
    showToast(`Loaded template: ${template.title}`);
  };

  return (
    <div className="min-h-screen bg-[#101012] text-white flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Minimal Top Header */}
      <Header
        onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Minimalist Canvas Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 items-center">
        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-4xl flex items-center justify-between p-3.5 rounded-2xl border border-rose-900/50 bg-rose-950/30 text-rose-300 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-zinc-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Minimal Centered Prompt & Ingest Bar */}
        <PromptBar
          onGenerate={handleGenerate}
          isLoading={isLoading}
          onSelectSample={handleSelectSample}
          onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
          currentPrompt={currentPrompt}
        />

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <div className="text-xs text-zinc-400 font-mono">
              Gemini is structuring infographic card...
            </div>
          </div>
        )}

        {/* Hero Interactive Card */}
        {!isLoading && <InfographicCanvas data={data} />}
      </main>

      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={data.id}
      />

      {/* Slide-over Live Editor Drawer */}
      <LiveEditorDrawer
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        data={data}
        onChange={(updated) => setData(updated)}
        onAiRefine={handleAiRefine}
        isAiRefining={isAiRefining}
      />

      {/* Export Modal (PNG, SVG, Code, JSON) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={data}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={data}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-[#161619] text-white text-xs font-medium shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-zinc-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
