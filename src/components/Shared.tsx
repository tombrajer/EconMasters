import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { eligibility, site } from '../content';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export function Mark() {
  return <svg viewBox="0 0 44 52" className="brand-mark" aria-hidden="true"><path fill="currentColor" d="M1 35h5v17H1zm9-9h5v26h-5zm9-9h5v35h-5zm9-9h5v44h-5zm9-8h5v52h-5z" /></svg>;
}

export function RegisterLink({ label = 'Registration', className = '' }: { label?: string; className?: string }) {
  return <a className={`button ${className}`} href="/register">{label}<Arrow /></a>;
}

const navigation = [{ href: '/#format', label: 'Format' }, { href: '/#prepare', label: 'Prepare' }, { href: '/#judges', label: 'Judges' }, { href: '/#faq', label: 'FAQ' }];

export function Header() {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="header-shell"><header className="site-header container">
      <a href="/" className="brand" aria-label={site.name}><Mark /><span>Economics<br />Masters<br />Challenge</span></a>
      <nav className="desktop-navigation" aria-label="Main navigation">{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <RegisterLink className="header-registration" />
      <details className="mobile-menu" ref={menu}>
        <summary aria-label="Navigation menu"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" /></svg></summary>
        <nav aria-label="Mobile navigation">{navigation.map(link => <a key={link.href} href={link.href} onClick={() => { if (menu.current) menu.current.open = false; }}>{link.label}</a>)}<a href="/register">Registration<Arrow /></a></nav>
      </details>
    </header></div>
  </>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-top"><a href="/" className="brand" aria-label={site.name}><Mark /><span>Economics<br />Masters<br />Challenge</span></a><a className="text-link" href={`mailto:${site.email}`}>{site.email}<Arrow diagonal /></a></div>
    <div className="footer-links"><nav aria-label="Footer navigation"><a href="/#format">Format</a><a href="/#day">Schedule</a><a href="/#prepare">Prepare</a><a href="/#judges">Judges</a><a href="/#partners">Partners</a><a href="/#faq">FAQ</a><a href="/register">Registration</a></nav><a href={site.instagram} target="_blank" rel="noreferrer">Instagram<Arrow diagonal /></a></div>
    <div className="footer-bottom"><p>© 2026 Economics Masters Challenge</p><p>An initiative of Youth Voice · Hosted at {site.host}</p></div>
  </div></footer>;
}

export function EligibilityList() {
  return <dl className="facts-list">{eligibility.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function Disclosure({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const id = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Keep native disclosures usable in the prerendered page without JavaScript.
  if (!mounted) return <details className={className}><summary>{label}<span className="disclosure-icon" aria-hidden="true" /></summary>{children}</details>;
  return <div className={`disclosure ${className}`} data-open={open} data-keyboard={keyboard}>
    <button className="disclosure-trigger" type="button" aria-expanded={open} aria-controls={id} onClick={event => {
      setKeyboard(event.detail === 0);
      setOpen(value => !value);
    }}>{label}<span className="disclosure-icon" aria-hidden="true" /></button>
    <div className="disclosure-panel" id={id} inert={!open} aria-hidden={!open}><div className="disclosure-content">{children}</div></div>
  </div>;
}
