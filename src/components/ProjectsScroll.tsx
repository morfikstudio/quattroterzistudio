"use client"

import { useEffect, useRef, useCallback, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { getImageUrl } from "@/utils/media"
import { cn } from "@/utils/classNames"

import { useBreakpoint } from "@/stores/breakpointStore"
import { useIsTouch } from "@/hooks/useIsTouch"
import { useLenis } from "@/components/LenisProvider"

import Image from "@/components/ui/Image"
import ScrollIndicator from "@/components/ScrollIndicator"

type ProjectsScrollProps = {
  projects: PROJECTS_QUERY_RESULT
}

gsap.registerPlugin(ScrollTrigger)

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

export default function ProjectsScroll({ projects }: ProjectsScrollProps) {
  const router = useRouter()
  const lenis = useLenis()
  const { current: breakpoint } = useBreakpoint()
  const isTouch = useIsTouch()

  const [firstBgReady, setFirstBgReady] = useState(false)
  const [firstThumbReady, setFirstThumbReady] = useState(false)

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const sectionsRefs = useRef<(HTMLElement | null)[]>([])
  const bgRefs = useRef<(HTMLDivElement | null)[]>([])
  const thumbWrapRefs = useRef<(HTMLDivElement | null)[]>([]) // Outer thumb wrapper controls stacking order (z-index) across sections.
  const thumbClipRefs = useRef<(HTMLDivElement | null)[]>([]) // Inner thumb (overflow-hidden) receives clip-path animations.
  const wordsRefs = useRef<(HTMLSpanElement | null)[][]>([])
  const yearsRefs = useRef<(HTMLSpanElement | null)[]>([])

  const transitioningRef = useRef(false)
  const transitionTweenRef = useRef<gsap.core.Tween | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const raf = useRef<number | null>(null)
  const lastWidth = useRef<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  )

  const isDesktop = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      window?.innerWidth / window?.innerHeight >= 1.35 && // 4:3 ratio
      breakpoint?.startsWith("desktop")
    )
  }, [breakpoint])

  const onResize = useCallback(() => {
    /*
    Only trigger if the width has changed to avoid
    mobile browser bars causing vertical resizing
    */
    const newWidth = window.innerWidth
    if (newWidth === lastWidth.current) return

    lastWidth.current = newWidth

    if (raf.current !== null) return

    raf.current = window.requestAnimationFrame(() => {
      raf.current = null
      ScrollTrigger.refresh()
    })
  }, [])

  const handleProjectClick = useCallback(
    async (e: React.MouseEvent, i: number, slug: string) => {
      e.preventDefault()

      if (transitioningRef.current || !lenis) return
      transitioningRef.current = true

      if (!isDesktop) {
        router.push(`/projects/${slug}`)
        return
      }

      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const { signal } = abortRef.current

      const el = thumbWrapRefs.current[i]
      const clipEl = thumbClipRefs.current[i]
      if (!el || !clipEl) {
        transitioningRef.current = false
        return
      }

      lenis.stop()
      gsap.killTweensOf(el)
      transitionTweenRef.current?.kill()
      transitionTweenRef.current = null

      const rect = el.getBoundingClientRect()

      el.style.setProperty("--tw-translate-x", "0px")
      el.style.setProperty("--tw-translate-y", "0px")

      gsap.set(clipEl, { clipPath: "none" })

      gsap.set(el, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        zIndex: 100,
        overwrite: true,
      })

      try {
        await new Promise<void>((resolve) => {
          transitionTweenRef.current = gsap.to(el, {
            top: 0,
            left: 0,
            width: "100%",
            overwrite: true,
            duration: 1,
            ease: "expo.out",
            onComplete: resolve,
          })
        })

        if (!signal.aborted) {
          router.push(`/projects/${slug}`)
        }
      } finally {
        transitionTweenRef.current = null
      }
    },
    [lenis, router, isDesktop],
  )

  const show = useMemo(
    () => firstBgReady && firstThumbReady,
    [firstBgReady, firstThumbReady],
  )

  useEffect(() => {
    if (!breakpoint || projects.length === 0 || !wrapRef.current) return

    let textTl: gsap.core.Timeline | null = null
    let refreshSyncHandler: (() => void) | null = null

    const ctx = gsap.context(() => {
      let activeIndex = 0
      let targetIndex = 0

      // overall progress of each section
      const sectionProgresses = Array.from({ length: projects.length }, () => 0)

      /*
        Set default position of text
        (y: 0% for active section, -110% for previous section, 110% for future section)
      */
      function applyTextCanonicalState(activeIdx: number) {
        for (let i = 0; i < projects.length; i++) {
          const letters = wordsRefs.current[i]?.filter(Boolean) ?? []
          const year = yearsRefs.current[i]
          const y = i < activeIdx ? "-110%" : i === activeIdx ? "0%" : "110%"
          gsap.set(letters, { y })
          if (year) gsap.set(year, { y })
        }
      }

      function handleTexts(nextIndex: number) {
        if (
          /* If the text is already being animated to the next index, do nothing */
          (textTl && targetIndex === nextIndex) ||
          /* If the next index is the same as the active index, do nothing */
          nextIndex === activeIndex
        )
          return

        /* If text is already being animated, kill it and reset the active index */
        if (textTl) {
          textTl.kill()
          textTl = null
          activeIndex = targetIndex
        }

        /* Kill all tweens */
        const allLetters = wordsRefs.current.flat().filter(Boolean)
        const allYears = yearsRefs.current.filter(Boolean)
        gsap.killTweensOf(allLetters)
        gsap.killTweensOf(allYears)

        /* Set the target index */
        targetIndex = nextIndex

        const lettersOut = wordsRefs.current[activeIndex]?.filter(Boolean) ?? []
        const yearOut = yearsRefs.current[activeIndex]
        const lettersIn = wordsRefs.current[nextIndex]?.filter(Boolean) ?? []
        const yearIn = yearsRefs.current[nextIndex]

        const isDown = nextIndex > activeIndex
        const outgoingY = isDown ? "-100%" : "100%"
        const incomingFromY = isDown ? "100%" : "-100%"

        /* Set the default position */
        applyTextCanonicalState(activeIndex)

        const tl = gsap.timeline({
          onComplete: () => {
            activeIndex = nextIndex
            targetIndex = nextIndex
            textTl = null
          },
        })

        textTl = tl

        tl.to(
          lettersOut,
          {
            y: outgoingY,
            duration: 0.3,
            ease: "power2.in",
            overwrite: "auto",
          },
          0,
        )

        if (yearOut) {
          tl.to(
            yearOut,
            {
              y: outgoingY,
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto",
            },
            0,
          )
        }

        tl.set(lettersIn, { y: incomingFromY }, 0)

        if (yearIn) {
          tl.set(yearIn, { y: incomingFromY }, 0)
        }

        tl.to(
          lettersIn,
          {
            y: "0%",
            duration: 0.45,
            ease: "expo.out",
            stagger: 0.02,
            overwrite: "auto",
          },
          0.1,
        )

        if (yearIn) {
          tl.to(
            yearIn,
            {
              y: "0%",
              duration: 0.7,
              ease: "expo.out",
              overwrite: "auto",
            },
            0.4,
          )
        }
      }

      function handleThumbs(activeIdx: number, progress: number) {
        const prevIdx = activeIdx - 1

        /*
          Normalize the inset top percentage to 3 decimal places
          so it can be used in the clip-path animation
        */
        function normalizeInsetTopPerc(value: number) {
          const clamped = Math.min(100, Math.max(0, value))

          const snapEpsilon = 0.2

          if (clamped <= snapEpsilon) return 0
          if (clamped >= 100 - snapEpsilon) return 100

          return Math.round(clamped * 1000) / 1000 // 3 decimals rounding
        }

        for (let i = 0; i < projects.length; i++) {
          const thumbClip = thumbClipRefs.current[i]
          const thumbWrap = thumbWrapRefs.current[i]

          if (!thumbClip || !thumbWrap) continue

          if (i === activeIdx) {
            /* ACTIVE SECTION */
            const topPerc = normalizeInsetTopPerc((1 - progress) * 100)
            gsap.set(thumbClip, { clipPath: `inset(${topPerc}% 0% 0% 0%)` })
            gsap.set(thumbWrap, { zIndex: 2 })
          } else if (i === prevIdx) {
            /* PREVIOUS SECTION */
            gsap.set(thumbClip, { clipPath: "inset(0% 0% 0% 0%)" })
            gsap.set(thumbWrap, { zIndex: 1 })
          } else {
            /* FUTURE SECTION */
            gsap.set(thumbClip, { clipPath: "inset(100% 0% 0% 0%)" })
            gsap.set(thumbWrap, { zIndex: 0 })
          }
        }
      }

      function getActiveIndexFromProgress() {
        for (let i = projects.length - 1; i >= 0; i--) {
          if (sectionProgresses[i] > 0) return i
        }
        return 0
      }

      const syncFromProgress = () => {
        const nextIndex = getActiveIndexFromProgress()
        const baseProgress = clamp(sectionProgresses[nextIndex] ?? 0)

        /*
          Keep the same reveal start, but finish earlier
          so the thumb stays fully visible longer
        */
        const compressedProgress = clamp(baseProgress * 2)
        /* Thumb animation */
        handleThumbs(nextIndex, compressedProgress)
        /* Text animation */
        handleTexts(nextIndex)
      }

      sectionsRefs.current.forEach((s, i) => {
        const bg = bgRefs.current[i]
        const { innerHeight: wh } = window

        if (!s || !bg) return

        const isFirst = i === 0

        /* Background parallax */
        gsap.fromTo(
          bg,
          {
            backgroundPosition: () =>
              isFirst ? "50% 0px" : `50% ${-wh * 0.5}px`,
          },
          {
            backgroundPosition: () => `50% ${wh * 0.5}px`,
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: () => (isFirst ? "top top" : "top bottom"),
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )

        /* Section main progress */
        ScrollTrigger.create({
          trigger: s,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onUpdate: ({ progress }) => {
            sectionProgresses[i] = clamp(progress)
            syncFromProgress()
          },
          onRefresh: ({ progress }) => {
            sectionProgresses[i] = clamp(progress)
            syncFromProgress()
          },
        })
      })

      /* Sections snap
      (only desktop due to mobile browser bars)
      */
      if (projects.length > 1 && !isTouch) {
        ScrollTrigger.create({
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (projects.length - 1)}`,
          snap: {
            snapTo: 1 / (projects.length - 1),
            directional: false,
            inertia: true,
            delay: 0,
            duration: { min: 0.2, max: 0.35 },
            ease: "power1.out",
          },
          onUpdate: syncFromProgress,
          onRefresh: syncFromProgress,
        })
      }

      applyTextCanonicalState(0)
      handleThumbs(0, 1)
      refreshSyncHandler = syncFromProgress
      ScrollTrigger.addEventListener("refreshInit", refreshSyncHandler)
      ScrollTrigger.addEventListener("refresh", refreshSyncHandler)
      syncFromProgress()
    }, wrapRef)

    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)

      if (raf.current !== null) {
        window.cancelAnimationFrame(raf.current)
      }

      if (refreshSyncHandler) {
        ScrollTrigger.removeEventListener("refreshInit", refreshSyncHandler)
        ScrollTrigger.removeEventListener("refresh", refreshSyncHandler)
      }

      abortRef.current?.abort()
      abortRef.current = null
      transitionTweenRef.current?.kill()
      transitionTweenRef.current = null

      ctx.revert()
      lenis?.start()
    }
  }, [breakpoint, isTouch, projects, lenis])

  /* Initialize first background image */
  useEffect(() => {
    if (!projects[0]) return
    const img = new window.Image()
    img.onload = () => setFirstBgReady(true)
    img.onerror = () => setFirstBgReady(true)
    img.src = projects[0]
      ? getImageUrl({
          image: projects[0].coverList,
          breakpoint,
        })
      : ""
  }, [])

  return (
    <div
      ref={wrapRef}
      className={cn(
        "max-md:overflow-x-clip max-md:touch-pan-y",
        "transition-opacity duration-500 ease-out",
        !show && "opacity-0 pointer-events-none",
      )}
    >
      {/* BACKGROUNDS */}
      <div className="relative z-10">
        {projects.map((p, i) => (
          <section
            key={p._id}
            className="relative w-full h-lvh shrink-0"
            ref={(el) => {
              sectionsRefs.current[i] = el
            }}
            style={{ zIndex: i + 10 }}
          >
            <Link
              href={`/projects/${p.slug?.current ?? ""}`}
              onClick={(e) => handleProjectClick(e, i, p.slug?.current ?? "")}
            >
              <div
                ref={(el) => {
                  bgRefs.current[i] = el
                }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  willChange: "background-position",
                  backgroundImage: `url(${getImageUrl({
                    image: p.coverList,
                    breakpoint,
                  })})`,
                }}
              />
            </Link>
          </section>
        ))}
      </div>

      {/* THUMBS + TITLES + YEARS */}
      <div className="fixed top-0 left-0 w-full h-lvh z-20 pointer-events-none">
        {projects.map((p, i) => (
          <div key={`overlay-${p._id}`}>
            {/* THUMB */}
            <div
              className={cn(
                "absolute top-1/2 left-1/2 md:left-[7vw] -translate-y-1/2 -translate-x-1/2 md:translate-x-0",
                "w-[70vw] max-md:landscape:w-[50vw] md:w-[50vw] lg:w-[35vw]",
              )}
              ref={(el) => {
                thumbWrapRefs.current[i] = el
              }}
            >
              <div
                ref={(el) => {
                  thumbClipRefs.current[i] = el
                }}
                className="relative aspect-4/3 overflow-hidden w-full"
                style={{ willChange: "clip-path" }}
              >
                <Image
                  image={p.coverDetail}
                  resizeId="cover-detail"
                  fill
                  fit="cover"
                  priority={i < 2}
                  onLoad={i === 0 ? () => setFirstThumbReady(true) : undefined}
                />
              </div>
            </div>

            {/* TITLE */}
            <div className="absolute overflow-hidden top-1/2 -translate-y-1/2 left-[14px] md:left-[calc(50%)] z-20">
              <h1>
                {(p.title ?? "").split("").map((char, j) => (
                  <span
                    key={`${p._id}-${j}`}
                    className="inline-block type-h1 leading-none text-white"
                    ref={(el) => {
                      if (!wordsRefs.current[i]) wordsRefs.current[i] = []
                      wordsRefs.current[i][j] = el
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
            </div>

            {/* YEAR */}
            <div className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px] z-20">
              <span className="flex overflow-hidden">
                <span
                  className="type-caption text-white"
                  ref={(el) => {
                    yearsRefs.current[i] = el
                  }}
                >
                  {p.year}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SCROLL INDICATOR */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <ScrollIndicator />
      </div>
    </div>
  )
}
