'use client';

import { useState } from 'react';
import { useHomeState } from '../HomeShell/HomeStateContext';
import { accentSwatches } from '../../../_lib/accent-swatches';
import styles from './_TweaksPanel.module.scss';

export function TweaksPanel() {
  const { accent, setAccent, variant, setVariant } = useHomeState();
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={[styles.tweaks, open ? styles.isOpen : ''].filter(Boolean).join(' ')}
      aria-label="Tweaks"
    >
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Tweaks
      </button>
      <div className={styles.row}>
        <span className={styles.label}>Accent</span>
        <div className={styles.swatches} role="group" aria-label="Accent colour">
          {accentSwatches.map((s) => (
            <button
              key={s.hex}
              type="button"
              className={s.hex === accent.hex ? styles.isActive : ''}
              // Inline background is the only way to render the swatch's data colour.
              style={{ background: s.hex }}
              aria-label={s.label}
              aria-pressed={s.hex === accent.hex}
              onClick={() => setAccent(s)}
            />
          ))}
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Hero</span>
        <div className={styles.toggle} role="group" aria-label="Hero variant">
          {(['A', 'B'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={v === variant ? styles.isActive : ''}
              aria-pressed={v === variant}
              onClick={() => setVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
