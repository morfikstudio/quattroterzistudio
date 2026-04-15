"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/utils/classNames"
import Lenis from "lenis"
import { useLenis } from "@/components/LenisProvider"

interface ScrollMarqueeProps {
  topText?: string
  bottomText?: string
  className?: string
}

export default function ScrollMarquee({
  topText = "IF IT DOESN'T FEEL REAL",
  bottomText = "WE START OVER.",
  className,
}: ScrollMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topTrackRef = useRef<HTMLDivElement>(null)
  const bottomTrackRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const topTrack = topTrackRef.current
    const bottomTrack = bottomTrackRef.current
    if (!container || !topTrack || !bottomTrack) return

    const makeTriggerConfig = () => ({
      trigger: container,
      start: "top bottom+=200",
      end: "bottom top",
      scrub: 1.5,
      invalidateOnRefresh: true,
    })

    // Row 1
    const topTween = gsap.fromTo(
      topTrack,
      { x: 200 },
      {
        x: -300,
        ease: "none",
        force3D: true,
        scrollTrigger: makeTriggerConfig(),
      },
    )

    // Row 2
    const isMobile = () => window.innerWidth < 768
    const bottomTween = gsap.fromTo(
      bottomTrack,
      { x: () => (isMobile() ? -100 : -150) },
      {
        x: () => (isMobile() ? 50 : 250),
        ease: "none",
        force3D: true,
        scrollTrigger: makeTriggerConfig(),
      },
    )

    // Ensure positions are computed after layout is stable
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(refreshId)
      topTween.scrollTrigger?.kill()
      bottomTween.scrollTrigger?.kill()
      topTween.kill()
      bottomTween.kill()
      gsap.set([topTrack, bottomTrack], { clearProps: "all" })
    }
  }, [lenis])

  return (
    <div
      ref={containerRef}
      className={cn("w-full overflow-hidden py-24", className)}
    >
      {/* Row 1: left-aligned */}
      <div
        ref={topTrackRef}
        className="type-display-l uppercase whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        {topText}
      </div>

      {/* Row 2: right-aligned */}
      <div
        ref={bottomTrackRef}
        className="type-display-l uppercase whitespace-nowrap pt-[0.3em]"
        style={{ willChange: "transform", textAlign: "right" }}
      >
        {bottomText}
      </div>
    </div>
  )
}
