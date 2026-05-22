type Props<T extends React.ElementType = 'span'> = {
  as?: T;
  size?: 'default' | 'sm';
  className?: string;
  children: React.ReactNode;
};

export function MonoLabel<T extends React.ElementType = 'span'>({
  as,
  size = 'default',
  className,
  children,
}: Props<T>) {
  const Tag = (as ?? 'span') as React.ElementType;
  const cls = [size === 'sm' ? 'mono-sm' : 'mono', className].filter(Boolean).join(' ');
  return <Tag className={cls}>{children}</Tag>;
}
