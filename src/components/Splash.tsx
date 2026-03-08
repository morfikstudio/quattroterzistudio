"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"

import { cn } from "@/utils/classNames"
import { useCursorStore } from "@/stores/cursorStore"
import { useIsTouch } from "@/hooks/useIsTouch"

const MARQUEE_X_OFFSET = -0.25

type SplashProps = {
  title: string
  ctaText: string
}

export default function Splash({ title, ctaText }: SplashProps) {
  const setCursor = useCursorStore((s) => s.setCursor)
  const isTouch = useIsTouch()
  const [show, setShow] = useState(false)

  const rectRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const tl = useRef<GSAPTimeline>(null)
  const centerXRef = useRef(0)

  const marqueeX = () => centerXRef.current * (1 + MARQUEE_X_OFFSET)

  const titleWords = useMemo(
    () => title.trim().split(/\s+/).filter(Boolean),
    [title],
  )

  const renderTitleWords = (prefix: string) => (
    <div className="inline-block px-[0.25em] font-[Helvetica] uppercase text-[clamp(3rem,15vw,10rem)] leading-none font-medium">
      {titleWords.map((word, wordIndex) => (
        <span
          key={`${prefix}-word-${wordIndex}`}
          className="inline-block align-bottom"
        >
          {word.split("").map((letter, letterIndex) => (
            <span
              key={`${prefix}-${wordIndex}-${letterIndex}`}
              className="inline-block overflow-hidden align-bottom"
            >
              <span className="inline-block" data-splash-letter>
                {letter}
              </span>
            </span>
          ))}
          {wordIndex < titleWords.length - 1 ? (
            <span className="inline-block overflow-hidden align-bottom">
              <span className="inline-block" data-splash-letter>
                {"\u00A0"}
              </span>
            </span>
          ) : null}
        </span>
      ))}
    </div>
  )

  /**
   * Initialize marquee animation
   */
  useLayoutEffect(() => {
    const letters = Array.from(
      marqueeRef.current?.querySelectorAll<HTMLElement>(
        "[data-splash-letter]",
      ) || [],
    ).filter(Boolean)

    const marqueeEl = marqueeRef.current
    centerXRef.current = window.innerWidth / 2
    const marqueeLoopTime = title.length * 0.3

    tl.current = gsap
      .timeline({
        onStart: () => setShow(true),
        delay: 1,
      })
      .set(marqueeEl, { xPercent: 0, x: marqueeX(), force3D: false }, 0)
      .from(
        rectRef.current,
        {
          scale: 0.25,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
        },
        0,
      )
      .from(
        letters,
        {
          yPercent: 100,
          stagger: 0.05,
          duration: 0.9,
          delay: 0.2,
          ease: "expo.out",
          force3D: false,
        },
        0,
      )
      .to(
        marqueeEl,
        {
          xPercent: -(100 / 3),
          duration: marqueeLoopTime,
          ease: "none",
          force3D: false,
        },
        0,
      )
      .fromTo(
        marqueeEl,
        { xPercent: -(100 / 3), x: marqueeX },
        {
          xPercent: -(200 / 3),
          x: marqueeX,
          duration: marqueeLoopTime,
          ease: "none",
          repeat: -1,
          force3D: false,
        },
      )

    return () => {
      if (tl.current) {
        tl.current.kill()
      }
    }
  }, [])

  /**
   * Update marquee x position when window is resized
   */
  useEffect(() => {
    const onResize = () => {
      centerXRef.current = window.innerWidth / 2
      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { x: marqueeX() })
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  /**
   * Show custom text cursor on mount
   */
  useEffect(() => {
    setCursor(true)
    return () => setCursor(false)
  }, [setCursor])

  return (
    <Link href="/projects" className="cursor-none">
      <div
        className={cn(
          "relative w-full h-svh overflow-hidden isolation-isolate",
          !show ? "invisible opacity-0 pointer-events-none" : "",
        )}
      >
        <div
          ref={rectRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[65vw] md:max-w-[75vw] lg:max-w-[35vw] aspect-4/3 bg-black"
        />

        <div
          className="absolute inset-0 z-10 flex items-center overflow-hidden mix-blend-difference"
          aria-hidden
        >
          <div
            ref={marqueeRef}
            className="inline-flex whitespace-nowrap text-white"
          >
            {renderTitleWords("title-1")}
            {renderTitleWords("title-2")}
            {renderTitleWords("title-3")}
          </div>
        </div>

        {isTouch && (
          <span className="absolute bottom-25 left-1/2 -translate-x-1/2 font-[Helvetica] text-[12px] font-medium uppercase text-black">
            {ctaText}
          </span>
        )}
      </div>
    </Link>
  )
}
