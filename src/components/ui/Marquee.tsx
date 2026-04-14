"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

interface MarqueeProps {
  duration?: number
}

export default function Marquee({ duration = 18 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const tween = gsap.fromTo(
      track,
      { xPercent: 0 },
      {
        xPercent: -(100 / 3),
        duration,
        ease: "none",
        repeat: -1,
        force3D: false,
      },
    )

    return () => {
      tween.kill()
      gsap.set(track, { clearProps: "all" })
    }
  }, [duration])

  const item = (key: number) => (
    <span
      key={key}
      style={{
        fontSize: "clamp(7.625rem, 15.42vw, 13rem)",
        letterSpacing: "-0.06em",
        lineHeight: 1,
        textTransform: "uppercase",
        flexShrink: 0,
        paddingRight: "0.2em",
      }}
    >
      <span className="font-medium">quattroterzi</span>
      <span className="font-thin">studio</span>
    </span>
  )

  return (
    <div className="overflow-hidden w-full contact-marquee">
      <div ref={trackRef} className="inline-flex whitespace-nowrap">
        {item(0)}
        {item(1)}
        {item(2)}
      </div>
    </div>
  )
}
