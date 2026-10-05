"use client"

import * as React from "react"
import './tilt-cascade-carousel.css'

export type TiltCascadeItem = { title: string; caption?: string; src?: string; alt?: string }
export type TiltCascadeCarouselProps = {
  items: TiltCascadeItem[]
  height?: string
  slideSize?: string
  angle?: number
  drop?: number
  inactiveScale?: number
  radius?: number
  bounce?: number
  duration?: number
  loop?: boolean
  autoplay?: number
  titles?: boolean
  captions?: boolean
  controls?: boolean
  background?: string
  color?: string
  fontFamily?: string
  fontHref?: string | null
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onSelect?: (item: TiltCascadeItem, index: number) => void
  ariaLabel?: string
  className?: string
}

export function wrapIndex(i: number, n: number): number {
  return n <= 0 ? 0 : ((i % n) + n) % n
}
export function indexAt(pos: number, n: number, loop: boolean): number {
  if (n <= 0) return 0
  const i = Math.round(pos)
  return loop ? wrapIndex(i, n) : Math.min(Math.max(i, 0), n - 1)
}
export function offsetOf(i: number, pos: number, n: number, loop: boolean): number {
  const d = i - pos
  return loop && n > 0 ? d - n * Math.round(d / n) : d
}
export function scaleAt(d: number, min: number): number {
  return 1 - (1 - min) * Math.min(Math.abs(d), 1)
}
export function rubber(pos: number, n: number): number {
  if (pos < 0) return pos / 3
  if (pos > n - 1) return n - 1 + (pos - (n - 1)) / 3
  return pos
}
export function springOf(bounce: number, duration: number) {
  const b = Math.min(Math.max(bounce, 0), 0.9)
  return { omega: (2 * Math.PI) / Math.max(duration, 0.1), slide: 1 - b / 2, tilt: 1 - b }
}
export function springStep(x: number, v: number, target: number, omega: number, zeta: number, dt: number): number[] {
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
  const h = dt / steps
  for (let k = 0; k < steps; k++) {
    v += (-omega * omega * (x - target) - 2 * zeta * omega * v) * h
    x += v * h
  }
  return [x, v]
}
export function releaseTarget(pos: number, velocity: number, n: number, loop: boolean): number {
  const here = Math.round(pos)
  let t = Math.round(pos + velocity * 0.2)
  t = Math.min(Math.max(t, here - 3), here + 3)
  return loop ? t : Math.min(Math.max(t, 0), n - 1)
}
export function targetFor(i: number, target: number, n: number, loop: boolean): number {
  if (!loop) return Math.min(Math.max(i, 0), n - 1)
  const here = Math.round(target)
  let d = i - wrapIndex(here, n)
  d -= n * Math.round(d / n)
  return here + d
}

function Chevron({ dir }: { dir: -1 | 1 }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir < 0 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} /></svg>
}
const pad = (n: number) => String(n).padStart(2, '0')
const blank = (i: number) => {
  const h = (i * 47 + 200) % 360
  return `linear-gradient(145deg,hsl(${h} 32% 82%),hsl(${(h + 40) % 360} 28% 64%))`
}

