type Props = {
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'article' | 'header' | 'li' | 'span';
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay, as = 'div', className, children }: Props) {
  const Tag = as;
  const cls = ['reveal', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} data-delay={delay}>
      {children}
    </Tag>
  );
}
