import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function CompletionScreen() {
  return (
    <div className="text-center py-12 space-y-6 flex flex-col items-center justify-center">
      {/* Animated Success ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative inline-flex p-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Check className="h-10 w-10" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          <span>Profile Completed</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
          All Set, Traveler!
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Your travel identity is successfully registered. Directing you to your workspace dashboard console...
        </p>
      </div>

      {/* Modern Loader animation */}
      <div className="flex gap-1.5 items-center pt-4">
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          className="h-2 w-2 rounded-full bg-violet-500"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          className="h-2 w-2 rounded-full bg-indigo-500"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          className="h-2 w-2 rounded-full bg-cyan-500"
        />
      </div>
    </div>
  );
}
