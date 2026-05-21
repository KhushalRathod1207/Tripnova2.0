import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SingleSelectCardProps {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function SingleSelectCard({
  label,
  description,
  isSelected,
  onClick,
  icon: Icon,
  className,
}: SingleSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl flex items-center gap-4 border text-left transition-all group cursor-pointer select-none',
        {
          'bg-gradient-to-r from-violet-950/40 to-violet-900/10 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white':
            isSelected,
          'bg-zinc-950/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200':
            !isSelected,
        },
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'p-2 rounded-lg shrink-0',
            isSelected ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-900 text-zinc-400'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <span className="text-sm font-semibold truncate">{label}</span>
        {description && (
          <span className="text-xs text-zinc-500 mt-0.5 leading-normal">
            {description}
          </span>
        )}
      </div>
      {isSelected && <Check className="h-5 w-5 text-violet-400 shrink-0" />}
    </button>
  );
}
