type Props = {
  first?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function Section({ first, id, className, children, ariaLabel }: Props) {
  const cls = ['section', first ? 'section--first' : '', className].filter(Boolean).join(' ');
  return (
    <section className={cls} id={id} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
