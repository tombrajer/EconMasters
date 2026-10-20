import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { eligibility, site } from '../content';
import { cn } from '@/lib/utils';
import './site-chrome.css';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export function Mark() {
  return <svg viewBox="0 0 44 52" className="brand-mark" aria-hidden="true"><path fill="currentColor" d="M1 35h5v17H1zm9-9h5v26h-5zm9-9h5v35h-5zm9-9h5v44h-5zm9-8h5v52h-5z" /></svg>;
}

export function RegisterLink({ label = 'Registration', className = '', onClick }: { label?: string; className?: string; onClick?: () => void }) {
  return <a className={cn('button button--cta', className)} href="/register" onClick={onClick}><span className="button-label">{label}</span><Arrow /></a>;
}

const navigation = [{ href: '/#format', label: 'Format' }, { href: '/#prepare', label: 'Prepare' }, { href: '/#judges', label: 'Judges' }, { href: '/team', label: 'Team' }, { href: '/#faq', label: 'FAQ' }];

const focusable = 'a[href]:not([tabindex="-1"]),button:not([disabled])';

// Mark everything outside the header as inert while the mobile menu is open; returns the undo function.
function isolate(keep: HTMLElement) {
  const changed: Element[] = [];
  for (let node: HTMLElement | null = keep; node && node !== document.body; node = node.parentElement) {
    for (const sibling of Array.from(node.parentElement?.children ?? [])) {
      if (sibling === node || sibling.hasAttribute('inert') || sibling.tagName === 'SCRIPT') continue;
      sibling.setAttribute('inert', '');
      changed.push(sibling);
    }
  }
  return () => { for (const element of changed) element.removeAttribute('inert'); };
}

export function Header({ overHero = false }: { overHero?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, bodyOverflow: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = themeColor?.content;
    if (themeColor) themeColor.content = '#0a2448';
    const restore = shell.current ? isolate(shell.current) : () => {};
    const desktop = window.matchMedia('(min-width: 821px)');
    const onDesktop = () => { if (desktop.matches) setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !shell.current) return;
      const items = Array.from(shell.current.querySelectorAll<HTMLElement>(focusable)).filter(item => item.getClientRects().length > 0 && getComputedStyle(item).visibility !== 'hidden');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !shell.current.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !shell.current.contains(active))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      root.style.overflow = previous.overflow;
      document.body.style.overflow = previous.bodyOverflow;
      if (themeColor && previousTheme !== undefined) themeColor.content = previousTheme;
      restore();
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [open]);

  const close = () => setOpen(false);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div ref={shell} className={cn('header-shell header-shell--hero', !overHero && 'header-shell--page')} data-menu={open ? 'open' : 'closed'}><header className="site-header container">
      <a href="/" className="brand" aria-label={site.name} onClick={close}><Mark /><span>Economics<br />Masters<br />Challenge</span></a>
      <nav className="desktop-navigation" aria-label="Main navigation">{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <RegisterLink className="header-registration" />
      {mounted
        ? <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
          <span className="menu-toggle-text">Menu</span>
          <span className="menu-glyph" aria-hidden="true"><span /><span /></span>
        </button>
        // Prerendered, pre-hydration fallback: the native <details> menu works without JavaScript.
        : <details className="mobile-menu">
          <summary aria-label="Navigation menu"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" /></svg></summary>
          <nav aria-label="Mobile navigation">{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}<a href="/register">Registration<Arrow /></a></nav>
        </details>}
    </header>
    {mounted && <div className="menu-sheet" id={panelId} data-open={open} inert={!open} aria-hidden={!open}>
      <nav className="menu-sheet-nav" aria-label="Mobile navigation">
        <ul>{navigation.map((link, index) => <li key={link.href} style={{ '--i': index } as CSSProperties}><a href={link.href} onClick={close}><span>{link.label}</span><span className="menu-sheet-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></a></li>)}</ul>
      </nav>
      <div className="menu-sheet-foot" style={{ '--i': navigation.length } as CSSProperties}>
        <RegisterLink className="menu-sheet-cta" onClick={close} />
        <div className="menu-sheet-contact">
          <a href={`mailto:${site.email}`} onClick={close}>{site.email}</a>
          <a href={site.instagram} target="_blank" rel="noreferrer" onClick={close}>Instagram<Arrow diagonal /></a>
        </div>
      </div>
    </div>}
    </div>
  </>;
}

const footerColumns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  { title: 'Competition', links: [{ href: '/#format', label: 'Format' }, { href: '/#day', label: 'Schedule' }, { href: '/#prepare', label: 'Prepare' }, { href: '/#judges', label: 'Judges' }, { href: '/#partners', label: 'Partners' }] },
  { title: 'About', links: [{ href: '/team', label: 'Team' }, { href: '/#faq', label: 'FAQ' }, { href: '/register', label: 'Registration' }, { href: '/privacy', label: 'Privacy' }] },
  { title: 'Contact', links: [{ href: `mailto:${site.email}`, label: site.email }, { href: site.instagram, label: 'Instagram', external: true }] },
];

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid">
      <div className="footer-brand">
        <a href="/" className="brand" aria-label={site.name}><Mark /><span>Economics<br />Masters<br />Challenge</span></a>
        <p className="footer-tagline">A student-run economics competition for high school teams of three.</p>
      </div>
      <nav className="footer-columns" aria-label="Footer navigation">{footerColumns.map(column => <div className={`footer-column footer-column--${column.title.toLowerCase()}`} key={column.title}>
        <p className="footer-heading">{column.title}</p>
        <ul>{column.links.map(link => <li key={link.href}>{link.external
          ? <a href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow diagonal /></a>
          : <a href={link.href}>{link.label}</a>}</li>)}</ul>
      </div>)}</nav>
    </div>
    <div className="footer-bottom"><p>© 2026 Economics Masters Challenge</p><p>An initiative of Youth Voice · Hosted at {site.host}</p><a className="footer-admin" href="/admin" rel="nofollow">Admin</a></div>
  </div></footer>;
}

