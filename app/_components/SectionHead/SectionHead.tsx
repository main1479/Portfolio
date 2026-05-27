import { Reveal } from '../Reveal/Reveal';

type Props = {
  index: string;
  title?: string;
  titleNodes?: React.ReactNode;
  className?: string;
};

export function SectionHead({ index, title, titleNodes, className }: Props) {
  return (
    <Reveal as="header" className={['section__head', className].filter(Boolean).join(' ')}>
      <span className="section__index">{index}</span>
      <h2 className="section__title">{titleNodes ?? title}</h2>
    </Reveal>
  );
}
