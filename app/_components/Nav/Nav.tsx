'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { siteConfig } from '../../_lib/site-config';
import styles from './_Nav.module.scss';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstLink = drawerRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onToggle = useCallback(() => setOpen((v) => !v), []);
  const onLinkClick = useCallback(() => setOpen(false), []);

  return (
    <nav
      className={[styles.nav, scrolled ? styles.scrolled : '', open ? styles.isOpen : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Primary"
    >
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.mark} aria-label="Home">
          <span>{siteConfig.ownerName.split(' ')[0]}</span>
          <span className={styles.dot} aria-hidden="true" />
        </Link>

        <div
          ref={drawerRef}
          id={drawerId}
          className={styles.links}
          role="menu"
          aria-hidden={!open && undefined}
        >
          {siteConfig.navLinks.map((link) => {
            const current = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[styles.link, current ? styles.isCurrent : ''].filter(Boolean).join(' ')}
                aria-current={current ? 'page' : undefined}
                role="menuitem"
                onClick={onLinkClick}
              >
                <span className={styles.num}>{link.num}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={onToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
