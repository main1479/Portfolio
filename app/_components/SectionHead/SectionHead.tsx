import { Reveal } from '../Reveal/Reveal';
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
      <Reveal as="span" className="section__index">
        {index}
      </Reveal>
      <SplitReveal as="h2" type="chars" className="section__title">
        {titleNodes ?? title}
      </SplitReveal>
    </header>
  );
}
