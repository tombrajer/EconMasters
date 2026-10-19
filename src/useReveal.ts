import { useEffect } from 'react';

/**
 * Once-only entrance (fade + 8px rise) for the elements matching `selector`.
 *
 * The prerendered HTML is never hidden: elements are tagged and the `reveal-ready`
 * class goes on <html> only after the observer exists, and anything already on or
 * above the screen is marked as revealed straight away so nothing flashes.
 * Reduced motion, or no IntersectionObserver, skips the effect entirely.
 */
export function useReveal(selector: string) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = [...document.querySelectorAll<HTMLElement>(selector)];
    if (!targets.length) return;
    const html = document.documentElement;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = 'true';
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (const target of targets) {
      target.dataset.reveal = '';
      if (target.getBoundingClientRect().top < window.innerHeight) target.dataset.revealed = 'true';
      else observer.observe(target);
    }
    html.classList.add('reveal-ready');
    return () => {
      observer.disconnect();
      html.classList.remove('reveal-ready');
      for (const target of targets) {
        delete target.dataset.reveal;
        delete target.dataset.revealed;
      }
    };
  }, [selector]);
}
