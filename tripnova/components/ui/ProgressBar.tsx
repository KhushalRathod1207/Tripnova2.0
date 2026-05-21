import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-zinc-500">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-violet-600 dark:text-violet-400">
          {Math.round(percentage)}% Completed
        </span>
      </div>
      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
