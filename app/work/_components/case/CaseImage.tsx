import Image from 'next/image';
import styles from './_CaseVisuals.module.scss';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export function CaseImage({ src, alt, width, height, caption }: Props) {
  return (
    <figure className={styles.single}>
      <Image src={src} alt={alt} width={width} height={height} className={styles.slotImage} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
