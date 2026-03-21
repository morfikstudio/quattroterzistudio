"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

interface DoubleMarqueeProps {
  duration?: number
}

export default function DoubleMarquee({ duration = 18 }: DoubleMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topTrackRef = useRef<HTMLDivElement>(null)
  const bottomTrackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const topTrack = topTrackRef.current
    const bottomTrack = bottomTrackRef.current
    if (!container || !topTrack || !bottomTrack) return

    // Start paused, play when in viewport
    const topTween = gsap.fromTo(
      topTrack,
      { xPercent: 0 },
      {
        xPercent: -(100 / 6),
        duration,
        ease: "none",
        repeat: -1,
        force3D: false,
        paused: true,
      },
    )

    const bottomTween = gsap.fromTo(
      bottomTrack,
      { xPercent: -(100 / 6) },
      {
        xPercent: 0,
        duration,
        ease: "none",
        repeat: -1,
        force3D: false,
        paused: true,
      },
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            topTween.play()
            bottomTween.play()
          } else {
            topTween.pause()
            bottomTween.pause()
          }
        })
      },
      { threshold: 0 },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      topTween.kill()
      bottomTween.kill()
      gsap.set([topTrack, bottomTrack], { clearProps: "all" })
    }
  }, [duration])

  const item = (key: number) => (
    <span
      key={key}
      className="type-display-l"
      style={{
        textTransform: "uppercase",
        flexShrink: 0,
        paddingRight: "0.2em",
        fontWeight: 500,
      }}
    >
      Lorem ipsum dolor sit amet consectetur
    </span>
  )

  return (
    <div ref={containerRef} className="overflow-x-hidden w-full">
      {/* Top row: right to left */}
      <div
        ref={topTrackRef}
        className="inline-flex whitespace-nowrap pt-[0.3em]"
      >
        {item(0)}
        {item(1)}
        {item(2)}
      </div>

      {/* Bottom row: left to right */}
      <div ref={bottomTrackRef} className="inline-flex whitespace-nowrap">
        {item(3)}
        {item(4)}
        {item(5)}
      </div>
    </div>
  )
}
