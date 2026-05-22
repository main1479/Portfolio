import Image from 'next/image';
import styles from './_AboutBio.module.scss';

export function AboutAvatar({ tag, alt }: { tag: string; alt: string }) {
  return (
    <div className={styles.avatar}>
      <Image
        src="/me.jpg"
        alt={alt}
        width={1024}
        height={1024}
        priority
        className={styles.avatarImage}
        sizes="(max-width: 640px) 80vw, (max-width: 900px) 40vw, 30vw"
      />
      <span className={styles.avatarTag}>{tag}</span>
    </div>
  );
}
