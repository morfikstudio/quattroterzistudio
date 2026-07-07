"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { getImageUrl } from "@/utils/media"
import { cn } from "@/utils/classNames"

import { useBreakpoint } from "@/stores/breakpointStore"
import { useNavigationStore } from "@/stores/navigationStore"
import { usePointerCoarse } from "@/hooks/usePointerCoarse"

import { useLenis } from "@/components/LenisProvider"
import { dispatchCurtainNavigate } from "@/components/CurtainTransition"
import ScrollIndicator from "@/components/ScrollIndicator"
import Image from "@/components/ui/Image"
import ViewToggle from "@/components/ViewToggle"
import { signalSplashContentReady } from "@/components/SplashMarquee"

type ProjectsScrollProps = {
  projects: PROJECTS_QUERY_RESULT
}

gsap.registerPlugin(ScrollTrigger)

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function projectTitleId(project: PROJECTS_QUERY_RESULT[number]) {
  return `project-${project._id}-title`
}

export default function ProjectsScroll({ projects }: ProjectsScrollProps) {
  const router = useRouter()
  const lenis = useLenis()
  const { current: breakpoint } = useBreakpoint()
  const coarsePointer = usePointerCoarse()
  const setPreviousPath = useNavigationStore((s) => s.setPreviousPath)
  const setPendingActiveSlug = useNavigationStore((s) => s.setPendingActiveSlug)

  const [firstBgReady, setFirstBgReady] = useState(false)
  const [firstThumbReady, setFirstThumbReady] = useState(false)
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const sectionsRefs = useRef<(HTMLElement | null)[]>([])
  const bgRefs = useRef<(HTMLDivElement | null)[]>([])
  const thumbWrapRefs = useRef<(HTMLDivElement | null)[]>([]) // Outer thumb wrapper controls stacking order (z-index) across sections.
  const thumbClipRefs = useRef<(HTMLDivElement | null)[]>([]) // Inner thumb (overflow-hidden) receives clip-path animations.
  const thumbInnerRefs = useRef<(HTMLDivElement | null)[]>([]) // Inner media layer receives hover scale and is reset before route transition.
  const wordsRefs = useRef<(HTMLSpanElement | null)[][]>([])
  const squaresRefs = useRef<(HTMLSpanElement | null)[]>([])
  const yearsRefs = useRef<(HTMLSpanElement | null)[]>([])
  const counterRef = useRef<HTMLSpanElement | null>(null)
  const copyGroupRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeSectionIndexRef = useRef(0)
  const fixedLayerRef = useRef<HTMLDivElement | null>(null)
  const scrollIndicatorWrapRef = useRef<HTMLDivElement | null>(null)
  const listCTAWrapRef = useRef<HTMLDivElement | null>(null)

  const transitioningRef = useRef(false)
  const transitionTweenRef = useRef<gsap.core.Tween | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const isSnappedRef = useRef(true) // true when scroll is fully at rest (user + snap animation)
  const isRevealingRef = useRef(false) // true during splash reveal thumb animation
  const fromArchiveRef = useRef(
    typeof window !== "undefined" &&
      useNavigationStore.getState().previousPath === "/archive",
  )
  // True when mounted straight from the splash (/ → /projects). Captured once
  // so it stays stable even if previousPath changes later.
  const fromSplashRef = useRef(
    typeof window !== "undefined" &&
      useNavigationStore.getState().previousPath === "/",
  )
  const revealPlayedRef = useRef(false)

  /** Scroll-driven thumb index (decoupled reveal animation from scroll scrub). */
  const lastThumbScrollIndexRef = useRef(0)
  const thumbRevealTweenRef = useRef<gsap.core.Tween | null>(null)
  const thumbSyncDuringRefreshRef = useRef(false)

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
    // Only react to width changes (ignore mobile browser-bar height shifts).
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
    async (index: number, url: string) => {
      if (transitioningRef.current || !lenis) return
      transitioningRef.current = true

      if (!isDesktop) {
        setPreviousPath(window.location.pathname)
        if (!isSnappedRef.current && wrapRef.current) {
          const sectionEl = sectionsRefs.current[index]
          const targetY =
            sectionEl != null
              ? Math.round(
                  sectionEl.getBoundingClientRect().top + window.scrollY,
                )
              : wrapRef.current.offsetTop + index * window.innerHeight
          lenis.scrollTo(targetY, {
            duration: 0.3,
            onComplete: () => dispatchCurtainNavigate(url),
          })
        } else {
          dispatchCurtainNavigate(url)
        }
        return
      }

      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const { signal } = abortRef.current

      const el = thumbWrapRefs.current[index]
      const clipEl = thumbClipRefs.current[index]
      const innerEl = thumbInnerRefs.current[index]

      if (!el || !clipEl || !innerEl) {
        transitioningRef.current = false
        return
      }

      setIsRouteTransitioning(true)

      gsap.killTweensOf(el)
      transitionTweenRef.current?.kill()
      transitionTweenRef.current = null
      thumbRevealTweenRef.current?.kill()
      thumbRevealTweenRef.current = null

      const doTransition = async () => {
        let previousInlineTransition = ""
        let didNavigate = false
        try {
          if (signal.aborted) return

          lenis.stop()

          previousInlineTransition = innerEl.style.transition

          // Reset scale immediately (no transition) so the transition starts
          // from unscaled media, matching the destination hero.
          innerEl.style.transition = "none"
          gsap.killTweensOf(innerEl)
          gsap.set(innerEl, { scale: 1, overwrite: true })
          innerEl.getBoundingClientRect()

          const rect = el.getBoundingClientRect()

          el.style.setProperty("--tw-translate-x", "0px")
          el.style.setProperty("--tw-translate-y", "0px")

          gsap.set(clipEl, { clipPath: "none" })

          // Raise the layer + thumbs container so the expanding thumb paints
          // above titles, counter and CTA.
          if (fixedLayerRef.current) {
            gsap.set(fixedLayerRef.current, { zIndex: 100 })
          }
          const thumbsContainer = el.parentElement
          if (thumbsContainer) {
            gsap.set(thumbsContainer, { zIndex: 20 })
          }

          gsap.set(el, {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            zIndex: 100,
            overwrite: true,
          })

          // Letters-out (title/year/square/counter) + CTA/indicator fade,
          // queued on the same tick as the thumb expansion.
          const activeLetters = wordsRefs.current[index]?.filter(Boolean) ?? []
          const activeYear = yearsRefs.current[index]
          const activeSquare = squaresRefs.current[index]
          const lettersOutTargets = [
            ...activeLetters,
            ...(activeYear ? [activeYear] : []),
            ...(activeSquare ? [activeSquare] : []),
            ...(counterRef.current ? [counterRef.current] : []),
          ]
          if (lettersOutTargets.length) {
            gsap.to(lettersOutTargets, {
              y: "-110%",
              duration: 0.7,
              ease: "power3.in",
              overwrite: true,
            })
          }

          const fadeOutTargets = [
            listCTAWrapRef.current,
            scrollIndicatorWrapRef.current,
          ].filter(Boolean) as HTMLElement[]
          if (fadeOutTargets.length) {
            gsap.to(fadeOutTargets, {
              y: -20,
              opacity: 0,
              duration: 0.7,
              ease: "power3.in",
              overwrite: true,
            })
          }

          try {
            await new Promise<void>((resolve) => {
              transitionTweenRef.current = gsap.to(el, {
                top: 0,
                left: 0,
                width: "100%",
                overwrite: true,
                duration: 1.5,
                ease: "power3.out",
                onComplete: resolve,
              })
            })

            if (!signal.aborted) {
              didNavigate = true
              setPreviousPath(window.location.pathname)
              router.push(url)
            }
          } finally {
            innerEl.style.transition = previousInlineTransition
            transitionTweenRef.current = null
          }
        } finally {
          if (!didNavigate) {
            setIsRouteTransitioning(false)
          }
        }
      }

      if (!isSnappedRef.current && wrapRef.current) {
        const targetY = wrapRef.current.offsetTop + index * window.innerHeight
        lenis.scrollTo(targetY, {
          duration: 0.3,
          onComplete: () => doTransition(),
        })
      } else {
        doTransition()
      }
    },
    [lenis, router, isDesktop, setPreviousPath],
  )

  const show = useMemo(
    () => firstBgReady && firstThumbReady,
    [firstBgReady, firstThumbReady],
  )

  // Tell the splash the first view is ready so its exit dissolve can start
  // without revealing a blank frame.
  useEffect(() => {
    if (show) signalSplashContentReady()
  }, [show])

  /* Clip-path entrance when coming from /archive — hide before first paint */
  useIsomorphicLayoutEffect(() => {
    if (!fromArchiveRef.current || !wrapRef.current) return
    gsap.set(wrapRef.current, { clipPath: "inset(0% 0% 100% 0%)" })
  }, [])

  /* Clip-path entrance when coming from /archive — animate in */
  useEffect(() => {
    if (!fromArchiveRef.current || !wrapRef.current) return
    fromArchiveRef.current = false

    gsap.to(wrapRef.current, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 2,
      ease: "power3.inOut",
    })
  }, [])

  useEffect(() => {
    if (!breakpoint || projects.length === 0 || !wrapRef.current) return

    let textTl: gsap.core.Timeline | null = null
    let onRefreshInit: (() => void) | null = null
    let onRefreshComplete: (() => void) | null = null

    const ctx = gsap.context(() => {
      let activeIndex = 0
      let targetIndex = 0
      const parallaxConfig = coarsePointer
        ? { parallaxFactor: 0.2, bgScale: 1.025 }
        : { parallaxFactor: 0.5, bgScale: 1 }

      // overall progress of each section
      const sectionProgresses = Array.from({ length: projects.length }, () => 0)

      // Default text positions: 0% active, -110% past, 110% future.
      function applyTextCanonicalState(activeIdx: number) {
        for (let i = 0; i < projects.length; i++) {
          const letters = wordsRefs.current[i]?.filter(Boolean) ?? []
          const year = yearsRefs.current[i]
          const square = squaresRefs.current[i]
          const y = i < activeIdx ? "-110%" : i === activeIdx ? "0%" : "110%"
          if (letters.length) gsap.set(letters, { y })
          if (year) gsap.set(year, { y })
          if (square) gsap.set(square, { y })
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
        const allSquares = squaresRefs.current.filter(Boolean)
        gsap.killTweensOf(allLetters)
        gsap.killTweensOf(allYears)
        gsap.killTweensOf(allSquares)

        /* Set the target index */
        targetIndex = nextIndex

        const lettersOut = wordsRefs.current[activeIndex]?.filter(Boolean) ?? []
        const yearOut = yearsRefs.current[activeIndex]
        const squareOut = squaresRefs.current[activeIndex]
        const lettersIn = wordsRefs.current[nextIndex]?.filter(Boolean) ?? []
        const yearIn = yearsRefs.current[nextIndex]
        const squareIn = squaresRefs.current[nextIndex]

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

        if (lettersOut.length) {
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
        }

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

        if (squareOut) {
          tl.to(
            squareOut,
            {
              y: outgoingY,
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto",
            },
            0,
          )
        }

        if (lettersIn.length) tl.set(lettersIn, { y: incomingFromY }, 0)

        if (yearIn) {
          tl.set(yearIn, { y: incomingFromY }, 0)
        }

        if (squareIn) {
          tl.set(squareIn, { y: incomingFromY }, 0)
        }

        if (lettersIn.length) {
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
        }

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

        if (squareIn) {
          tl.to(
            squareIn,
            {
              y: "0%",
              duration: 0.45,
              ease: "expo.out",
              overwrite: "auto",
            },
            0.1,
          )
        }
      }

      function applyThumbStaticState(activeIdx: number) {
        if (isRevealingRef.current) return
        thumbRevealTweenRef.current?.kill()
        thumbRevealTweenRef.current = null
        for (let i = 0; i < projects.length; i++) {
          const thumbClip = thumbClipRefs.current[i]
          const thumbWrap = thumbWrapRefs.current[i]
          if (!thumbClip || !thumbWrap) continue
          if (i === activeIdx) {
            gsap.set(thumbClip, { clipPath: "inset(0% 0% 0% 0%)" })
            gsap.set(thumbWrap, { zIndex: 2 })
          } else {
            gsap.set(thumbClip, { clipPath: "inset(100% 0% 0% 0%)" })
            gsap.set(thumbWrap, { zIndex: 0 })
          }
        }
        lastThumbScrollIndexRef.current = activeIdx
      }

      function commitThumbReveal(nextIndex: number) {
        if (isRevealingRef.current) return

        if (thumbSyncDuringRefreshRef.current) {
          applyThumbStaticState(nextIndex)
          return
        }

        if (nextIndex === lastThumbScrollIndexRef.current) {
          return
        }

        thumbRevealTweenRef.current?.kill()
        thumbRevealTweenRef.current = null

        const prevIdx = lastThumbScrollIndexRef.current
        lastThumbScrollIndexRef.current = nextIndex

        /* Down = reveal from bottom (wipe verso l'alto); up = reveal from top (wipe verso il basso). */
        const goingDown = nextIndex > prevIdx
        const incomingHiddenClip = goingDown
          ? "inset(100% 0% 0% 0%)"
          : "inset(0% 0% 100% 0%)"

        for (let i = 0; i < projects.length; i++) {
          const thumbClip = thumbClipRefs.current[i]
          const thumbWrap = thumbWrapRefs.current[i]
          if (!thumbClip || !thumbWrap) continue

          if (i === nextIndex) {
            gsap.set(thumbWrap, { zIndex: 2 })
            gsap.set(thumbClip, { clipPath: incomingHiddenClip })
          } else if (i === prevIdx) {
            gsap.set(thumbWrap, { zIndex: 1 })
            gsap.set(thumbClip, { clipPath: "inset(0% 0% 0% 0%)" })
          } else {
            gsap.set(thumbWrap, { zIndex: 0 })
            gsap.set(thumbClip, { clipPath: "inset(100% 0% 0% 0%)" })
          }
        }

        const incomingClip = thumbClipRefs.current[nextIndex]
        if (!incomingClip) return

        thumbRevealTweenRef.current = gsap.to(incomingClip, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.55,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          onComplete: () => {
            thumbRevealTweenRef.current = null
            for (let i = 0; i < projects.length; i++) {
              if (i === nextIndex) continue
              const c = thumbClipRefs.current[i]
              const w = thumbWrapRefs.current[i]
              if (!c || !w) continue
              gsap.set(c, { clipPath: "inset(100% 0% 0% 0%)" })
              gsap.set(w, { zIndex: 0 })
            }
            const wActive = thumbWrapRefs.current[nextIndex]
            if (wActive) gsap.set(wActive, { zIndex: 2 })
          },
        })
      }

      function getActiveIndexFromProgress() {
        for (let i = projects.length - 1; i >= 0; i--) {
          if (sectionProgresses[i] > 0) return i
        }
        return 0
      }

      const syncFromProgress = () => {
        const nextIndex = getActiveIndexFromProgress()
        activeSectionIndexRef.current = nextIndex

        // Update fixed counter text
        if (counterRef.current) {
          counterRef.current.textContent = `${String(nextIndex + 1).padStart(2, "0")}-${String(projects.length).padStart(2, "0")}`
        }

        for (let i = 0; i < projects.length; i++) {
          const group = copyGroupRefs.current[i]
          if (group) {
            group.style.zIndex = i === nextIndex ? "30" : "0"
          }

          const thumbWrap = thumbWrapRefs.current[i]
          if (thumbWrap) {
            const isActive = i === nextIndex
            thumbWrap.setAttribute("data-active", isActive ? "true" : "false")
            thumbWrap.tabIndex = isActive ? 0 : -1
            thumbWrap.setAttribute("aria-hidden", isActive ? "false" : "true")
          }
        }

        commitThumbReveal(nextIndex)
        handleTexts(nextIndex)
      }

      sectionsRefs.current.forEach((s, i) => {
        const bg = bgRefs.current[i]
        const { innerHeight: wh } = window
        const parallaxOffset = wh * parallaxConfig.parallaxFactor

        if (!s || !bg) return

        const isFirst = i === 0

        gsap.set(bg, {
          scale: parallaxConfig.bgScale,
          transformOrigin: "50% 50%",
        })

        /* Background parallax */
        gsap.fromTo(
          bg,
          {
            backgroundPosition: () =>
              isFirst ? "50% 0px" : `50% ${-parallaxOffset}px`,
          },
          {
            backgroundPosition: () => `50% ${parallaxOffset}px`,
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

      /* Sections snap — skipped on coarse pointers (mobile/tablet). */
      if (projects.length > 1 && !coarsePointer) {
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
      applyThumbStaticState(0)

      onRefreshInit = () => {
        thumbSyncDuringRefreshRef.current = true
        syncFromProgress()
      }
      onRefreshComplete = () => {
        syncFromProgress()
        thumbSyncDuringRefreshRef.current = false
      }
      ScrollTrigger.addEventListener("refreshInit", onRefreshInit)
      ScrollTrigger.addEventListener("refresh", onRefreshComplete)
      syncFromProgress()
    }, wrapRef)

    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)

      if (raf.current !== null) {
        window.cancelAnimationFrame(raf.current)
      }

      if (onRefreshInit) {
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit)
      }
      if (onRefreshComplete) {
        ScrollTrigger.removeEventListener("refresh", onRefreshComplete)
      }

      thumbRevealTweenRef.current?.kill()
      thumbRevealTweenRef.current = null

      abortRef.current?.abort()
      abortRef.current = null
      transitionTweenRef.current?.kill()
      transitionTweenRef.current = null
      setIsRouteTransitioning(false)

      ctx.revert()
      lenis?.start()
    }
  }, [breakpoint, coarsePointer, projects, lenis])

  /* isSnappedRef: true when scroll is fully at rest (user + snap animation) */
  useEffect(() => {
    if (!lenis) return

    const handleScroll = () => {
      isSnappedRef.current = false
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current)
      }
      scrollDebounceRef.current = setTimeout(() => {
        isSnappedRef.current = true
      }, 50)
    }

    lenis.on("scroll", handleScroll)
    return () => {
      lenis.off("scroll", handleScroll)
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current)
      }
    }
  }, [lenis])

  // Splash reveal: scale the bg in and clip-reveal the thumb. Runs only when
  // arriving from "/" and `show` is true (images loaded, wrapper visible).
  useEffect(() => {
    if (!show || !fromSplashRef.current || revealPlayedRef.current) return
    revealPlayedRef.current = true

    const firstBg = bgRefs.current[0]
    const firstThumbClip = thumbClipRefs.current[0]
    const firstLetters = wordsRefs.current[0]?.filter(Boolean) ?? []
    const firstYear = yearsRefs.current[0]
    const firstCounter = counterRef.current
    const firstSquare = squaresRefs.current[0]

    if (firstBg) {
      gsap.fromTo(
        firstBg,
        { scale: 1.5 },
        { scale: 1, duration: 2.8, ease: "expo.out" },
      )
    }

    if (firstThumbClip) {
      isRevealingRef.current = true
      gsap.set(firstThumbClip, { clipPath: "inset(100% 0% 0% 0%)" })
      gsap.to(firstThumbClip, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.55,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        delay: 0.4,
        onComplete: () => {
          isRevealingRef.current = false
        },
      })
    }

    // Stessa animazione "lettersIn" dello scroll — parte a metà del clip-path
    if (firstSquare) {
      gsap.set(firstSquare, { y: "110%" })
      gsap.to(firstSquare, {
        y: "0%",
        duration: 0.45,
        ease: "expo.out",
        delay: 0.9,
        overwrite: "auto",
      })
    }

    if (firstLetters.length) {
      gsap.set(firstLetters, { y: "110%" })
      gsap.to(firstLetters, {
        y: "0%",
        duration: 0.45,
        ease: "expo.out",
        stagger: 0.02,
        delay: 0.9,
        overwrite: "auto",
      })
    }

    if (firstYear) {
      gsap.set(firstYear, { y: "110%" })
      gsap.to(firstYear, {
        y: "0%",
        duration: 0.7,
        ease: "expo.out",
        delay: 1.2,
        overwrite: "auto",
      })
    }

    if (firstCounter) {
      gsap.set(firstCounter, { y: "110%" })
      gsap.to(firstCounter, {
        y: "0%",
        duration: 0.7,
        ease: "expo.out",
        delay: 1.2,
        overwrite: "auto",
      })
    }
  }, [show])

  const handleArchiveClick = useCallback(() => {
    if (transitioningRef.current || !lenis) return
    transitioningRef.current = true
    setIsRouteTransitioning(true)
    lenis.stop()

    const activeSlug =
      projects[activeSectionIndexRef.current]?.slug?.current ?? null
    setPendingActiveSlug(activeSlug)

    const wrap = wrapRef.current
    if (!wrap) {
      setPreviousPath(window.location.pathname)
      router.push("/archive")
      return
    }

    // Disable ScrollTriggers before the layout change: position:fixed shrinks
    // scroll height and an active trigger would recompute and break visually.
    ScrollTrigger.getAll().forEach((st) => st.disable(false))

    const scrollY = window.scrollY

    // Freeze the wrapper to the viewport; the transform makes it a containing
    // block so all fixed children clip together.
    gsap.set(wrap, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100dvh",
      overflow: "hidden",
      transform: "translate3d(0,0,0)",
      zIndex: 40,
    })

    // Offset background sections to preserve visual scroll position
    const bgContainer = wrap.children[0] as HTMLElement | null
    if (bgContainer && scrollY > 0) {
      gsap.set(bgContainer, { y: -scrollY })
    }

    gsap.fromTo(
      wrap,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.2,
        ease: "power3.inOut",
        onComplete: () => {
          setPreviousPath(window.location.pathname)
          router.push("/archive")
        },
      },
    )
  }, [router, lenis, setPreviousPath, setPendingActiveSlug, projects])

  /* Entry animation for the ListCTA (bottom-left archive button) */
  useEffect(() => {
    if (!show) return
    const el = listCTAWrapRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: fromSplashRef.current ? 1.3 : 0.3,
      },
    )
  }, [show])

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
        "overflow-x-clip max-md:touch-pan-y",
        "transition-opacity duration-500 ease-out",
        !show && "opacity-0",
        !show && "pointer-events-none",
      )}
    >
      {/* BACKGROUNDS */}
      <div className="relative z-10">
        {projects.map((p, i) => (
          <section
            key={p._id}
            className={cn(
              "relative w-full shrink-0 overflow-hidden",
              "md:h-dvh",
              "max-md:min-h-[calc(100dvh+env(safe-area-inset-bottom,0px)+2px)]",
            )}
            ref={(el) => {
              sectionsRefs.current[i] = el
            }}
            style={{ zIndex: i + 10 }}
            aria-labelledby={projectTitleId(p)}
          >
            <Link
              href={`/projects/${p.slug?.current ?? ""}`}
              className="absolute inset-0 z-0"
              onClick={(e) => {
                e.preventDefault()
                handleProjectClick(i, `/projects/${p.slug?.current ?? ""}`)
              }}
            >
              <div
                ref={(el) => {
                  bgRefs.current[i] = el
                }}
                className={cn(
                  "absolute bg-cover bg-center bg-no-repeat",
                  "max-md:inset-x-0 max-md:top-0 max-md:bottom-auto max-md:h-[calc(100%+3px)]",
                  "md:inset-0",
                )}
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

      <div
        ref={fixedLayerRef}
        className={cn(
          "fixed top-0 left-0 z-20 w-full pointer-events-none",
          "md:h-dvh",
          "max-md:min-h-[calc(100dvh+env(safe-area-inset-bottom,0px)+2px)]",
        )}
      >
        {/* THUMBS */}
        <div className="absolute inset-0 z-0 isolate pointer-events-none">
          {projects.map((p, i) => (
            <div
              key={`thumb-${p._id}`}
              role="button"
              tabIndex={-1}
              aria-label={
                p.title ? `Apri progetto ${p.title}` : "Apri progetto"
              }
              className={cn(
                "group absolute top-1/2 left-1/2 md:left-[7vw] -translate-y-1/2 -translate-x-1/2 md:translate-x-0",
                "w-[70vw] max-md:landscape:w-[50vw] md:w-[50vw] lg:w-[35vw]",
                "pointer-events-none cursor-pointer outline-none",
                "data-[active=true]:pointer-events-auto",
              )}
              ref={(el) => {
                thumbWrapRefs.current[i] = el
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleProjectClick(i, `/projects/${p.slug?.current ?? ""}`)
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return
                e.preventDefault()
                e.stopPropagation()
                handleProjectClick(i, `/projects/${p.slug?.current ?? ""}`)
              }}
            >
              <div
                ref={(el) => {
                  thumbClipRefs.current[i] = el
                }}
                className="relative aspect-4/3 overflow-hidden w-full"
                style={{
                  willChange: "clip-path",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                }}
              >
                <div
                  ref={(el) => {
                    thumbInnerRefs.current[i] = el
                  }}
                  className={cn(
                    "absolute -inset-px origin-center",
                    "transition-transform duration-500 ease-out motion-reduce:transition-none",
                    "group-hover:scale-110 group-focus-visible:scale-110",
                  )}
                  style={{ willChange: "transform" }}
                >
                  <Image
                    image={p.coverDetail}
                    resizeId="cover-thumb"
                    fill
                    fit="cover"
                    priority={i < 2}
                    onLoad={
                      i === 0 ? () => setFirstThumbReady(true) : undefined
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TITLES + YEARS */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {projects.map((p, i) => (
            <div
              key={`copy-${p._id}`}
              ref={(el) => {
                copyGroupRefs.current[i] = el
              }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 0 }}
              role="group"
              aria-label={p.title ?? undefined}
            >
              <div
                className="title-hover text-white absolute top-1/2 -translate-y-[calc(50%-4px)] md:-translate-y-[calc(50%-6px)] left-[14px] md:left-[calc(50%)] pointer-events-auto cursor-pointer flex items-center"
                id={projectTitleId(p)}
                data-route-transitioning={
                  isRouteTransitioning ? "true" : undefined
                }
                onMouseEnter={(e) => {
                  if (isRouteTransitioning) return
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  if (isRouteTransitioning) return
                  e.currentTarget.dataset.line = "out"
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.dataset.line = "out"
                  const idx = activeSectionIndexRef.current
                  const slug = projects[idx]?.slug?.current ?? ""
                  handleProjectClick(idx, `/projects/${slug}`)
                }}
              >
                {/* QUADRATINO — decommentare per riabilitare
                <span className="overflow-hidden block w-[10px] h-[10px] flex-shrink-0 mr-4 -translate-y-[5px]">
                  <span
                    ref={(el) => {
                      squaresRefs.current[i] = el
                    }}
                    className="block w-[10px] h-[10px] bg-white"
                  />
                </span>
                */}
                <div>
                  <h1 className="overflow-hidden">
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
                  <span className="link-underline-bar" />
                </div>
              </div>

              <a
                href={`/projects/${p.slug?.current ?? ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleProjectClick(i, `/projects/${p.slug?.current ?? ""}`)
                }}
                className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px] max-md:pointer-events-auto md:pointer-events-none cursor-pointer md:cursor-default no-underline text-inherit"
              >
                <span className="flex overflow-hidden">
                  <span
                    className="type-caption text-white"
                    ref={(el) => {
                      yearsRefs.current[i] = el
                    }}
                  >
                    <span className="md:hidden">View</span>
                    <span className="hidden md:inline">{p.year}</span>
                  </span>
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div
        ref={scrollIndicatorWrapRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <ScrollIndicator />
      </div>

      {/* VIEW TOGGLE (desktop) / ARCHIVE BUTTON (mobile) */}
      <div ref={listCTAWrapRef} className="fixed bottom-6 left-6 z-30 flex">
        <div className="md:hidden">
          <ListCTA onArchiveClick={handleArchiveClick} />
        </div>
        <div className="hidden md:block">
          <ViewToggle
            active="selected"
            variant="dark"
            onSelect={(target) => {
              if (target === "archive") handleArchiveClick()
            }}
          />
        </div>
      </div>

      {/* COUNTER */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-none overflow-hidden">
        <span className="flex overflow-hidden">
          <span ref={counterRef} className="type-caption text-white">
            {String(1).padStart(2, "0")}-
            {String(projects.length).padStart(2, "0")}
          </span>
        </span>
      </div>
    </div>
  )
}

function ListCTA({
  onArchiveClick,
}: {
  onArchiveClick: (e: React.MouseEvent) => void
}) {
  const Icons = useCallback(() => {
    return (
      <div className="flex flex-col items-center gap-[3px]">
        <span className={cn("flex w-[4px] h-[4px] bg-white")} />
        <span className={cn("flex w-[4px] h-[4px] bg-white")} />
      </div>
    )
  }, [])

  return (
    <button
      onClick={onArchiveClick}
      className="appearance-none bg-transparent p-0 border-0"
    >
      <div
        className={cn(
          "group",
          "relative",
          "h-[40px] w-[120px]",
          "border border-white",
          "flex items-center justify-center",
          "px-4",
        )}
      >
        <div
          className={cn(
            "relative",
            "h-full w-full",
            "flex items-center justify-center",
          )}
        >
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "inline-flex items-center gap-[10px]",
            )}
          >
            <div
              className={cn(
                "translate-x-0",
                "group-hover:-translate-x-1 group-hover:opacity-0",
                "transition-all duration-200 ease-in-out",
              )}
            >
              <Icons />
            </div>

            <div
              className={cn(
                "translate-x-0",
                "group-hover:-translate-x-[19px]",
                "transition-transform duration-400 ease-out",
              )}
            >
              <span className="type-button-m uppercase text-white">
                Archive
              </span>
            </div>
          </div>

          <div
            className={cn(
              "absolute top-1/2 right-1 -translate-y-1/2 translate-x-1",
              "opacity-0",
              "group-hover:translate-x-0 group-hover:opacity-100",
              "transition-all duration-200 ease-in-out",
            )}
          >
            <Icons />
          </div>
        </div>
      </div>
    </button>
  )
}