export default function TiltCascadeCarousel({
  items, height = "100svh", slideSize = "clamp(120px,80vmin,300px)",
  angle = 30, drop = .5, inactiveScale = .6, radius = 16, bounce = .2, duration = .8,
  loop = false, autoplay = 0, titles = true, captions = true, controls = true, color,
  background = "color-mix(in oklab,var(--color-foreground,#000) 7%,var(--color-background,#fff))",
  fontFamily = '"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif', fontHref = null,
  index, defaultIndex = 3, onIndexChange, onSelect, ariaLabel = "Photo carousel", className = "",
}: TiltCascadeCarouselProps) {
  const n = items.length
  const start = Math.min(Math.max(Math.round(index ?? defaultIndex), 0), Math.max(n - 1, 0))
  const [active, setActive] = React.useState(start)
  const [dragging, setDragging] = React.useState(false)
  const [stopped, setStopped] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [reduced, setReduced] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const slideRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const E = React.useRef({
    a: start, va: 0, b: start, vb: 0, target: start, raf: 0, last: 0, size: 300, reduced: false,
    drag: null as null | { id: number; x0: number; y0: number; pos0: number; moved: boolean; samples: { t: number; x: number }[] },
    clickBlock: false, wheel: 0, wheelAt: 0, stepAt: 0, clickTimer: 0,
  }).current
  const cfg = React.useRef({ n, loop, angle, drop, inactiveScale, bounce, duration })
  cfg.current = { n, loop, angle, drop, inactiveScale, bounce, duration }
  const cb = React.useRef({ onIndexChange, active })
  cb.current = { onIndexChange, active }

  const transformFor = (i: number, a: number, b: number) => {
    const c = cfg.current
    const dx = offsetOf(i, a, c.n, c.loop)
    const d = offsetOf(i, b, c.n, c.loop)
    return {
      transform: `translate3d(calc(${dx.toFixed(4)} * var(--tcc-s)),${(d * c.drop * 100).toFixed(3)}%,0) scale(${scaleAt(d, c.inactiveScale).toFixed(4)}) rotate(${(d * c.angle).toFixed(3)}deg)`,
      zIndex: 100 - Math.round(Math.abs(d) * 10), hidden: Math.abs(dx) > 6.5,
    }
  }
  const paint = () => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return
      const t = transformFor(i, E.a, E.b)
      el.style.transform = t.transform
      el.style.zIndex = String(t.zIndex)
      el.style.visibility = t.hidden ? "hidden" : ""
    })
  }
  const frame = (now: number) => {
    const dt = Math.min((now - (E.last || now)) / 1000, 1 / 20)
    E.last = now
    const s = springOf(cfg.current.bounce, cfg.current.duration)
    if (E.reduced && !E.drag) {
      E.a = E.b = E.target
      E.va = E.vb = 0
    } else {
      if (!E.drag) [E.a, E.va] = springStep(E.a, E.va, E.target, s.omega, s.slide, dt)
      ;[E.b, E.vb] = springStep(E.b, E.vb, E.a, s.omega * 1.05, s.tilt, dt)
    }
    paint()
    const settled = !E.drag && Math.abs(E.a - E.target) < 1e-3 && Math.abs(E.va) < 1e-2 && Math.abs(E.b - E.a) < 1e-3 && Math.abs(E.vb) < 1e-2
    if (settled) {
      E.a = E.b = E.target
      E.va = E.vb = E.raf = E.last = 0
      paint()
      return
    }
    E.raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!E.raf) E.raf = requestAnimationFrame(frame) }
  const setTarget = (t: number) => {
    const c = cfg.current
    if (!c.n) return
    E.target = c.loop ? t : Math.min(Math.max(t, 0), c.n - 1)
    const i = indexAt(E.target, c.n, c.loop)
    if (i !== cb.current.active) {
      setActive(i)
      cb.current.onIndexChange?.(i)
    }
    kick()
  }
  const goTo = (i: number) => setTarget(targetFor(i, E.target, cfg.current.n, cfg.current.loop))
  const step = (by: number) => setTarget(Math.round(E.target) + by)

  React.useEffect(() => {
    if (index == null || !n) return
    if (indexAt(E.target, n, loop) !== indexAt(index, n, loop)) goTo(indexAt(index, n, loop))
  }, [index, n, loop])
  React.useEffect(() => {
    if (n && !loop && E.target > n - 1) setTarget(n - 1)
    paint()
  }, [n, loop, angle, drop, inactiveScale])
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => { E.reduced = mq.matches; setReduced(mq.matches); kick() }
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [E])
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => { E.size = el.offsetWidth || 300 }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [E])
  React.useEffect(() => () => { cancelAnimationFrame(E.raf); clearTimeout(E.clickTimer) }, [E])
  React.useEffect(() => {
    if (!fontHref) return
    if (Array.from(document.querySelectorAll('link[rel=stylesheet]')).some(l => (l as HTMLLinkElement).href === fontHref)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = fontHref
    link.setAttribute('data-tilt-cascade-font', '')
    document.head.appendChild(link)
  }, [fontHref])
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const c = cfg.current
      if (!c.loop && ((E.target <= 0 && e.deltaX < 0) || (E.target >= c.n - 1 && e.deltaX > 0))) return
      e.preventDefault()
      const now = performance.now()
      if (now - E.wheelAt > 160) E.wheel = 0
      E.wheelAt = now; E.wheel += e.deltaX
      if (Math.abs(E.wheel) > 50 && now - E.stepAt > 320) {
        setStopped(true); step(Math.sign(E.wheel)); E.wheel = 0; E.stepAt = now
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [E])
  React.useEffect(() => {
    const el = rootRef.current
    if (!el || !autoplay) return
    let inView = true
    const sync = () => setVisible(inView && !document.hidden)
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() })
    io.observe(el)
    document.addEventListener('visibilitychange', sync)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [autoplay])
  const playing = autoplay > 0 && n > 1 && !stopped && !focused && !dragging && visible && !reduced
  React.useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => {
      if (!cfg.current.loop && Math.round(E.target) >= cfg.current.n - 1) goTo(0)
      else step(1)
    }, autoplay)
    return () => window.clearTimeout(t)
  }, [playing, active, autoplay])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !n || E.drag) return
    if ((e.target as Element).closest('[data-tcc-controls]')) return
    E.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: E.a, moved: false, samples: [{ t: e.timeStamp, x: e.clientX }] }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = E.drag
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x0
    if (!d.moved) {
      const dy = e.clientY - d.y0
      // A vertical gesture belongs to page scrolling, never capture it.
      if (Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) { E.drag = null; return }
      if (Math.abs(dx) < 6) return
      d.moved = true; d.x0 = e.clientX; d.pos0 = E.a; E.va = 0
      rootRef.current?.setPointerCapture(e.pointerId)
      setDragging(true); setStopped(true)
    }
    const c = cfg.current
    const raw = d.pos0 - (e.clientX - d.x0) / E.size
    E.a = c.loop ? raw : rubber(raw, c.n)
    if (E.reduced) E.b = E.a
    d.samples.push({ t: e.timeStamp, x: e.clientX })
    if (d.samples.length > 6) d.samples.shift()
    const i = indexAt(E.a, c.n, c.loop)
    if (i !== cb.current.active) { setActive(i); cb.current.onIndexChange?.(i) }
    kick()
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = E.drag
    if (!d || d.id !== e.pointerId) return
    E.drag = null
    if (rootRef.current?.hasPointerCapture(e.pointerId)) rootRef.current.releasePointerCapture(e.pointerId)
    if (!d.moved) return
    setDragging(false); E.clickBlock = true
    clearTimeout(E.clickTimer)
    E.clickTimer = window.setTimeout(() => { E.clickBlock = false }, 0)
    const first = d.samples[0], last = d.samples[d.samples.length - 1]
    const ms = Math.max(last.t - first.t, 1)
    const v = e.type === 'pointercancel' ? 0 : -(last.x - first.x) / ms / E.size * 1000
    E.va = v
    setTarget(releaseTarget(E.a, v, cfg.current.n, cfg.current.loop))
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    // Up/down remain available to scroll this document.
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Home') goTo(0)
    else if (e.key === 'End') goTo(n - 1)
    else return
    e.preventDefault(); setStopped(true)
  }
  const onSlideClick = (i: number) => {
    if (E.clickBlock) return
    setStopped(true)
    if (i === active) onSelect?.(items[i], i)
    else goTo(i)
  }
  const current = items[active]
  return <div ref={rootRef} className={'tcc-root ' + className}
    style={{ height, background, color, fontFamily }} role="region" aria-roledescription="carousel"
    aria-label={ariaLabel} tabIndex={0} data-dragging={dragging ? '' : undefined}
    onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
    onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
    onFocus={() => setFocused(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false) }}>
    <div ref={stageRef} className="tcc-stage" style={{ width: slideSize, '--tcc-s': slideSize, '--tcc-r': radius + 'px' } as React.CSSProperties}>
      {items.map((item, i) => {
        const t = transformFor(i, E.a, E.b), isActive = i === active
        return <button key={item.src ?? i} ref={el => { slideRefs.current[i] = el }} type="button" className="tcc-slide"
          data-active={isActive ? '' : undefined} tabIndex={isActive ? 0 : -1}
          aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${item.title}`}
          aria-current={isActive ? 'true' : undefined} onClick={() => onSlideClick(i)}
          style={{ transform: t.transform, zIndex: t.zIndex, visibility: t.hidden ? 'hidden' : undefined }}>
          <span className="tcc-frame">{item.src ? <img src={item.src} alt={item.alt ?? item.title} draggable={false}
            loading={Math.abs(i - start) > 3 ? 'lazy' : undefined} decoding="async" width={600} height={600} />
            : <span role="img" aria-label={item.alt ?? item.title} style={{ position: 'absolute', inset: 0, background: blank(i) }} />}</span>
          {titles && <span className="tcc-title" aria-hidden="true">{item.title}</span>}
          {captions && item.caption && <span className="tcc-cap" aria-hidden="true">{item.caption}</span>}
        </button>
      })}
    </div>
    {controls && n > 1 && <div className="tcc-controls" data-tcc-controls="">
      <button type="button" className="tcc-btn" aria-label="Previous slide" disabled={!loop && active <= 0} onClick={() => { setStopped(true); step(-1) }}><Chevron dir={-1} /></button>
      <div className="tcc-dots">{n > 14 ? <span className="tcc-count">{pad(active + 1)} / {pad(n)}</span> : items.map((item, i) =>
        <button key={i} type="button" className="tcc-dot" aria-label={`Go to slide ${i + 1}: ${item.title}`}
          aria-current={i === active ? 'true' : undefined} onClick={() => { setStopped(true); goTo(i) }} />)}</div>
      <button type="button" className="tcc-btn" aria-label="Next slide" disabled={!loop && active >= n - 1} onClick={() => { setStopped(true); step(1) }}><Chevron dir={1} /></button>
    </div>}
    <div className="tcc-sr" aria-live="polite" aria-atomic="true">{current ? `Slide ${active + 1} of ${n}: ${current.title}` : ''}</div>
  </div>
}
