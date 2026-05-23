import type { CodeMockLine } from '../../../_types/case';
import styles from './_CodeMock.module.scss';

export function CodeMock({ lines }: { lines: readonly CodeMockLine[] }) {
  return (
    <pre className={styles.mock} aria-label="Example terminal session">
      <code>
        {lines.map((line, i) => {
          if (line.type === 'empty') {
            return (
              <span key={i} className={styles.line} aria-hidden="true">
                {' '}
              </span>
            );
          }
          return (
            <span key={i} className={`${styles.line} ${styles[line.type]}`}>
              {(line.tokens ?? []).map((tok, j) => (
                <span key={j} className={styles[tok.kind]}>
                  {tok.value}
                </span>
              ))}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
