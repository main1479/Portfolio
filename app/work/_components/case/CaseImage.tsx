import Image from 'next/image';
import { BrowserFrame } from '../../../_components/BrowserFrame/BrowserFrame';
import { ImageReveal } from '../../../_components/ImageReveal/ImageReveal';
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
      <ImageReveal>
        <BrowserFrame>
          <Image src={src} alt={alt} width={width} height={height} className={styles.slotImage} />
        </BrowserFrame>
      </ImageReveal>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
