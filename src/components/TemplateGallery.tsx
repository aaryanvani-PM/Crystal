import React, { useState, useMemo, useEffect } from 'react';
import { MinimalInfographicData } from '../types/infographic';
import { TEMPLATES_DATA, TemplateItem, TemplateCategory } from '../data/templateGalleryData';
import {
  X,
  Search,
  LayoutTemplate,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  Cpu,
  GraduationCap,
  HeartPulse,
  Eye,
  Check,
  ChevronRight,
  Sliders,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  currentTemplateId?: string;
}

export const TemplateGallery: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');
  const [activeArchetype, setActiveArchetype] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewTemplate) {
          setPreviewTemplate(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewTemplate, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Counts for categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TEMPLATES_DATA.length };
    TEMPLATES_DATA.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered list
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((item) => {
      // Category match
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }

      // Archetype filter
      if (activeArchetype !== 'all' && item.archetype !== activeArchetype) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesSubcategory = item.subCategory.toLowerCase().includes(q);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q);
        return matchesTitle || matchesSubtitle || matchesSubcategory || matchesTags || matchesDesc;
      }

      return true;
    });
  }, [activeCategory, activeArchetype, searchQuery]);

  if (!isOpen) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    All: <LayoutTemplate className="w-3.5 h-3.5" />,
    Business: <Building2 className="w-3.5 h-3.5" />,
    Tech: <Cpu className="w-3.5 h-3.5" />,
    Education: <GraduationCap className="w-3.5 h-3.5" />,
    Health: <HeartPulse className="w-3.5 h-3.5" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div
        className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800/80 bg-[#151519]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
              <LayoutTemplate className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">Template Gallery</h2>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/50">
                  {TEMPLATES_DATA.length} Presets
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Start your project from professionally structured architectures, crossover charts, and schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, tags, stacks..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#1a1a20] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Close Gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories & Filter Bar */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-[#121215] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Business', 'Tech', 'Education', 'Health'] as TemplateCategory[]).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className={isActive ? 'text-zinc-950' : 'text-zinc-400'}>
                    {categoryIcons[cat]}
                  </span>
                  <span>{cat === 'All' ? 'All Templates' : cat}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-zinc-300 text-zinc-900 font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Archetype Filter Sub-Pills */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] text-zinc-500 mr-1 hidden sm:inline">Archetype:</span>
            {[
              { id: 'all', label: 'All Layouts' },
              { id: 'stepper-pipeline', label: 'System Architecture' },
              { id: 'scenario-area', label: 'Crossover & Area' },
              { id: 'dynamic-slider-schedule', label: 'Dynamic Schedule' },
            ].map((arch) => (
              <button
                key={arch.id}
                onClick={() => setActiveArchetype(arch.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer shrink-0 ${
                  activeArchetype === arch.id
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {arch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body: Template Grid or Detail Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f12]">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">No templates matched your filter</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-4">
                Try clearing your search query or switching categories to see all available templates.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveArchetype('all');
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs text-zinc-200 hover:text-white cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => {
                const isCurrent = currentTemplateId === template.data.id;
                return (
                  <div
                    key={template.id}
                    className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isCurrent
                        ? 'bg-[#18181e] border-zinc-600 ring-1 ring-zinc-500/30'
                        : 'bg-[#141418] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#18181e]'
                    }`}
                  >
                    {/* Card Header Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        {/* Domain Category / Archetype Breadcrumb */}
                        <div className="flex items-center justify-between text-[11px] mb-2.5">
                          <span className="font-mono text-zinc-400 font-medium tracking-wide">
                            {template.category.toUpperCase()} · {template.subCategory}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {template.archetype === 'stepper-pipeline'
                              ? 'Interactive Flow'
                              : template.archetype === 'scenario-area'
                              ? 'Dual Area'
                              : 'Dynamic Schedule'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-zinc-100 mb-1.5">
                          {template.title}
                        </h3>

                        {/* Subtitle / Description */}
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                          {template.subtitle}
                        </p>

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0d0d10] border border-zinc-800/80 mb-3.5">
                          {template.keyMetrics.map((km, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-[9px] text-zinc-500 font-medium truncate">
                                {km.label}
                              </span>
                              <span className="text-xs font-bold text-zinc-200 font-mono mt-0.5 truncate">
                                {km.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {template.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-400 border border-zinc-700/40"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 4 && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              +{template.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(template)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#18181e] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectTemplate(template)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          <span>Use Template</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Optional In-Gallery Template Detail Drawer */}
        {previewTemplate && (
          <div className="absolute inset-0 z-20 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            <div
              className="w-full max-w-xl bg-[#141418] border-l border-zinc-800 h-full flex flex-col p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    {previewTemplate.category} · {previewTemplate.subCategory}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {previewTemplate.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {previewTemplate.subtitle}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#19191f] border border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    Overview & Architectural Intent
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {previewTemplate.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                    Target Metrics & Telemetry
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {previewTemplate.keyMetrics.map((km, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#101014] border border-zinc-800/90 flex flex-col"
                      >
                        <span className="text-[10px] text-zinc-500 font-medium">{km.label}</span>
                        <span className="text-sm font-bold text-white font-mono mt-1">
                          {km.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Archetype Details */}
                <div className="p-4 rounded-xl bg-[#101014] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Layout Archetype:</span>
                    <span className="font-semibold text-white font-mono">
                      {previewTemplate.archetypeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Production Tier:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {previewTemplate.complexity}
                    </span>
                  </div>
                  {previewTemplate.data.pipelineConfig?.steps && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Pipeline Flow Steps:</span>
                      <span className="font-semibold text-white font-mono">
                        {previewTemplate.data.pipelineConfig.steps.length} Sequenced Nodes
                      </span>
                    </div>
                  )}
                  {previewTemplate.data.switcherConfig?.scenarios && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Scenario Options:</span>
                      <span className="font-semibold text-white font-mono">
                        {previewTemplate.data.switcherConfig.scenarios.length} Interactive States
                      </span>
                    </div>
                  )}
                </div>

                {/* Ready-to-use Prompt */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                    Initial Generation Prompt
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#0c0c0f] border border-zinc-800/90 text-xs text-zinc-300 font-mono leading-relaxed select-all">
                    "{previewTemplate.starterPrompt}"
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-zinc-800/80 mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-[#161619] hover:bg-zinc-800 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Back to Gallery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Project with this Template</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
