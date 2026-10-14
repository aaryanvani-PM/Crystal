import React, { useState, useEffect } from 'react';
import { MinimalInfographicData } from './types/infographic';
import { SAMPLE_INFOGRAPHICS } from './data/sampleInfographics';
import { PromptBar } from './components/PromptBar';
import { InfographicCanvas } from './components/InfographicCanvas';
import { LiveEditorDrawer } from './components/LiveEditorDrawer';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { TemplateGallery } from './components/TemplateGallery';
import { OnboardingWalkthrough } from './components/OnboardingWalkthrough';
import { TemplateItem, TEMPLATES_DATA } from './data/templateGalleryData';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Sliders, Share2, Download } from 'lucide-react';
import {
  loadPersistedInfographic,
  persistInfographic,
  loadPersistedPrompt,
  persistPrompt,
  clearPersistedInfographic,
} from './utils/storage';

const DEFAULT_SAMPLE = SAMPLE_INFOGRAPHICS[9] || SAMPLE_INFOGRAPHICS[0];
const DEFAULT_PROMPT =
  'Design Instagram high-throughput feed generation and fan-out system architecture with interactive stepper tabs (Mobile CDN, Envoy Gateway, Hybrid Push/Pull Fanout, Redis Sorted Sets, PostgreSQL Shards) handling 500M daily active users.';

export default function App() {
  const [data, setData] = useState<MinimalInfographicData>(() => {
    return loadPersistedInfographic() || DEFAULT_SAMPLE;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>(() => {
    return loadPersistedPrompt() || DEFAULT_PROMPT;
  });

  // Modal / Drawer states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-launch walkthrough for first-time visitors
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('visualizerai_onboarding_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-persist infographic data to local storage on any change
  useEffect(() => {
    persistInfographic(data);
  }, [data]);

  // Auto-persist active prompt to local storage
  useEffect(() => {
    persistPrompt(currentPrompt);
  }, [currentPrompt]);

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
      setCurrentPrompt(prompt);

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

  // Domain classification for current active infographic
  const currentDomainInfo = React.useMemo(() => {
    const matched = TEMPLATES_DATA.find((t) => t.data.id === data.id);
    if (matched) {
      return { emoji: matched.domainEmoji, category: matched.category };
    }
    const textLower = `${data.title} ${data.subtitle || ''}`.toLowerCase();
    if (
      textLower.includes('fat') ||
      textLower.includes('cardio') ||
      textLower.includes('hypertrophy') ||
      textLower.includes('workout') ||
      textLower.includes('stress') ||
      textLower.includes('glycogen')
    ) {
      return { emoji: '🏃', category: 'Health' };
    }
    if (
      textLower.includes('saas') ||
      textLower.includes('stripe') ||
      textLower.includes('payment') ||
      textLower.includes('equity') ||
      textLower.includes('waterfall') ||
      textLower.includes('order') ||
      textLower.includes('checkout') ||
      textLower.includes('finance') ||
      textLower.includes('pricing') ||
      textLower.includes('trading')
    ) {
      return { emoji: '💼', category: 'Business' };
    }
    if (
      textLower.includes('crispr') ||
      textLower.includes('mrna') ||
      textLower.includes('grid') ||
      textLower.includes('solar') ||
      textLower.includes('vaccine') ||
      textLower.includes('biology') ||
      textLower.includes('energy')
    ) {
      return { emoji: '🔬', category: 'Science' };
    }
    return { emoji: '💻', category: 'Tech' };
  }, [data]);

  const handleSelectSample = (index: number) => {
    const sample = SAMPLE_INFOGRAPHICS[index];
    if (sample) {
      setData(sample);
      if (sample.originalPrompt) {
        setCurrentPrompt(sample.originalPrompt);
      }
      showToast(`Loaded ${sample.title}`);
    }
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    setData(template.data);
    setCurrentPrompt(template.starterPrompt);
    setIsTemplateGalleryOpen(false);
    showToast(`Loaded template: ${template.title}`);
  };

  const handleResetToDefault = () => {
    clearPersistedInfographic();
    setData(DEFAULT_SAMPLE);
    setCurrentPrompt(DEFAULT_PROMPT);
    showToast('Reset to default template (Instagram System Design)');
  };

  const handleTourComplete = () => {
    localStorage.setItem('visualizerai_onboarding_completed', 'true');
    showToast('Walkthrough complete! Click any node or prompt to start.');
  };

  return (
    <div className="min-h-screen bg-[#101012] text-white flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
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

        {/* Modern Command Prompt & Inspiration Bar with Integrated Navigation */}
        <PromptBar
          onGenerate={handleGenerate}
          isLoading={isLoading}
          onSelectSample={handleSelectSample}
          onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
          onStartTour={() => setIsTourOpen(true)}
          currentPrompt={currentPrompt}
          activeSampleId={data.id}
        />

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <div className="text-xs text-zinc-400 font-mono">
              Synthesizing interactive architecture diagram...
            </div>
          </div>
        )}

        {/* Canvas Section & Interactive Card */}
        {!isLoading && (
          <div data-tour="tour-canvas" className="w-full">
            <InfographicCanvas
              data={data}
              domainInfo={currentDomainInfo}
              onOpenEditor={() => setIsEditorOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
              onReset={handleResetToDefault}
            />
          </div>
        )}
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
        onReset={handleResetToDefault}
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

      {/* Onboarding Walkthrough Tour */}
      <OnboardingWalkthrough
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleTourComplete}
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
