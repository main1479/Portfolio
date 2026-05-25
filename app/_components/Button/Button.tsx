import Link from 'next/link';
import { Arrow } from '../Arrow/Arrow';
import { Magnetic } from '../Magnetic/Magnetic';
import styles from './_Button.module.scss';

type Variant = 'default' | 'ghost' | 'accent';

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  arrow?: boolean;
  arrowGlyph?: React.ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
};

type ButtonProps = CommonProps & {
  href?: never;
  external?: never;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type Props = AnchorProps | ButtonProps;

function classNames(variant: Variant, className?: string) {
  return [
    styles.btn,
    variant === 'ghost' ? styles.btnGhost : '',
    variant === 'accent' ? styles.btnAccent : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function inner(children: React.ReactNode, arrow: boolean, arrowGlyph?: React.ReactNode) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          {arrowGlyph ?? <Arrow size={18} strokeWidth={1.6} />}
        </span>
      )}
    </>
  );
}

export function Button(props: Props) {
  const { variant = 'default', className, children, arrow = true, arrowGlyph } = props;
  const cls = classNames(variant, className);
  const body = inner(children, arrow, arrowGlyph);

  if ('href' in props && props.href !== undefined) {
    const isExternal = props.external || /^(https?:|mailto:)/.test(props.href);
    if (isExternal) {
      return (
        <Magnetic>
          <a
            href={props.href}
            className={cls}
            target={props.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={props.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          >
            {body}
          </a>
        </Magnetic>
      );
    }
    return (
      <Magnetic>
        <Link href={props.href} className={cls}>
          {body}
        </Link>
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      <button type={props.type ?? 'button'} onClick={props.onClick} className={cls}>
        {body}
      </button>
    </Magnetic>
  );
}
