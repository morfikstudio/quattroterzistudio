"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"
import { useNavigationStore } from "@/stores/navigationStore"

import Image from "@/components/ui/Image"
import ScrollIndicator from "@/components/ScrollIndicator"

type HeroProps = {
  cover: NonNullable<PROJECT_QUERY_RESULT>["coverDetail"]
  title: NonNullable<PROJECT_QUERY_RESULT>["title"] | null
  year: NonNullable<PROJECT_QUERY_RESULT>["year"] | null
}

const TRANSITION_PATHS = ["/projects", "/archive"]

export default function Hero({ cover, title, year }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const yearRef = useRef<HTMLSpanElement | null>(null)

  const shouldAnimate = useRef(
    typeof window !== "undefined" &&
      TRANSITION_PATHS.some((p) =>
        useNavigationStore.getState().previousPath?.startsWith(p),
      ),
  )

  useEffect(() => {
    if (!shouldAnimate.current) return
    // Clear so subsequent Hero instances (infinite scroll) don't animate
    shouldAnimate.current = false
    useNavigationStore.getState().setPreviousPath(null)

    const chars = titleRef.current
      ? (Array.from(titleRef.current.children) as HTMLElement[])
      : []
    const yearEl = yearRef.current

    if (chars.length) {
      gsap.set(chars, { y: "110%" })
      gsap.to(chars, {
        y: "0%",
        duration: 0.45,
        ease: "expo.out",
        stagger: 0.02,
        delay: 0.1,
      })
    }

    if (yearEl) {
      gsap.set(yearEl, { y: "110%" })
      gsap.to(yearEl, {
        y: "0%",
        duration: 0.7,
        ease: "expo.out",
        delay: 0.4,
      })
    }
  }, [])

  return (
    <div className="relative">
      {/* COVER IMAGE */}
      <div className="relative">
        <Image
          image={cover}
          resizeId="cover-detail"
          className="w-full"
          priority
        />

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <ScrollIndicator />
        </div>
      </div>

      {/* TITLE AND YEAR */}
      <div className="absolute inset-0 pointer-events-none pb-16">
        {title && (
          <div
            className={cn(
              "sticky overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 ml-[14px] md:ml-[calc(50%)]",
              "-translate-y-[calc(50%-4px)] md:-translate-y-[calc(50%-6px)]",
            )}
          >
            <h1 ref={titleRef}>
              {title.split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block type-h1 leading-none text-white"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>
        )}

        {year && (
          <div
            className={cn(
              "absolute overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 right-[14px] md:right-[24px]",
            )}
          >
            <span className="flex overflow-hidden">
              <span ref={yearRef} className="type-caption text-white">
                {year}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
