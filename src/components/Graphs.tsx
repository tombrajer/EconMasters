import { useEffect, useRef } from 'react';
import { graphProgress } from '../behavior';
import { content } from '../content';

export function EquilibriumGraph() {
  return <figure className="hero-graph" aria-label="Illustrative supply and demand graph">
    <svg viewBox="0 0 520 460" role="img" aria-labelledby="equilibrium-title">
      <title id="equilibrium-title">Supply and demand curves meet at an equilibrium point. An illustrative economics diagram.</title>
      <g className="graph-grid"><path d="M65 110H455M65 200H455M65 290H455M65 380H455" /></g>
      <path className="graph-axis" d="M65 45v335h410" />
      <path className="graph-dashed" d="M65 234h204v146" />
      <path className="graph-demand" d="M105 99C180 122 227 185 269 234S364 338 442 349" />
      <path className="graph-supply" d="M105 349C170 325 216 276 269 234S364 132 442 87" />
      <circle className="equilibrium-halo" cx="269" cy="234" r="14" /><circle fill="var(--navy)" cx="269" cy="234" r="5" />
      <g className="graph-label"><text x="48" y="48">P</text><text x="481" y="388">Q</text><text x="425" y="69">S</text><text x="448" y="353">D</text><text x="280" y="224">E</text></g>
    </svg>
    <figcaption>Different perspectives. One equilibrium.</figcaption>
  </figure>;
}

export function SmallGraph({ kind }: { kind: 'foundations' | 'case' | 'frontier' }) {
  return <svg className={`small-graph ${kind}`} viewBox="0 0 210 145" fill="none" aria-hidden="true">
    <path className="graph-axis" d="M22 15v110h170" />
    {kind === 'foundations' ? <><path className="graph-demand" d="M35 32 178 108" /><path className="graph-supply" d="M35 107 178 31" /><circle cx="107" cy="70" r="4" fill="currentColor" /></> : kind === 'case' ? <><path className="graph-supply" d="m35 105 36-18 29 6 37-39 43-30" /><circle cx="180" cy="24" r="4" fill="currentColor" /></> : <><path className="graph-demand" d="M38 22c73 0 139 38 139 91" /><path className="graph-dashed" d="M111 49v76M22 49h89" /><circle cx="111" cy="49" r="4" fill="currentColor" /></>}
  </svg>;
}

export function Journey() {
  const wrapper = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const root = wrapper.current;
    if (!root) return;
    const graphics = [...root.querySelectorAll<SVGSVGElement>('.journey-graph')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const inset = rect.height / 12;
      const progress = graphProgress(rect.top + inset, rect.height - inset * 2, window.innerHeight, motion.matches);
      graphics.forEach(graphic => {
        const line = graphic.querySelector<SVGPathElement>('.journey-line');
        const end = graphic.querySelector<SVGCircleElement>('.journey-dot');
        if (!line || !end) return;
        const length = line.getTotalLength();
        line.style.strokeDasharray = `${length}`;
        line.style.strokeDashoffset = `${length * (1 - progress)}`;
        const point = line.getPointAtLength(length * progress);
        end.setAttribute('cx', `${point.x}`);
        end.setAttribute('cy', `${point.y}`);
        graphic.dataset.progress = progress.toFixed(3);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      observer.disconnect();
    };
  }, []);
  const vertical = { name: 'vertical', view: '0 0 128 840', route: 'M24 60C24 125 94 135 94 204S30 275 30 348S85 410 85 492S35 556 35 636S102 698 102 780', points: [{x:24,y:60},{x:94,y:204},{x:30,y:348},{x:85,y:492},{x:35,y:636},{x:102,y:780}] };
  const horizontal = { name: 'horizontal', view: '0 0 840 360', route: 'M140 25H420H700C795 25 815 55 815 115S795 205 700 205H420H140', points: [{x:140,y:25},{x:420,y:25},{x:700,y:25},{x:700,y:205},{x:420,y:205},{x:140,y:205}] };
  return <ol className="journey" ref={wrapper}>
    {[horizontal, vertical].map(graph => <svg key={graph.name} className={`journey-graph journey-${graph.name}`} viewBox={graph.view} preserveAspectRatio="none" aria-hidden="true">
      <path className="journey-track" d={graph.route} />
      {graph.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" className="journey-node" />)}
      <path className="journey-line" d={graph.route} />
      <circle className="journey-dot" cx={graph.points[5].x} cy={graph.points[5].y} r="6" />
    </svg>)}
    {content.steps.map(step => <li key={step.n}><span className="step-number">{step.n}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}
  </ol>;
}
