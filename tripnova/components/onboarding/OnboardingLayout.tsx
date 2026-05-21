import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      {/* Premium Floating/glowing circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-600/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/10 blur-[90px]" />

      {/* Main Wrapper */}
      <div className="w-full max-w-2xl z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <Compass className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-extrabold">
              TripNova
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
