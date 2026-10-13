import React from 'react';
import { MinimalInfographicData } from '../types/infographic';
import { ScenarioAreaCard } from './cards/ScenarioAreaCard';
import { DynamicSliderScheduleCard } from './cards/DynamicSliderScheduleCard';
import { PipelineStepperCard } from './cards/PipelineStepperCard';

interface Props {
  data: MinimalInfographicData;
}

export const InfographicCanvas: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full flex justify-center py-2">
      {/* Target export card matching user's Gemini screenshots */}
      <div
        id="infographic-export-card"
        className="w-full max-w-4xl rounded-3xl bg-[#111113] border border-zinc-800/90 p-6 sm:p-9 shadow-2xl flex flex-col gap-6 text-white font-sans"
      >
        {/* Title & Subtitle Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Card Archetype */}
        {data.cardType === 'scenario-area' && <ScenarioAreaCard data={data} />}
        {data.cardType === 'dynamic-slider-schedule' && (
          <DynamicSliderScheduleCard data={data} />
        )}
        {data.cardType === 'stepper-pipeline' && (
          <PipelineStepperCard data={data} />
        )}

        {/* Fallback for general combo/area cards */}
        {data.cardType !== 'scenario-area' &&
          data.cardType !== 'dynamic-slider-schedule' &&
          data.cardType !== 'stepper-pipeline' && (
            <ScenarioAreaCard data={data} />
          )}
      </div>
    </div>
  );
};
