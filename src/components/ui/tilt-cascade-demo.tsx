"use client"

import TiltCascadeCarousel from './tilt-cascade-carousel'
import { content } from '@/content'

export default function TiltCascadeDemo() {
  return <TiltCascadeCarousel items={content.gallery.map(photo => ({ title: photo.caption, src: photo.src, caption: '2026 edition' }))}
    defaultIndex={0} angle={20} drop={.4} inactiveScale={.55} radius={16}
    height="clamp(400px,calc(60vw + 160px),560px)" slideSize="clamp(200px,60vw,360px)"
    background="transparent" color="var(--ink)" fontFamily="var(--sans)" ariaLabel="Photos from the 2026 Economics Masters Challenge" />
}
