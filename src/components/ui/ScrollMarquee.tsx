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
  topText = "IMAGINING SPACES.",
  bottomText = "MAKING THEM EXIST.",
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

    // ≥1024: start flush to edges. <1024: only ~10% visible off the sides.
    const isDesktop = () => window.innerWidth >= 1024
    const visibleRatio = 0.1

    const makeTriggerConfig = () => ({
      trigger: container,
      start: "top bottom+=200",
      // Longer scroll below desktop so the text moves slower and stays readable
      end: () => (isDesktop() ? "bottom top" : "bottom+=120% top"),
      scrub: isDesktop() ? 1.5 : 2,
      invalidateOnRefresh: true,
    })

    const flushRight = (track: HTMLElement) =>
      container.offsetWidth - track.offsetWidth

    // 10% of the text peeking in from the right / left edge
    const peekFromRight = (track: HTMLElement) =>
      container.offsetWidth - track.offsetWidth * visibleRatio
    const peekFromLeft = (track: HTMLElement) =>
      -track.offsetWidth * (1 - visibleRatio)

    // Desktop: short parallax from the edges.

    const travel = (track: HTMLElement) => {
      const viewW = container.offsetWidth
      const overflow = Math.max(0, track.offsetWidth - viewW)
      return overflow * 0.5 + viewW * 0.12
    }

    // Row 1: desktop flush right → left;
    const topTween = gsap.fromTo(
      topTrack,
      {
        x: () => (isDesktop() ? flushRight(topTrack) : peekFromRight(topTrack)),
      },
      {
        x: () =>
          isDesktop()
            ? flushRight(topTrack) - travel(topTrack)
            : peekFromLeft(topTrack),
        ease: "none",
        force3D: true,
        scrollTrigger: makeTriggerConfig(),
      },
    )

    // Row 2: desktop flush left → right;
    const bottomTween = gsap.fromTo(
      bottomTrack,
      {
        x: () => (isDesktop() ? 0 : peekFromLeft(bottomTrack)),
      },
      {
        x: () =>
          isDesktop() ? travel(bottomTrack) : peekFromRight(bottomTrack),
        ease: "none",
        force3D: true,
        scrollTrigger: makeTriggerConfig(),
      },
    )

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
      {/* Row 1: starts at right edge */}
      <div
        ref={topTrackRef}
        className="type-display-l uppercase whitespace-nowrap w-max"
        style={{ willChange: "transform" }}
      >
        {topText}
      </div>

      {/* Row 2: starts at left edge */}
      <div
        ref={bottomTrackRef}
        className="type-display-l uppercase whitespace-nowrap w-max pt-[0.3em]"
        style={{ willChange: "transform" }}
      >
        {bottomText}
      </div>
    </div>
  )
}
