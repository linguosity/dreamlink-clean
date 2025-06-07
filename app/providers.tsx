'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { SearchProvider } from '@/context/search-context';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        <SearchProvider>
          {children}
        </SearchProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}