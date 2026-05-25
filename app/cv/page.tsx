import type { Metadata } from 'next';
import { cvContent } from '../_lib/cv-content';
import { CvDocument } from './_components/CvDocument/CvDocument';
import { PrintButton } from './_components/PrintButton/PrintButton';
import styles from './_cvPage.module.scss';

export const metadata: Metadata = {
  title: 'CV · Mainul Islam',
  description:
    'Frontend developer specialising in A/B testing and experimentation. Open to full-time remote and contract roles.',
  alternates: { canonical: '/cv' },
  robots: { index: false, follow: false },
};

export default function CvPage() {
  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <CvDocument content={cvContent} />
      </div>
      <PrintButton />
    </div>
  );
}
