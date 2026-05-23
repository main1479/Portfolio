import Link from 'next/link';
import { Container } from './_components/Container/Container';
import { PageIntro } from './_components/PageIntro/PageIntro';
import { Footer } from './_components/Footer/Footer';
import { Button } from './_components/Button/Button';
import styles from './_not-found.module.scss';

export const metadata = {
  title: 'Not found · Mainul Islam',
  description: "That URL doesn't lead anywhere on this site.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Container>
        <PageIntro
          label="404 / Not Found"
          titleNodes={
            <>
              Couldn&rsquo;t find
              <br />
              <span className="accent">that.</span>
            </>
          }
          sub="That URL doesn't lead anywhere on this site. Try the work index — or head back home."
        />
        <div className={styles.actions}>
          <Button href="/work">Go to work index</Button>
          <Link href="/" className={styles.homeLink}>
            Or back home →
          </Link>
        </div>
      </Container>
      <Footer />
    </>
  );
}
