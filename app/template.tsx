'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './_template.module.scss';

// Module-scoped, survives template remounts on navigation.
let hasMountedOnce = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFirstMount] = useState(!hasMountedOnce);

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  const isStatic = pathname === '/cv';
  const shouldEnter = !isFirstMount && !isStatic;

  return <div className={shouldEnter ? styles.enter : styles.static}>{children}</div>;
}
