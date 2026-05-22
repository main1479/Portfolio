type Props = {
  label: string;
  title?: string;
  titleNodes?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
};

export function PageIntro({ label, title, titleNodes, sub, className }: Props) {
  return (
    <header className={['page-intro', className].filter(Boolean).join(' ')}>
      <span className="page-intro__label">{label}</span>
      <h1 className="page-intro__title">{titleNodes ?? title}</h1>
      {sub && <p className="page-intro__sub">{sub}</p>}
    </header>
  );
}
