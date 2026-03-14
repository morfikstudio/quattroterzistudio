"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

import Image from "@/components/ui/Image"
import Link from "@/components/ui/Link"
import ScrollIndicator from "@/components/ScrollIndicator"

type ProjectsScrollProps = {
  projects: PROJECTS_QUERY_RESULT
}

function useGsapScroll({
  sectionCount,
  sections,
  thumbs,
  words,
  onStart,
}: {
  sectionCount: number
  sections: (HTMLElement | null)[]
  thumbs: (HTMLDivElement | null)[]
  words: (HTMLSpanElement | null)[][]
  onStart: () => void
}) {
  const currentRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const touchStartYRef = useRef(0)

  const goToSection = useCallback(
    (nextIndex: number) => {
      if (
        isAnimatingRef.current ||
        nextIndex < 0 ||
        nextIndex >= sectionCount ||
        nextIndex === currentRef.current
      )
        return

      const prevIndex = currentRef.current
      const direction = nextIndex > prevIndex ? 1 : -1

      const incomingSection = sections[nextIndex]

      const incomingThumb = thumbs[nextIndex]
      const incomingLetters = words[nextIndex]?.filter(Boolean) ?? []

      const outgoingSection = sections[prevIndex]
      const outgoingLetters = words[prevIndex]?.filter(Boolean) ?? []

      if (!incomingSection || !incomingThumb) return

      isAnimatingRef.current = true
      currentRef.current = nextIndex

      // initial clip path based on direction
      const fromClip =
        direction > 0 ? "inset(100% 0 0% 0)" : "inset(0% 0 100% 0)"
      const fromY = direction > 0 ? 16 : -16

      gsap.set(incomingSection, { zIndex: 10, clipPath: fromClip })
      gsap.set(incomingThumb, { clipPath: fromClip, y: fromY })
      gsap.set(incomingLetters, { y: "110%" })

      gsap
        .timeline({
          onStart,
          onComplete: () => {
            if (outgoingSection) {
              gsap.set(outgoingSection, { zIndex: 0 })
            }

            gsap.set(incomingSection, { zIndex: 1 })

            // reset outgoing letters, ready for next visit
            if (outgoingLetters.length) {
              gsap.set(outgoingLetters, { y: "110%" })
            }

            isAnimatingRef.current = false
          },
        })
        .to(
          incomingSection,
          {
            clipPath: "inset(0% 0 0% 0)",
            duration: 1,
            ease: "expo.inOut",
          },
          0,
        )
        .to(
          incomingThumb,
          {
            clipPath: "inset(0% 0 0% 0)",
            y: 0,
            duration: 0.75,
            ease: "power4.out",
          },
          0.6,
        )
        .to(
          incomingLetters,
          {
            y: "0%",
            duration: 0.5,
            ease: "expo.out",
            stagger: 0.02,
          },
          0.5,
        )
    },
    [sectionCount, sections, thumbs, words],
  )

  // initial renderstate
  useEffect(() => {
    if (sectionCount === 0) return

    // show section 0
    gsap.set(sections[0], {
      zIndex: 1,
      clipPath: "inset(0% 0 0% 0)",
    })
    gsap.set(thumbs[0], { clipPath: "inset(0% 0 0% 0)", y: 0 })
    gsap.set(words[0]?.filter(Boolean) ?? [], { y: "0%" })

    // hide all other sections
    for (let i = 1; i < sectionCount; i++) {
      gsap.set(sections[i], {
        zIndex: 0,
        clipPath: "inset(100% 0 0% 0)",
      })
      gsap.set(thumbs[i], { clipPath: "inset(100% 0 0% 0)", y: 0 })
      gsap.set(words[i]?.filter(Boolean) ?? [], { y: "110%" })
    }

    return () => {
      sections.forEach((el) => {
        if (el) gsap.killTweensOf(el)
      })
      thumbs.forEach((el) => {
        if (el) gsap.killTweensOf(el)
      })
      words.forEach((letters) =>
        letters?.forEach((el) => {
          if (el) gsap.killTweensOf(el)
        }),
      )
    }
  }, [sectionCount, sections, thumbs, words])

  // wheel listener
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimatingRef.current || e.deltaY === 0) return
      goToSection(currentRef.current + (e.deltaY > 0 ? 1 : -1))
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [goToSection])

  // keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        goToSection(currentRef.current + 1)
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        goToSection(currentRef.current - 1)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goToSection])

  // touch listener
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return
      const delta = touchStartYRef.current - e.changedTouches[0].clientY
      if (Math.abs(delta) < 50) return
      goToSection(currentRef.current + (delta > 0 ? 1 : -1))
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [goToSection])
}

export default function ProjectsScroll({ projects }: ProjectsScrollProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  const sectionsRefs = useRef<(HTMLElement | null)[]>([])
  const thumbsRefs = useRef<(HTMLDivElement | null)[]>([])
  const wordsRefs = useRef<(HTMLSpanElement | null)[][]>([])

  const tmRef = useRef<NodeJS.Timeout | null>(null)

  function handleScrollIndicator() {
    setShowScrollIndicator(false)
    if (tmRef.current) clearTimeout(tmRef.current)
    tmRef.current = setTimeout(() => setShowScrollIndicator(true), 4000)
  }

  useGsapScroll({
    sectionCount: projects.length,
    sections: sectionsRefs.current,
    thumbs: thumbsRefs.current,
    words: wordsRefs.current,
    onStart: handleScrollIndicator,
  })

  useEffect(() => {
    return () => {
      if (tmRef.current) {
        clearTimeout(tmRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-svh overflow-hidden">
      {projects.map((p, i) => (
        <section
          key={p._id}
          ref={(el) => {
            sectionsRefs.current[i] = el
          }}
          className="absolute inset-0 overflow-hidden text-white"
        >
          <div className="absolute inset-0">
            <Image
              image={p.coverImage}
              resizeId="cover-image"
              fill
              fit="cover"
              sizes="100vw"
              priority={i < 2}
            />
          </div>

          <div
            className={cn(
              "absolute top-1/2 left-1/2 md:left-[7vw] -translate-y-1/2 -translate-x-1/2 md:translate-x-0",
              "w-[70vw] md:w-[50vw] lg:w-[35vw]",
            )}
          >
            <div
              ref={(el) => {
                thumbsRefs.current[i] = el
              }}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              <Image
                image={p.coverThumb}
                resizeId="cover-thumb"
                fill
                fit="cover"
                priority={i < 2}
              />
            </div>
          </div>

          <div
            className={cn(
              "absolute overflow-hidden",
              "top-1/2 -translate-y-1/2 left-[14px] md:left-[calc(50%)]",
            )}
          >
            <h1 className="leading-[1.2] text-5xl md:text-7xl">
              {(p.title ?? "").split("").map((char, j) => (
                <span
                  key={j}
                  ref={(el) => {
                    if (!wordsRefs.current[i]) wordsRefs.current[i] = []
                    wordsRefs.current[i][j] = el
                  }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px]">
            <span className="leading-[1.2] text-sm">{p.year}</span>
          </div>
        </section>
      ))}

      <div className="absolute bottom-20 left-10 z-10">
        <Link href="/archive">Archive</Link>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <ScrollIndicator show={showScrollIndicator} />
      </div>
    </div>
  )
}
