import styles from './_Hero.module.scss';

export function HeroWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part.trim() === '' ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} className={styles.word}>
            <span className={styles.wordInner}>{part}</span>
          </span>
        ),
      )}
    </>
  );
}
