import { ScrambleIn } from '../ScrambleIn/ScrambleIn';
import { SplitReveal } from '../SplitReveal/SplitReveal';

type Props = {
  index: string;
  title?: string;
  titleNodes?: React.ReactNode;
  className?: string;
};

export function SectionHead({ index, title, titleNodes, className }: Props) {
  return (
    <header className={['section__head', className].filter(Boolean).join(' ')}>
      <ScrambleIn text={index} className="section__index" />
      <SplitReveal as="h2" type="chars" className="section__title">
        {titleNodes ?? title}
      </SplitReveal>
    </header>
  );
}
