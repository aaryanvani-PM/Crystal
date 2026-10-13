import React, { useState, useEffect } from 'react';
import { MinimalInfographicData } from '../types/infographic';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Code,
  Users,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MinimalInfographicData;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [shareId, setShareId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      createShareLink();
    }
  }, [isOpen]);

  const createShareLink = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (result.shareId) {
        setShareId(result.shareId);
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = shareId ? `${currentUrl}?share=${shareId}` : `${currentUrl}`;
  const embedCode = `<iframe src="${shareableUrl}" width="100%" height="700" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0c1222] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Share & Collaborate</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed">
              Anyone with this shareable link can view this interactive infographic with responsive tooltips and export its assets for presentations or team reports.
            </p>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              Direct Shareable Web Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={isLoading ? 'Creating cloud link...' : shareableUrl}
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-slate-200 font-mono text-xs select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Embed Iframe */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              Embed Iframe Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={embedCode}
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-slate-200 font-mono text-xs select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyEmbed}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Embed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