export function Portrait({ name, src, size = 600, className = '' }: { name: string; src?: string; size?: number; className?: string }) {
  if (src) return <img className={`portrait ${className}`} src={src} alt={name} width={size} height={size} loading="lazy" />;
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('');
  return <div className={`portrait portrait-placeholder ${className}`} role="img" aria-label={name ? `Portrait unavailable for ${name}` : 'Portrait to be announced'}>
    {initials ? <span>{initials}</span> : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4" fill="currentColor" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" /></svg>}
  </div>;
}

export function LinkedIn({ name, href }: { name: string; href: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="founder-linkedin" aria-label={`${name} on LinkedIn`}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.76V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.99 0 3.58 1.97 3.58 4.53v5.24Z" /></svg></a>;
}

export function EligibilityList() {
  return <dl className="facts-list">{eligibility.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function Disclosure({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fallback = useRef<HTMLDetailsElement>(null);
  const id = useId();
  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;
  useEffect(() => {
    // Carry over a disclosure the visitor opened before hydration finished.
    if (fallback.current?.open) setOpen(true);
    setMounted(true);
  }, []);
  const icon = <span className="disclosure-icon" aria-hidden="true" />;
  // Prerendered HTML: a native <details> that works without JavaScript and keeps the full text in the page.
  if (!mounted) return <details className={`disclosure-native ${className}`} ref={fallback}><summary><span className="disclosure-label">{label}</span>{icon}</summary><div className="disclosure-content">{children}</div></details>;
  return <div className={`disclosure ${className}`} data-open={open} data-keyboard={keyboard}>
    <h3 className="disclosure-heading">
      <button className="disclosure-trigger" id={triggerId} type="button" aria-expanded={open} aria-controls={panelId} onClick={event => {
        // Keyboard activation (detail 0) opens instantly; pointer activation animates.
        setKeyboard(event.detail === 0);
        setOpen(value => !value);
      }}><span className="disclosure-label">{label}</span>{icon}</button>
    </h3>
    <div className="disclosure-panel" id={panelId} role="region" aria-labelledby={triggerId} inert={!open}><div className="disclosure-content">{children}</div></div>
  </div>;
}
