'use client';

import { useEffect, useState } from 'react';
import { HomeStateContext } from './HomeStateContext';
import { assignVariant } from '../../../_lib/experiment';
import type { Variant } from '../../../_types/home';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>('A');

  // The hero opens in whichever bucket the loader stamped for this visit.
  // Runs in an effect (sessionStorage is client-only); on first load the flip
  // happens behind the loader panel, on client navs behind the page curtain.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage bucket only exists client-side
    setVariant(assignVariant());
  }, []);

  return (
    <HomeStateContext.Provider value={{ variant, setVariant }}>
      {children}
    </HomeStateContext.Provider>
  );
}
