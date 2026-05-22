'use client';

import { useEffect, useState } from 'react';
import { HomeStateContext } from './HomeStateContext';
import type { Variant } from '../../../_types/home';
import {
  type AccentSwatch,
  ACCENT_STORAGE_KEY,
  defaultAccent,
  findSwatch,
} from '../../../_lib/accent-swatches';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>('A');
  const [accent, setAccentState] = useState<AccentSwatch>(defaultAccent);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      const match = findSwatch(saved);
      if (match) {
        // Reading localStorage on mount to restore the persisted accent;
        // SSR can't see browser storage, so an effect is unavoidable.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccentState(match);
        document.documentElement.style.setProperty('--accent', match.hex);
      }
    } catch {
      // localStorage unavailable — leave default.
    }
  }, []);

  const setAccent = (a: AccentSwatch) => {
    setAccentState(a);
    document.documentElement.style.setProperty('--accent', a.hex);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, a.hex);
    } catch {
      // Persist failure is non-fatal.
    }
  };

  return (
    <HomeStateContext.Provider value={{ variant, setVariant, accent, setAccent }}>
      {children}
    </HomeStateContext.Provider>
  );
}
