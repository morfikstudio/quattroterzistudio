"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/lib/utils"

const SCROLL_THRESHOLD = 50
const DELTA_RESET_MS = 200
const ANIMATION_DURATION_MS = 800

const PROJECTS = [
  {
    id: 1,
    title: "Progetto 1",
    gradient: "from-purple-600 to-blue-600",
  },
  {
    id: 2,
    title: "Progetto 2",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: 3,
    title: "Progetto 3",
    gradient: "from-cyan-600 to-teal-600",
  },
] as const

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

  // Wheel: accumulate delta and change section when over threshold
  useEffect(() => {
    const wrapper = wrapRef.current
    if (!wrapper) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimatingRef.current) return

      const now = Date.now()
      if (now - lastScrollTimeRef.current > DELTA_RESET_MS)
        accumulatedDeltaRef.current = 0
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
  const { wrapRef, currentSection } = useFullPageScroll(PROJECTS.length)

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        ref={wrapRef}
        className="relative z-10 h-screen overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {PROJECTS.map((hero, i) => (
          <section
            key={hero.id}
            className={cn(
              "h-screen w-full flex flex-col items-center justify-center text-white relative overflow-hidden bg-linear-to-br",
              hero.gradient,
            )}
          >
            <div
              className={cn(
                "text-center px-8 transition-all duration-700 relative z-10",
                currentSection === i
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-2xl">
                {hero.title}
              </h1>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
