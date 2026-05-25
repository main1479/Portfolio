'use client';

import styles from './_PrintButton.module.scss';

export function PrintButton() {
  return (
    <button
      type="button"
      className={styles.printBtn}
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
    >
      <span>Save as PDF</span>
      <span aria-hidden="true">↓</span>
    </button>
  );
}
