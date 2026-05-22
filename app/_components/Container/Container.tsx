type Props = {
  narrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Container({ narrow, className, children }: Props) {
  const cls = ['container', narrow ? 'container--narrow' : '', className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}
