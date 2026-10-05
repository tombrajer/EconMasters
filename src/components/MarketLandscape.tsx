import { useEffect, useRef, useState } from 'react';
import { BASE, SPAN, demand, supply, equilibrium, scenario } from '../market';

const ACCENT = '#f9b12a';
const NAVY = '#0a2448';
const GRID = '#4a6690';

function curvePath(fn: (q: number) => number, shift: number, x: (q: number) => number, y: (p: number) => number) {
  const points: string[] = [];
  for (let index = 0; index <= 40; index++) {
    const local = (index / 40) * SPAN;
    points.push(`${x(local + shift).toFixed(1)},${y(fn(local)).toFixed(1)}`);
  }
  return `M${points.join('L')}`;
}

export function MarketLandscape() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const background = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    const backdrop = background.current;
    const backdropContext = backdrop?.getContext('2d');
    if (!surface || !context || !backdrop || !backdropContext) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let backdropWidth = 0;
    let backdropHeight = 0;
    let time = elapsed.current;
    let previous = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const compact = width < 640;
      const pad = compact ? 24 : 36;
      const left = pad;
      const right = width - pad;
      const top = compact ? 44 : 50;
      const bottom = height - (compact ? 34 : 40);
      const x = (q: number) => left + q * (right - left);
      const y = (p: number) => bottom - p * (bottom - top);

      backdropContext.clearRect(0, 0, backdropWidth, backdropHeight);
      const columns = compact ? 62 : 110;
      for (let row = 0; row < 48; row++) {
        const depth = row / 47;
        for (let col = 0; col < columns; col++) {
          const u = col / (columns - 1);
          const px = (u - .5) * backdropWidth * (1 + depth * .7) + backdropWidth / 2;
          const wave = Math.sin(u * 13 + depth * 6 + time * .35) * Math.cos(u * 5 - time * .16);
          const py = backdropHeight * .03 + depth * depth * backdropHeight * .97 - wave * (24 + depth * 40);
          // Leave quieter space around the centered title and event details.
          const centerFade = 1 - .7 * Math.exp(-Math.pow((px / backdropWidth - .5) * 3.5, 2)) * (1 - depth * .5);
          backdropContext.fillStyle = `rgba(255,255,255,${(.18 + (wave + 1) * .12) * centerFade * (1 - depth * .45)})`;
          const size = .75 + depth * 1.3;
          backdropContext.fillRect(px, py, size, size);
        }
      }

      context.strokeStyle = 'rgba(255,255,255,.45)';
      context.lineWidth = 1;
      context.beginPath(); context.moveTo(left, top - 14); context.lineTo(left, bottom); context.lineTo(right + 4, bottom); context.stroke();
      context.font = `${compact ? 10 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.fillStyle = 'rgba(255,255,255,.7)';
      context.textAlign = 'left';
      context.fillText('PRICE', left + 8, top - 16);
      context.textAlign = 'right';
      context.fillText('QUANTITY', right + 4, bottom + 20);

      const state = motion.matches ? { demandShift: BASE, supplyShift: BASE, label: 'Market equilibrium' } : scenario(time);
      const base = equilibrium(BASE, BASE);
      const current = equilibrium(state.demandShift, state.supplyShift);

      const stroke = (fn: (q: number) => number, shift: number, color: string, widthPx: number, dash: number[] = []) => {
        context.setLineDash(dash);
        context.strokeStyle = color;
        context.lineWidth = widthPx;
        context.stroke(new Path2D(curvePath(fn, shift, x, y)));
        context.setLineDash([]);
      };
      const demandMoved = Math.abs(state.demandShift - BASE) > .002;
      const supplyMoved = Math.abs(state.supplyShift - BASE) > .002;
      if (demandMoved) stroke(demand, BASE, 'rgba(255,255,255,.28)', 1, [4, 5]);
      if (supplyMoved) stroke(supply, BASE, 'rgba(255,255,255,.28)', 1, [4, 5]);
      stroke(demand, state.demandShift, 'rgba(255,255,255,.62)', 1.5);
      stroke(supply, state.supplyShift, ACCENT, 2);

      context.textAlign = 'left';
      context.fillStyle = '#fff';
      context.font = `600 ${compact ? 12 : 13}px Inter, Arial, sans-serif`;
      context.fillText(demandMoved ? 'D₁' : 'D', x(SPAN + state.demandShift) + 6, y(demand(SPAN)) + 4);
      context.fillStyle = ACCENT;
      context.fillText(supplyMoved ? 'S₁' : 'S', x(SPAN + state.supplyShift) + 6, y(supply(SPAN)) + 4);
      if (Math.abs(state.demandShift - BASE) > .06) { context.fillStyle = 'rgba(255,255,255,.4)'; context.fillText('D₀', x(SPAN + BASE) + 6, y(demand(SPAN)) + 4); }
      if (Math.abs(state.supplyShift - BASE) > .06) { context.fillStyle = 'rgba(255,255,255,.4)'; context.fillText('S₀', x(SPAN + BASE) + 6, y(supply(SPAN)) + 4); }

      const ex = x(current.q);
      const ey = y(current.p);
      context.setLineDash([3, 4]);
      context.strokeStyle = 'rgba(255,255,255,.45)';
      context.lineWidth = 1;
      context.beginPath(); context.moveTo(left, ey); context.lineTo(ex, ey); context.lineTo(ex, bottom); context.stroke();
      if (demandMoved || supplyMoved) {
        context.strokeStyle = 'rgba(255,255,255,.18)';
        context.beginPath(); context.moveTo(left, y(base.p)); context.lineTo(x(base.q), y(base.p)); context.lineTo(x(base.q), bottom); context.stroke();
      }
      context.setLineDash([]);

      context.fillStyle = 'rgba(249,177,42,.2)';
      context.beginPath(); context.arc(ex, ey, compact ? 10 : 13, 0, Math.PI * 2); context.fill();
      context.fillStyle = ACCENT;
      context.beginPath(); context.arc(ex, ey, 4.5, 0, Math.PI * 2); context.fill();

      context.font = `${compact ? 10 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.fillStyle = '#fff';
      context.textAlign = 'right';
      context.fillText('P*', left - 8, ey + 4);
      context.textAlign = 'center';
      context.fillText('Q*', ex, bottom + 20);
      context.textAlign = 'right';
      context.fillStyle = 'rgba(255,255,255,.75)';
      context.fillText(state.label.toUpperCase(), right - 60, top - 16);

      surface.dataset.phase = time.toFixed(2);
      surface.dataset.scenario = state.label;
      surface.dataset.price = current.p.toFixed(3);
      surface.dataset.quantity = current.q.toFixed(3);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || motion.matches || paused) return;
      if (now - previous > 32) {
        time += Math.min((now - previous) / 1000, .05);
        elapsed.current = time;
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.dataset.motion = motion.matches ? 'reduced' : paused ? 'paused' : 'animated';
      draw();
      if (visible && !document.hidden && !motion.matches && !paused) { previous = performance.now(); frame = requestAnimationFrame(tick); }
    };
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = Math.round(width * ratio); surface.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const backdropRect = backdrop.getBoundingClientRect();
      backdropWidth = backdropRect.width; backdropHeight = backdropRect.height;
      backdrop.width = Math.round(backdropWidth * ratio); backdrop.height = Math.round(backdropHeight * ratio);
      backdropContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    observer.observe(backdrop);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    intersection.observe(surface);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    resize();
    surface.closest('.market-landscape')?.setAttribute('data-ready', 'true');
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
    };
  }, [paused]);

  const fx = (q: number) => 60 + q * 1100;
  const fy = (p: number) => 320 - p * 280;
  const point = equilibrium(BASE, BASE);
  return <figure className="market-landscape" aria-label="Animated supply and demand diagram. Demand shifts right, raising price and quantity; then supply shifts right, lowering price and raising quantity. Illustrative, not real market data.">
    <canvas className="hero-landscape-background" ref={background} aria-hidden="true" />
    <div className="market-graph">
    <svg className="landscape-fallback" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
      <path d="M60 26V320H1164" fill="none" stroke={GRID} vectorEffect="non-scaling-stroke" />
      <path d={curvePath(demand, BASE, fx, fy)} fill="none" stroke="#a7b3c7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d={curvePath(supply, BASE, fx, fy)} fill="none" stroke={ACCENT} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d={`M60 ${fy(point.p)}H${fx(point.q)}V320`} fill="none" stroke={GRID} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      <circle cx={fx(point.q)} cy={fy(point.p)} r="4" fill={ACCENT} />
      <g fill="#c7d0de" fontFamily="Arial, sans-serif" fontSize="13"><text x="70" y="22">Price</text><text x="1160" y="348" textAnchor="end">Quantity</text><text x={fx(SPAN + BASE) + 10} y={fy(supply(SPAN))}>S</text><text x={fx(SPAN + BASE) + 10} y={fy(demand(SPAN))}>D</text></g>
    </svg>
    <canvas ref={canvas} aria-hidden="true" />
    <button className="market-pause" type="button" aria-label={paused ? 'Play market animation' : 'Pause market animation'} onClick={() => setPaused(value => !value)}>
      <svg viewBox="0 0 20 20" aria-hidden="true">{paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M7 5v10m6-10v10" stroke="currentColor" strokeWidth="2" />}</svg>
    </button>
    </div>
  </figure>;
}

