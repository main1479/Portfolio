'use client';

import { useRef } from 'react';
import type { TopicOption, TopicValue } from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

type Props = {
  options: readonly TopicOption[];
  value: TopicValue | '';
  onChange: (value: TopicValue) => void;
  error?: string;
  labelledBy: string;
};

export function TopicChips({ options, value, onChange, error, labelledBy }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusByIndex = (i: number) => {
    const total = options.length;
    const next = ((i % total) + total) % total;
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % options.length;
      focusByIndex(next);
      onChange(options[next].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (index - 1 + options.length) % options.length;
      focusByIndex(next);
      onChange(options[next].value);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusByIndex(0);
      onChange(options[0].value);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusByIndex(options.length - 1);
      onChange(options[options.length - 1].value);
    }
  };

  return (
    <div
      className={styles.chips}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={error ? 'topic-error' : undefined}
    >
      {options.map((opt, i) => {
        const checked = opt.value === value;
        const isFirst = i === 0;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!value && isFirst) ? 0 : -1}
            className={[styles.chip, checked ? styles.isActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
