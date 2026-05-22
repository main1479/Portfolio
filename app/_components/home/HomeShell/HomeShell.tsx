'use client';

import { useState } from 'react';
import { HomeStateContext } from './HomeStateContext';
import type { Variant } from '../../../_types/home';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>('A');
  return (
    <HomeStateContext.Provider value={{ variant, setVariant }}>
      {children}
    </HomeStateContext.Provider>
  );
}