export function EconomicPlate({ kind }: { kind: 'frontier' | 'data' | 'network' }) {
  // A measured isometric plane: x/y are model coordinates, z is chart height.
  const project = (x: number, y: number, z = 0) => `${180 + (x - y) * 17},${93 + (x + y) * 8 - z}`;
  const grid = Array.from({ length: 11 }, (_, index) => index);
  return <div className="economic-plate"><svg viewBox="0 0 360 290" fill="none" aria-hidden="true">
    <path d={`M${project(0,0)} ${project(10,0)} ${project(10,10)} ${project(0,10)}Z`} fill={NAVY} stroke={NAVY} />
    <g stroke={GRID} strokeWidth=".6">{grid.map(n => <path key={n} d={`M${project(n,0)} ${project(n,10)}M${project(0,n)} ${project(10,n)}`} />)}</g>
    {kind === 'frontier' ? <>
      {[2,4,6,8].map((x,i) => {
        const bar = `M${project(x,7)} ${project(x,7,25+i*15)} ${project(x+ .6,7,25+i*15)} ${project(x+ .6,7)}M${project(x,7,25+i*15)} ${project(x,7.6,25+i*15)} ${project(x+.6,7.6,25+i*15)} ${project(x+.6,7,25+i*15)}M${project(x,7.6,25+i*15)} ${project(x,7.6)}`;
        return <g key={x} className="chart-pillar" data-base-y={93+(x+7.3)*8}><path d={bar} fill={NAVY} stroke={NAVY} strokeWidth="2.5" /><path d={bar} fill={NAVY} stroke={ACCENT} strokeWidth=".8" /></g>;
      })}
    </> : kind === 'data' ? <>
      <path d={`M${project(1,4,10)} ${project(2,4,30)} ${project(3,4,20)} ${project(4,4,60)} ${project(5,4,40)} ${project(6,4,100)} ${project(7,4,70)} ${project(8,4,95)} ${project(9,4,80)}`} stroke={NAVY} strokeWidth="3.5" className="chart-curve" pathLength="1" />
      <path d={`M${project(1,4,10)} ${project(2,4,30)} ${project(3,4,20)} ${project(4,4,60)} ${project(5,4,40)} ${project(6,4,100)} ${project(7,4,70)} ${project(8,4,95)} ${project(9,4,80)}`} stroke={ACCENT} strokeWidth="1.5" className="chart-curve" pathLength="1" />
      {[2,4,6,8].map((x,i) => <path key={x} d={`M${project(x,4)} ${project(x,4,[30,60,100,95][i])}`} stroke="#a7b3c7" strokeDasharray="2 3" />)}
    </> : <>
      <ellipse className="network-ring" cx="180" cy="173" rx="53" ry="25" stroke={ACCENT} strokeWidth="1" pathLength="1" />
      {[{x:2,y:2},{x:8,y:2},{x:2,y:8},{x:8,y:8}].map(({x,y},i) => <g className="network-branch" key={i}><path className="network-link" d={`M${project(5,5)} ${project(x,y)}`} stroke="#a7b3c7" pathLength="1" /><circle className="network-node" cx={180+(x-y)*17} cy={93+(x+y)*8} r="5" fill={NAVY} stroke="white" /></g>)}
      <circle cx="180" cy="173" r="5" fill={ACCENT} />
    </>}
  </svg></div>;
}
