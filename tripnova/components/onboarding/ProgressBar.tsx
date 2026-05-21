import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-zinc-500 uppercase tracking-widest">PERSONALIZATION</span>
        <span className="text-violet-400 font-bold">
          Step {currentStep} of {totalSteps} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
