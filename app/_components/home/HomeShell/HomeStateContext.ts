'use client';

import { createContext, useContext } from 'react';
import type { Variant } from '../../../_types/home';

export type HomeState = {
  variant: Variant;
  setVariant: (v: Variant) => void;
};

export const HomeStateContext = createContext<HomeState | null>(null);

export function useHomeState(): HomeState {
  const ctx = useContext(HomeStateContext);
  if (!ctx) {
    throw new Error('useHomeState must be used inside <HomeShell>');
  }
  return ctx;
}
