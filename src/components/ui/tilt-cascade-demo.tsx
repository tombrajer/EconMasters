"use client"

import TiltCascadeCarousel from './tilt-cascade-carousel'
import { content } from '@/content'

export default function TiltCascadeDemo() {
  return <TiltCascadeCarousel items={content.gallery.map(photo => ({ title: photo.caption, src: photo.src, caption: '2026 edition' }))}
    defaultIndex={0} angle={18} drop={.36} inactiveScale={.62} radius={18}
    height="clamp(440px,calc(66vw + 150px),740px)" slideSize="clamp(240px,66vw,540px)"
    background="transparent" color="var(--ink)" fontFamily="var(--sans)" ariaLabel="Photos from the 2026 Economics Masters Challenge" />
}
