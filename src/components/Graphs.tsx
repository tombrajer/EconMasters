import { useEffect, useRef, useState } from 'react';
import { graphProgress } from '../behavior';
import { schedule } from '../content';
import { questions, verdict } from '../quiz';
import { Arrow } from './Shared';

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
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const heading = useRef<HTMLElement | null>(null);
  const moved = useRef(false);
  const total = questions.length;
  const finished = step >= total;
  const question = questions[step];
  const picked = picks[step];
  const answered = picked !== undefined;
  const score = picks.reduce((sum, pick, index) => sum + (pick === questions[index].answer ? 1 : 0), 0);
  const result = verdict(score, total);

  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [step]);

  const choose = (index: number) => { if (!answered) setPicks(current => [...current, index]); };
  const restart = () => { setPicks([]); setStep(0); };

  if (finished) return <figure className="example-question quiz-result" data-tone={result.tone} aria-label="Practice quiz result">
    <figcaption>Practice quiz<span>Finished</span></figcaption>
    <p className="quiz-score"><strong tabIndex={-1} ref={node => { heading.current = node; }}>{score}/{total}</strong><span className="visually-hidden"> correct</span></p>
    <div role="status">
      <h4>{result.title}</h4>
      <p>{result.message}</p>
    </div>
    <ol className="quiz-review" aria-label="Answers by question">{questions.map((item, index) => <li key={item.prompt} data-correct={picks[index] === item.answer}><span aria-hidden="true">{index + 1}</span><span className="visually-hidden">Question {index + 1}: {picks[index] === item.answer ? 'correct' : 'incorrect'}</span></li>)}</ol>
    <div className="quiz-actions">
      <button type="button" className="button" onClick={restart}>Try again</button>
      {result.tone === 'ready' && <a className="text-link" href="/register">Register your team<Arrow /></a>}
    </div>
  </figure>;

  return <figure className="example-question" aria-label="Practice quiz in the style of Round 1">
    <figcaption>
      <span>{question.topic}</span>
      <span className="quiz-count" aria-label={`Question ${step + 1} of ${total}`}>{String(step + 1).padStart(2, '0')} / {total}</span>
    </figcaption>
    <div className="quiz-progress" aria-hidden="true">{questions.map((item, index) => <span key={item.prompt} data-state={index < picks.length ? (picks[index] === item.answer ? 'right' : 'wrong') : index === step ? 'current' : 'todo'} />)}</div>
    <p className="quiz-prompt" tabIndex={-1} ref={node => { heading.current = node; }}>{question.prompt}</p>
    <ol>{question.options.map((option, index) => <li key={option}><button type="button" aria-pressed={picked === index} aria-disabled={answered} data-answer={!answered ? undefined : index === question.answer ? 'correct' : picked === index ? 'incorrect' : undefined} onClick={() => choose(index)}><span>{'ABCD'[index]}</span>{option}{answered && index === question.answer && <svg className="answer-check" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>}</button></li>)}</ol>
    <div className="answer-feedback" role="status" hidden={!answered}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill={picked === question.answer ? '#4f806a' : '#4e5a6e'} /><path d="m6 12 4 4 8-9" fill="none" stroke="#fff" strokeWidth="2" /></svg>
      <p><strong>{picked === question.answer ? 'Correct.' : `The answer is ${'ABCD'[question.answer]}.`}</strong> {question.explanation}</p>
    </div>
    {answered && <div className="quiz-actions"><button type="button" className="button" onClick={() => setStep(step + 1)}>{step + 1 === total ? 'See my score' : 'Next question'}</button></div>}
  </figure>;
}
