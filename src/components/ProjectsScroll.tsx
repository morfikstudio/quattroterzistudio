"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import gsap from "gsap"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { getSanityImageUrl } from "@/lib/sanity"

import Link from "@/components/ui/Link"
import ScrollIndicator from "@/components/ScrollIndicator"

type ProjectsScrollProps = {
  projects: PROJECTS_QUERY_RESULT
}

function useGsapScroll(
  sectionCount: number,
  sectionsRefs: React.MutableRefObject<(HTMLElement | null)[]>,
  thumbsRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  lettersRefs: React.MutableRefObject<(HTMLSpanElement | null)[][]>,
  onScroll: () => void,
) {
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

      const incomingSection = sectionsRefs.current[nextIndex]
      const incomingThumb = thumbsRefs.current[nextIndex]
      const incomingLetters =
        lettersRefs.current[nextIndex]?.filter(Boolean) ?? []

      const outgoingSection = sectionsRefs.current[prevIndex]
      const outgoingLetters =
        lettersRefs.current[prevIndex]?.filter(Boolean) ?? []

      if (!incomingSection || !incomingThumb) return

      isAnimatingRef.current = true
      currentRef.current = nextIndex

      // initial clip path based on direction
      const fromClip =
        direction > 0 ? "inset(100% 0 0% 0)" : "inset(0% 0 100% 0)"

      gsap.set(incomingSection, { zIndex: 10, clipPath: fromClip })
      gsap.set(incomingThumb, { clipPath: fromClip })
      gsap.set(incomingLetters, { y: "110%" })

      gsap
        .timeline({
          onStart: onScroll,
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
            duration: 1,
            ease: "expo.inOut",
          },
          0.2,
        )
        .to(
          incomingLetters,
          {
            y: "0%",
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.025,
          },
          0.55,
        )
    },
    [sectionCount, sectionsRefs, thumbsRefs, lettersRefs],
  )

  // initial renderstate
  useEffect(() => {
    if (sectionCount === 0) return

    // show section 0
    gsap.set(sectionsRefs.current[0], {
      zIndex: 1,
      clipPath: "inset(0% 0 0% 0)",
    })
    gsap.set(thumbsRefs.current[0], { clipPath: "inset(0% 0 0% 0)" })
    gsap.set(lettersRefs.current[0]?.filter(Boolean) ?? [], { y: "0%" })

    // hide all other sections
    for (let i = 1; i < sectionCount; i++) {
      gsap.set(sectionsRefs.current[i], {
        zIndex: 0,
        clipPath: "inset(100% 0 0% 0)",
      })
      gsap.set(thumbsRefs.current[i], { clipPath: "inset(100% 0 0% 0)" })
      gsap.set(lettersRefs.current[i]?.filter(Boolean) ?? [], { y: "110%" })
    }

    return () => {
      sectionsRefs.current.forEach((el) => {
        if (el) gsap.killTweensOf(el)
      })
      thumbsRefs.current.forEach((el) => {
        if (el) gsap.killTweensOf(el)
      })
      lettersRefs.current.forEach((letters) =>
        letters?.forEach((el) => {
          if (el) gsap.killTweensOf(el)
        }),
      )
    }
  }, [sectionCount, sectionsRefs, thumbsRefs, lettersRefs])

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
  const lettersRefs = useRef<(HTMLSpanElement | null)[][]>([])

  const tmRef = useRef<NodeJS.Timeout | null>(null)

  useGsapScroll(projects.length, sectionsRefs, thumbsRefs, lettersRefs, () => {
    setShowScrollIndicator(false)
    if (tmRef.current) clearTimeout(tmRef.current)
    tmRef.current = setTimeout(() => setShowScrollIndicator(true), 5000)
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
      {projects.map((p, i) => {
        const bgUrl = getSanityImageUrl(p.media?.[0]?.asset, 1920, 1080) || ""
        const altText = p.media?.[0]?.alt || ""

        return (
          <section
            key={p._id}
            ref={(el) => {
              sectionsRefs.current[i] = el
            }}
            className="absolute inset-0 overflow-hidden text-white"
          >
            <div className="absolute inset-0">
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
              ref={(el) => {
                thumbsRefs.current[i] = el
              }}
              className="absolute top-1/2 -translate-y-1/2 left-[7vw] aspect-4/3 w-[35vw] overflow-hidden"
            >
              <Image
                src={getSanityImageUrl(p.media?.[0]?.asset, 600, 400) || ""}
                alt={altText}
                fill
                className="object-cover"
                priority={i < 2}
              />
            </div>

            <div className="absolute top-1/2 left-[calc(50%)] -translate-y-1/2 overflow-hidden">
              <h1 className="text-7xl leading-[1.2]">
                {(p.title ?? "").split("").map((char, j) => (
                  <span
                    key={j}
                    ref={(el) => {
                      if (!lettersRefs.current[i]) lettersRefs.current[i] = []
                      lettersRefs.current[i][j] = el
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
            </div>
          </section>
        )
      })}

      <div className="absolute bottom-20 left-10 z-10">
        <Link href="/archive">Archive</Link>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <ScrollIndicator show={showScrollIndicator} />
      </div>
    </div>
  )
}
