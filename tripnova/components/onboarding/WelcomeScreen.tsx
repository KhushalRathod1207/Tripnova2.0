import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface WelcomeScreenProps {
  onStart: () => void;
  userName?: string;
}

export function WelcomeScreen({ onStart, userName }: WelcomeScreenProps) {
  return (
    <div className="text-center py-10 space-y-6 flex flex-col items-center justify-center">
      {/* Compass emblem */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-xl animate-pulse" />
        <div className="relative inline-flex p-5 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/10 border border-violet-500/20">
          <Compass className="h-10 w-10 animate-spin duration-10000" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          <span>TripNova personalization</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Let&apos;s Build Your{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Travel Identity
          </span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Welcome {userName ? `${userName}, ` : ''}we&apos;ll customize your trip feeds, match budgeting layers, and supply smart AI booking deals.
        </p>
      </div>

      <div className="pt-4 w-full max-w-xs">
        <Button
          onClick={onStart}
          className="w-full h-12 text-base font-semibold"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Personalize My Experience
        </Button>
      </div>
    </div>
  );
}
