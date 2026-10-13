import { MinimalInfographicData } from '../types/infographic';

function sanitizeComponentName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, '');
  if (!cleaned || /^[0-9]/.test(cleaned)) {
    return 'GeminiInfographicCard';
  }
  return cleaned;
}

export function generateReactComponentCode(data: MinimalInfographicData): string {
  const dataString = JSON.stringify(data, null, 2);
  const compName = sanitizeComponentName(data.title);

  return `import React from 'react';

// Infographic Component: ${data.title}
// Generated with VisualizerAI (Interactive Systems & Data Visualizer)

export default function ${compName}() {
  const cardData = ${dataString};

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111113] border border-zinc-800 text-white font-sans shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {cardData.title}
        </h2>
        {cardData.subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            {cardData.subtitle}
          </p>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[#161619] border border-zinc-800/80 text-center text-xs text-zinc-400">
        Interactive Card: <span className="text-white font-mono">{cardData.cardType}</span>
      </div>
    </div>
  );
}
`;
}

export function generateHtmlSnippet(data: MinimalInfographicData): string {
  return `<!-- Infographic: ${data.title} -->
<div style="font-family: system-ui, sans-serif; background-color: #111113; color: #ffffff; border: 1px solid #27272a; border-radius: 24px; padding: 28px; max-width: 800px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
  <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #ffffff;">${data.title}</h2>
  <p style="font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0;">${data.subtitle}</p>
  <div style="background-color: #161619; border: 1px solid #27272a; border-radius: 16px; padding: 20px; text-align: center; font-size: 12px; color: #71717a;">
    [ Interactive ${data.cardType} Visualizer ]
  </div>
</div>`;
}
