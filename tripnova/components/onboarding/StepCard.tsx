import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface StepCardProps {
  children: React.ReactNode;
}

export function StepCard({ children }: StepCardProps) {
  return (
    <Card variant="glass" className="border-white/5 bg-zinc-950/40 backdrop-blur-xl min-h-[460px] flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        {children}
      </CardContent>
    </Card>
  );
}
