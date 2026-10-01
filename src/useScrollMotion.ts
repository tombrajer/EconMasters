import { useEffect, type RefObject } from 'react';
import { economicProgress } from './behavior';

export function useScrollMotion(main: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = main.current;
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('.economic-row')];
    const photos = [...root.querySelectorAll<HTMLElement>('.gallery figure')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const progress = window.innerWidth > 640
          ? economicProgress(rect.top, rect.height, viewport, motion.matches)
          : motion.matches ? 1 : Math.min(1, Math.max(0, (viewport * .9 - rect.top) / (rect.height * .7)));
        const svg = row.querySelector<SVGSVGElement>('.economic-plate svg');
        if (svg) svg.style.transform = `translateY(${(1 - progress) * 16}px)`;
        row.querySelectorAll<SVGPathElement>('.chart-curve').forEach(path => {
          path.style.strokeDasharray = '1';
          path.style.strokeDashoffset = `${1 - progress}`;
        });
        row.querySelectorAll<SVGGElement>('.chart-pillar').forEach((pillar, index) => {
          const rise = Math.min(1, Math.max(0, progress * 4 - index));
          const base = Number(pillar.dataset.baseY);
          pillar.setAttribute('transform', `matrix(1 0 0 ${rise} 0 ${base * (1 - rise)})`);
          pillar.style.opacity = `${Math.min(1, rise * 5)}`;
        });
        row.querySelectorAll<SVGGElement>('.network-branch').forEach((branch, index) => {
          const reveal = Math.min(1, Math.max(0, progress * 4 - index));
          const link = branch.querySelector<SVGPathElement>('.network-link');
          const node = branch.querySelector<SVGCircleElement>('.network-node');
          if (link) {
            link.style.strokeDasharray = '1';
            link.style.strokeDashoffset = `${1 - reveal}`;
          }
          if (node) node.style.opacity = `${Math.min(1, Math.max(0, (reveal - .7) / .3))}`;
        });
        const ring = row.querySelector<SVGEllipseElement>('.network-ring');
        if (ring) {
          ring.style.strokeDasharray = '1';
          ring.style.strokeDashoffset = `${1 - progress}`;
        }
        row.dataset.motionProgress = progress.toFixed(3);
      });
      photos.forEach(photo => {
        const rect = photo.getBoundingClientRect();
        const image = photo.querySelector('img');
        if (!image) return;
        const position = Math.min(1, Math.max(-1, (rect.top + rect.height / 2 - viewport / 2) / viewport));
        const overscan = Math.max(0, Math.min(12, (image.parentElement?.clientHeight || 0) * .03 - 1));
        image.style.transform = motion.matches ? 'none' : `translateY(${position * -overscan}px) scale(1.06)`;
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [main]);
}
