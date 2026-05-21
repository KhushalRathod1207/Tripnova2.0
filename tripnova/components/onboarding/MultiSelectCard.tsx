import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export function MultiSelectCard({
  label,
  isSelected,
  onClick,
  icon: Icon,
  iconColor = 'text-violet-400',
}: MultiSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4.5 rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all text-center group cursor-pointer select-none',
        {
          'bg-gradient-to-b from-violet-950/40 to-violet-900/10 border-violet-500/80 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white':
            isSelected,
          'bg-zinc-950/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200':
            !isSelected,
        }
      )}
    >
      {Icon && (
        <div
          className={cn(
            'p-2.5 rounded-xl transition-all',
            isSelected ? 'bg-violet-500/20 text-white' : 'bg-zinc-900 group-hover:scale-105'
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold leading-tight">{label}</span>
        {isSelected && <Check className="h-3 w-3 text-violet-400 shrink-0" />}
      </div>
    </button>
  );
}
