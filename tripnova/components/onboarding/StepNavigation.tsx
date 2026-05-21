import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
}

export function StepNavigation({
  onBack,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
  isLoading = false,
}: StepNavigationProps) {
  return (
    <div className="border-t border-zinc-900/50 pt-6 mt-6 flex justify-between items-center bg-zinc-950/10">
      {/* Back button */}
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        className="px-4 py-2 hover:bg-zinc-900/60"
      >
        Back
      </Button>

      {/* Skip button if provided */}
      {onSkip && !isLastStep && (
        <button
          type="button"
          onClick={onSkip}
          disabled={isLoading}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono tracking-wider uppercase underline transition-colors cursor-pointer"
        >
          Skip Onboarding
        </button>
      )}

      {/* Next/Complete button */}
      <Button
        type="button"
        variant="primary"
        onClick={onNext}
        isLoading={isLoading}
        rightIcon={isLastStep ? undefined : <ArrowRight className="h-4 w-4" />}
      >
        {isLastStep ? 'Complete Journey' : 'Next Step'}
      </Button>
    </div>
  );
}
