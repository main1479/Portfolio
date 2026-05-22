import styles from './_Tag.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className }: Props) {
  return <span className={[styles.tag, className].filter(Boolean).join(' ')}>{children}</span>;
}
