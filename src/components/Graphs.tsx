import { useEffect, useRef, useState } from 'react';
import { graphProgress } from '../behavior';
import { schedule } from '../content';

export function Timeline() {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = wrapper.current;
    if (!root) return;
    const stops = [...root.querySelectorAll<HTMLLIElement>('li')];
    const nodes = stops.map(stop => stop.querySelector<HTMLElement>('.timeline-node')!);
    const track = root.querySelector<HTMLElement>('.timeline-track')!;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const vertical = getComputedStyle(root).getPropertyValue('--axis').trim() === 'vertical';
      const centres = nodes.map(node => {
        const box = node.getBoundingClientRect();
        return vertical ? box.top + box.height / 2 - rect.top : box.left + box.width / 2 - rect.left;
      });
      const length = centres[centres.length - 1] - centres[0];
      Object.assign(track.style, vertical
        ? { top: `${centres[0]}px`, height: `${length}px`, left: '', width: '' }
        : { left: `${centres[0]}px`, width: `${length}px`, top: '', height: '' });
      const progress = vertical
        ? graphProgress(rect.top + rect.height * .1, rect.height * .55, window.innerHeight, motion.matches)
        : Math.min(1, graphProgress(rect.top, rect.height, window.innerHeight * .9, motion.matches) * 1.6);
      root.style.setProperty('--progress', progress.toFixed(3));
      stops.forEach((stop, index) => { stop.dataset.reached = String(centres[index] - centres[0] <= progress * length + .5); });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);
  return <div className="timeline" ref={wrapper}>
    <span className="timeline-track" aria-hidden="true"><span className="timeline-fill" /></span>
    <ol>{schedule.map(item => <li key={item.title} className={item.key ? 'key' : undefined} data-reached="true">
      <span className="timeline-node" aria-hidden="true" />
      <span className="timeline-time">{item.time}</span>
      <h3>{item.title}</h3>
      {item.detail && <p>{item.detail}</p>}
    </li>)}</ol>
  </div>;
}

export function ExampleQuestion() {
  const [answer, setAnswer] = useState<number | null>(null);
  const options = ['Price rises, quantity falls', 'Price falls, quantity rises', 'Price and quantity both rise', 'Nothing changes'];
  return <figure className="example-question" aria-label="Example question in the style of Round 1">
    <figcaption>Example question</figcaption>
    <p>A new technology lowers the cost of making solar panels. With demand unchanged, what happens to equilibrium price and quantity?</p>
    <ol>{options.map((option, index) => <li key={option}><button type="button" aria-pressed={answer === index} data-answer={answer === null ? undefined : index === 1 ? 'correct' : answer === index ? 'incorrect' : undefined} onClick={() => setAnswer(index)}><span>{'ABCD'[index]}</span>{option}{answer !== null && index === 1 && <svg className="answer-check" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>}</button></li>)}</ol>
    <div className="answer-feedback" role="status" hidden={answer === null}><strong>{answer === 1 ? 'Correct.' : 'The answer is B.'}</strong> Lower production costs shift supply to the right. Equilibrium price falls and quantity rises.</div>
  </figure>;
}
