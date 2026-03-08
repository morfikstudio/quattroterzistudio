"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"
import { getSanityImageUrl } from "@/lib/sanity"

import Link from "@/components/ui/Link"

const SCROLL_THRESHOLD = 50
const DELTA_RESET_MS = 200
const ANIMATION_DURATION_MS = 800

type ProjectsScrollProps = {
  projects: PROJECTS_QUERY_RESULT
}

function useFullPageScroll(sectionCount: number) {
  const [currentSection, setCurrentSection] = useState(0)

  const wrapRef = useRef<HTMLDivElement>(null)

  const isAnimatingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)
  const accumulatedDeltaRef = useRef(0)
  const touchStartYRef = useRef(0)

  // Single place for section change: validates bounds, scrolls wrapper, locks during animation
  const scrollToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= sectionCount || isAnimatingRef.current) return

      const wrapper = wrapRef.current
      if (!wrapper) return

      isAnimatingRef.current = true
      setCurrentSection(index)

      wrapper.scrollTo({
        top: index * window.innerHeight,
        behavior: "smooth",
      })

      setTimeout(() => {
        isAnimatingRef.current = false
      }, ANIMATION_DURATION_MS)
    },
    [sectionCount],
  )

  // Sync currentSection with actual scroll position (fixes fast scroll / native scroll desync)
  useEffect(() => {
    const wrapper = wrapRef.current
    if (!wrapper) return

    const onScroll = () => {
      const sectionHeight = wrapper.clientHeight
      if (sectionHeight <= 0) return
      const index = Math.round(wrapper.scrollTop / sectionHeight)
      const clamped = Math.max(0, Math.min(index, sectionCount - 1))
      setCurrentSection(clamped)
    }

    wrapper.addEventListener("scroll", onScroll, { passive: true })
    return () => wrapper.removeEventListener("scroll", onScroll)
  }, [sectionCount])

  // Wheel: accumulate delta and change section when over threshold
  useEffect(() => {
    const wrapper = wrapRef.current
    if (!wrapper) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimatingRef.current) return

      const now = Date.now()

      if (now - lastScrollTimeRef.current > DELTA_RESET_MS) {
        accumulatedDeltaRef.current = 0
      }

      lastScrollTimeRef.current = now
      accumulatedDeltaRef.current += e.deltaY

      if (Math.abs(accumulatedDeltaRef.current) > SCROLL_THRESHOLD) {
        const direction = accumulatedDeltaRef.current > 0 ? 1 : -1
        accumulatedDeltaRef.current = 0
        scrollToSection(currentSection + direction)
      }
    }

    wrapper.addEventListener("wheel", onWheel, { passive: false })
    return () => wrapper.removeEventListener("wheel", onWheel)
  }, [currentSection, scrollToSection])

  // Touch: swipe up/down to change section
  useEffect(() => {
    const wrapper = wrapRef.current
    if (!wrapper) return

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY
      if (Math.abs(deltaY) > SCROLL_THRESHOLD) {
        const direction = deltaY > 0 ? 1 : -1
        scrollToSection(currentSection + direction)
      }
    }

    wrapper.addEventListener("touchstart", onTouchStart, { passive: true })
    wrapper.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      wrapper.removeEventListener("touchstart", onTouchStart)
      wrapper.removeEventListener("touchend", onTouchEnd)
    }
  }, [currentSection, scrollToSection])

  // Keyboard: Arrow and Page Up/Down
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      let next = currentSection
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        next = Math.min(currentSection + 1, sectionCount - 1)
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        next = Math.max(currentSection - 1, 0)
      } else return

      if (next !== currentSection) {
        setCurrentSection(next)
        wrapRef.current?.scrollTo({
          top: next * window.innerHeight,
          behavior: "smooth",
        })
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentSection, sectionCount])

  return { wrapRef, currentSection }
}

export default function ProjectsScroll({ projects }: ProjectsScrollProps) {
  const { wrapRef, currentSection } = useFullPageScroll(projects.length)

  return (
    <div className="relative w-full h-svh overflow-hidden">
      <div
        ref={wrapRef}
        className="relative z-10 h-svh overflow-y-scroll overscroll-y-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => {
          const bgUrl = getSanityImageUrl(p.media?.[0]?.asset, 1920, 1080) || ""
          const altText = p.media?.[0]?.alt || ""

          return (
            <section
              key={p._id}
              className="h-svh w-full flex flex-col items-center justify-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 z-0 transform-[translateZ(0)]">
                <Image
                  src={bgUrl}
                  alt={altText}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i < 2}
                />
              </div>

              <div
                className={cn(
                  "text-center px-8 transition-all duration-700 relative z-10",
                  currentSection === i
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10",
                )}
              >
                <h1 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
                  {p.title}
                </h1>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-[5vw] aspect-4/3 w-[35vw]">
                <Image
                  src={getSanityImageUrl(p.media?.[0]?.asset, 600, 400) || ""}
                  alt={altText}
                  fill
                  className="object-cover"
                  priority={i < 2}
                />
              </div>
            </section>
          )
        })}
      </div>

      <div className="absolute bottom-20 left-10 z-10">
        <Link href="/archive">Archive</Link>
      </div>
    </div>
  )
}
