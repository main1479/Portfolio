type Props = {
  first?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  /**
   * Velocity-skew participation (see SmoothScroll). Default on; switch off
   * for sections containing pinned elements (gallery pin, StickyPin) — a
   * skewing ancestor makes pins jitter.
   */
  skew?: boolean;
};

export function Section({ first, id, className, children, ariaLabel, skew = true }: Props) {
  const cls = ['section', first ? 'section--first' : '', className].filter(Boolean).join(' ');
  return (
    <section className={cls} id={id} aria-label={ariaLabel} data-skew={skew ? '' : undefined}>
      {children}
    </section>
  );
}
