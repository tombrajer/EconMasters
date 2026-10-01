import { useEffect, useRef } from 'react';

/** A synthetic market landscape, rather than a chart of real market data. */
export function MarketLandscape() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    if (!surface || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let time = 0;
    let previous = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const columns = width < 600 ? 62 : 110;
      for (let row = 0; row < 32; row++) {
        const depth = row / 31;
        for (let col = 0; col < columns; col++) {
          const u = col / (columns - 1);
          const x = (u - .5) * width * (1 + depth * .7) + width / 2;
          const wave = Math.sin(u * 13 + depth * 6 + time * .35) * Math.cos(u * 5 - time * .16);
          const y = height * .21 + depth * depth * height * .77 - wave * (18 + depth * 24);
          const alpha = (.14 + (wave + 1) * .1) * (1 - depth * .7);
          context.fillStyle = `rgba(255,255,255,${alpha})`;
          const size = .75 + depth * 1.3;
          context.fillRect(x, y, size, size);
        }
      }
      const curves = [
        { label: 'SUPPLY', sign: -1, alpha: .85 },
        { label: 'DEMAND', sign: 1, alpha: .45 },
      ];
      for (const curve of curves) {
        const points = Array.from({ length: 13 }, (_, index) => {
          const u = index / 12;
          return { x: width * (.08 + u * .84), y: height * (.49 + curve.sign * (u - .5) * .48) + Math.sin(u * 9 + time * .3) * 7 };
        });
        context.strokeStyle = `rgba(255,255,255,${curve.alpha})`;
        context.lineWidth = 1;
        context.beginPath();
        points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.stroke();
        points.forEach(point => {
          context.fillStyle = '#080808';
          context.beginPath(); context.arc(point.x, point.y, 3, 0, Math.PI * 2); context.fill(); context.stroke();
        });
        const endpoint = points[12];
        context.fillStyle = '#b5b5b5';
        context.font = '10px monospace';
        context.fillText(curve.label, endpoint.x - 45, endpoint.y - 16);
        const position = (time * .075 + (curve.sign === 1 ? .5 : 0)) % 1;
        const index = position * 12;
        const first = points[Math.floor(index)];
        const second = points[Math.min(Math.floor(index) + 1, 12)];
        const blend = index % 1;
        context.fillStyle = '#fff';
        context.beginPath(); context.arc(first.x + (second.x - first.x) * blend, first.y + (second.y - first.y) * blend, 4, 0, Math.PI * 2); context.fill();
      }
      surface.dataset.phase = time.toFixed(2);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || motion.matches) return;
      if (now - previous > 32) {
        time += Math.min((now - previous) / 1000, .05);
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.dataset.motion = motion.matches ? 'reduced' : 'animated';
      draw();
      if (visible && !document.hidden && !motion.matches) { previous = performance.now(); frame = requestAnimationFrame(tick); }
    };
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = Math.round(width * ratio); surface.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    intersection.observe(surface);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    resize();
    surface.parentElement?.setAttribute('data-ready', 'true');
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return <figure className="market-landscape" aria-label="Animated illustrative supply and demand curves over a dotted economic landscape. No real market data.">
    <svg className="landscape-fallback" viewBox="0 0 1200 350" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="market-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#666" /></pattern></defs>
      <path d="M0 80Q300 10 600 100T1200 75V350H0Z" fill="url(#market-dots)" />
      <path d="M80 260 180 235 280 230 380 190 480 175 580 172 680 140 780 130 880 100 980 95 1100 65M80 65 180 80 280 100 380 120 480 145 580 165 680 180 780 215 880 220 980 250 1100 270" fill="none" stroke="#ddd" strokeWidth="1" />
    </svg>
    <canvas ref={canvas} aria-hidden="true" />

  </figure>;
}

export function EconomicPlate({ kind }: { kind: 'frontier' | 'data' | 'network' }) {
  // A measured isometric plane: x/y are model coordinates, z is chart height.
  const project = (x: number, y: number, z = 0) => `${180 + (x - y) * 17},${93 + (x + y) * 8 - z}`;
  const grid = Array.from({ length: 11 }, (_, index) => index);
  return <div className="economic-plate"><svg viewBox="0 0 360 290" fill="none" aria-hidden="true">
    <path d={`M${project(0,0)} ${project(10,0)} ${project(10,10)} ${project(0,10)}Z`} fill="#111" stroke="#111" />
    <g stroke="#777" strokeWidth=".6">{grid.map(n => <path key={n} d={`M${project(n,0)} ${project(n,10)}M${project(0,n)} ${project(10,n)}`} />)}</g>
    {kind === 'frontier' ? <>
      {[2,4,6,8].map((x,i) => {
        const bar = `M${project(x,7)} ${project(x,7,25+i*15)} ${project(x+ .6,7,25+i*15)} ${project(x+ .6,7)}M${project(x,7,25+i*15)} ${project(x,7.6,25+i*15)} ${project(x+.6,7.6,25+i*15)} ${project(x+.6,7,25+i*15)}M${project(x,7.6,25+i*15)} ${project(x,7.6)}`;
        return <g key={x} className="chart-pillar" data-base-y={93+(x+7.3)*8}><path d={bar} fill="#111" stroke="#111" strokeWidth="2.5" /><path d={bar} fill="#111" stroke="#eee" strokeWidth=".8" /></g>;
      })}
    </> : kind === 'data' ? <>
      <path d={`M${project(1,4,10)} ${project(2,4,30)} ${project(3,4,20)} ${project(4,4,60)} ${project(5,4,40)} ${project(6,4,100)} ${project(7,4,70)} ${project(8,4,95)} ${project(9,4,80)}`} stroke="#111" strokeWidth="3.5" className="chart-curve" pathLength="1" />
      <path d={`M${project(1,4,10)} ${project(2,4,30)} ${project(3,4,20)} ${project(4,4,60)} ${project(5,4,40)} ${project(6,4,100)} ${project(7,4,70)} ${project(8,4,95)} ${project(9,4,80)}`} stroke="#fff" strokeWidth="1.5" className="chart-curve" pathLength="1" />
      {[2,4,6,8].map((x,i) => <path key={x} d={`M${project(x,4)} ${project(x,4,[30,60,100,95][i])}`} stroke="#999" strokeDasharray="2 3" />)}
    </> : <>
      <ellipse className="network-ring" cx="180" cy="173" rx="53" ry="25" stroke="#fff" strokeWidth="1" pathLength="1" />
      {[{x:2,y:2},{x:8,y:2},{x:2,y:8},{x:8,y:8}].map(({x,y},i) => <g className="network-branch" key={i}><path className="network-link" d={`M${project(5,5)} ${project(x,y)}`} stroke="#999" pathLength="1" /><circle className="network-node" cx={180+(x-y)*17} cy={93+(x+y)*8} r="5" fill="#111" stroke="white" /></g>)}
      <circle cx="180" cy="173" r="5" fill="white" />
    </>}
  </svg></div>;
}
