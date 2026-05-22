'use client';

import { createContext, useContext } from 'react';
import type { Variant } from '../../../_types/home';
import type { AccentSwatch } from '../../../_lib/accent-swatches';

export type HomeState = {
  variant: Variant;
  setVariant: (v: Variant) => void;
  accent: AccentSwatch;
  setAccent: (a: AccentSwatch) => void;
};

export const HomeStateContext = createContext<HomeState | null>(null);

export function useHomeState(): HomeState {
  const ctx = useContext(HomeStateContext);
  if (!ctx) {
    throw new Error('useHomeState must be used inside <HomeShell>');
  }
  return ctx;
}
