import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export function Alert({ variant = 'info', title, message, className, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex gap-3 items-start',
        {
          'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-400':
            variant === 'error',
          'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400':
            variant === 'success',
          'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-400':
            variant === 'info',
        },
        className
      )}
      {...props}
    >
      <div className="shrink-0 mt-0.5">
        {variant === 'error' && <AlertCircle className="h-5 w-5" />}
        {variant === 'success' && <CheckCircle2 className="h-5 w-5" />}
        {variant === 'info' && <Info className="h-5 w-5" />}
      </div>
      <div className="flex flex-col gap-0.5">
        {title && <span className="font-semibold text-sm leading-none">{title}</span>}
        <span className="text-sm leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
