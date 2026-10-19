import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

/* Toast stack, ported from Bencho's Toast Stack without Framer Motion.
   Newest toast in front; up to two earlier ones tucked behind with a sliver
   showing. Fine-pointer hover, keyboard focus or a tap fans the stack out.
   Positions are CSS custom properties, so motion is plain transform transitions.
   Only real application events may push a toast; nothing here invents one. */

export type ToastKind = 'success' | 'error';
export type Toast = { id: number; kind: ToastKind; title: string; body?: string };

const SHOWN = 3;
const LEAVE_MS = 200;
const SUCCESS_MS = 6000;

export function useToasts() {
  const [toasts, setToasts] = useState<(Toast & { leaving?: boolean })[]>([]);
  const next = useRef(0);
  const timers = useRef(new Map<number, number>());

  const remove = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setToasts(list => list.map(toast => toast.id === id ? { ...toast, leaving: true } : toast));
    window.setTimeout(() => setToasts(list => list.filter(toast => toast.id !== id)), reduced ? 0 : LEAVE_MS);
  }, []);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = next.current++;
    setToasts(list => [{ ...toast, id }, ...list].slice(0, 6));
    return id;
  }, []);

  useEffect(() => () => { timers.current.forEach(timer => window.clearTimeout(timer)); }, []);

  return { toasts, push, dismiss: remove, timers };
}

type Controller = ReturnType<typeof useToasts>;

export function ToastStack({ toasts, dismiss, timers }: Controller) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const visible = toasts.filter(toast => !toast.leaving);

  /* Successes leave on their own after a pause; errors stay until dismissed.
     The countdown is held while the stack is open so it never vanishes mid-read. */
  useEffect(() => {
    if (open) {
      timers.current.forEach(timer => window.clearTimeout(timer));
      timers.current.clear();
      return;
    }
    for (const toast of toasts) {
      if (toast.kind !== 'success' || toast.leaving || timers.current.has(toast.id)) continue;
      timers.current.set(toast.id, window.setTimeout(() => { timers.current.delete(toast.id); dismiss(toast.id); }, SUCCESS_MS));
    }
  }, [toasts, open, dismiss, timers]);

  useEffect(() => { if (!visible.length) setOpen(false); }, [visible.length]);

  const onPointerEnter = (event: PointerEvent) => { if (event.pointerType === 'mouse') setOpen(true); };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && !root.current?.contains(document.activeElement)) setOpen(false);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    const front = visible[0];
    if (front) { event.stopPropagation(); dismiss(front.id); }
  };

  let depth = 0;
  return <section
    ref={root}
    className="toast-region"
    aria-label="Notifications"
    data-open={open || undefined}
    data-empty={!visible.length || undefined}
    style={{ '--toast-count': Math.min(visible.length, SHOWN) } as CSSProperties}
    onPointerEnter={onPointerEnter}
    onPointerLeave={onPointerLeave}
    onFocus={() => setOpen(true)}
    onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false); }}
    onKeyDown={onKeyDown}
  >
    <ol className="toast-list" aria-live="polite" aria-relevant="additions">
      {toasts.map(toast => {
        /* a leaving toast keeps the slot it is sliding out of */
        const index = toast.leaving ? depth : depth++;
        const hidden = index >= SHOWN;
        const tucked = !open && index > 0;
        return <li
          key={toast.id}
          className="toast"
          data-kind={toast.kind}
          data-leaving={toast.leaving || undefined}
          data-tucked={tucked || undefined}
          data-hidden={hidden || undefined}
          style={{ '--i': Math.min(index, SHOWN - 1) } as CSSProperties}
          aria-hidden={tucked || hidden || toast.leaving ? true : undefined}
          onClick={event => { if (!(event.target as HTMLElement).closest('button')) setOpen(value => !value); }}
        >
          <span className="toast-icon" aria-hidden="true">{toast.kind === 'success'
            ? <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="currentColor" /><path d="m6 10.2 2.6 2.6L14.2 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="currentColor" /><path d="M10 5.5v5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><circle cx="10" cy="14" r="1.1" fill="#fff" /></svg>}
          </span>
          <span className="toast-text"><strong>{toast.title}</strong>{toast.body && <span>{toast.body}</span>}</span>
          <button type="button" className="toast-close" aria-label={`Dismiss: ${toast.title}`} tabIndex={tucked || hidden ? -1 : 0} onClick={() => dismiss(toast.id)}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </li>;
      })}
    </ol>
  </section>;
}
