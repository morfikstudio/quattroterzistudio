"use client"

import { useLayoutEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { useBreakpoint } from "@/stores/breakpointStore"
import { cn } from "@/utils/classNames"
import { getImageUrl } from "@/utils/media"

import { useLenis, useAnimationKey } from "@/components/LenisProvider"
import Image from "@/components/ui/Image"

gsap.registerPlugin(ScrollTrigger)

type NextProjectTeaserProps = {
  nextProject: NonNullable<PROJECT_QUERY_RESULT>["nextProject"]
}

const tweenTo = (el: HTMLElement, vars: gsap.TweenVars): Promise<void> => {
  return new Promise((resolve) => gsap.to(el, { ...vars, onComplete: resolve }))
}

const killTween = (tween: gsap.core.Tween | null) => {
  if (tween) {
    tween.kill()
    tween = null
  }
}

export default function NextProjectTeaser({
  nextProject,
}: NextProjectTeaserProps) {
  const { current: breakpoint } = useBreakpoint()

  const router = useRouter()
  const lenis = useLenis()
  const animationKey = useAnimationKey()

  const [state, setState] = useState<"idle" | "loading" | "navigating">("idle")

  const stateRef = useRef(state)
  stateRef.current = state

  const wrapRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  const textTween = useRef<gsap.core.Tween>(null)
  const thumbTween = useRef<gsap.core.Tween>(null)

  const abortRef = useRef<AbortController | null>(null)

  const isDesktop = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      window?.innerWidth / window?.innerHeight >= 1.35 && // 4:3 ratio
      breakpoint?.startsWith("desktop")
    )
  }, [breakpoint])

  const finalTransition = useCallback(async () => {
    if (
      !nextProject ||
      !router ||
      !lenis ||
      !thumbRef.current ||
      stateRef.current !== "navigating"
    ) {
      return
    }

    if (!isDesktop) {
      router.push(`/projects/${nextProject?.slug?.current ?? ""}`)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    lenis.stop()

    gsap.killTweensOf(thumbRef.current)

    if (thumbTween.current) {
      thumbTween.current.kill()
      thumbTween.current = null
    }

    const el = thumbRef.current!
    const parentEl = el.parentElement
    const rect = el.getBoundingClientRect()
    const parentRect = parentEl?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    }

    /**
     * Clear Tailwind's CSS transform variables before GSAP reads them,
     * so they don't get baked into the inline transform string
     */
    el.style.setProperty("--tw-translate-x", "0px")
    el.style.setProperty("--tw-translate-y", "0px")

    /* Set thumb initial position */
    gsap.set(el, {
      top: rect.top - parentRect.top,
      left: rect.left - parentRect.left,
      width: rect.width,
    })

    await tweenTo(el, {
      top: 0,
      left: 0,
      width: "100%",
      overwrite: true,
      duration: 1.5,
      ease: "power3.out",
    })

    /* Navigate to the next project */
    if (!signal.aborted) {
      router.push(`/projects/${nextProject?.slug?.current ?? ""}`)
    }
  }, [nextProject, router, lenis, isDesktop])

  const scrollTransition = useCallback(() => {
    if (!lenis || !wrapRef.current) return

    setState("navigating")

    const hasReachedBottom = lenis.scroll === lenis.limit

    if (hasReachedBottom) {
      requestAnimationFrame(finalTransition)
    } else {
      lenis.scrollTo(wrapRef.current, {
        offset: 0,
        duration: 1,
        force: true,
        lock: true,
        onComplete: () => {
          finalTransition()
        },
      })
    }
  }, [lenis, finalTransition])

  const enterTransition = useCallback(() => {
    if (
      !maskRef.current ||
      !thumbRef.current ||
      stateRef.current === "navigating"
    )
      return

    setState("loading")

    gsap.killTweensOf(maskRef.current)
    killTween(textTween.current)
    gsap.set(maskRef.current, { backgroundSize: "0% 100%" })

    textTween.current = gsap.to(maskRef.current, {
      backgroundSize: "100% 100%",
      duration: 2.5,
      ease: "power3.out",
      onComplete: scrollTransition,
    })

    gsap.killTweensOf(thumbRef.current)
    killTween(thumbTween.current)
    gsap.set(thumbRef.current, { opacity: 0 })

    thumbTween.current = gsap.to(thumbRef.current, {
      opacity: 1,
      duration: 2,
      ease: "power3.out",
    })
  }, [scrollTransition])

  const rollbackTransition = useCallback(() => {
    if (
      !maskRef.current ||
      !thumbRef.current ||
      stateRef.current === "navigating"
    )
      return

    setState("idle")

    gsap.killTweensOf(maskRef.current)
    killTween(textTween.current)

    textTween.current = gsap.to(maskRef.current, {
      backgroundSize: "0% 100%",
      duration: 0.4,
      ease: "power2.in",
    })

    gsap.killTweensOf(thumbRef.current)
    killTween(thumbTween.current)

    thumbTween.current = gsap.to(thumbRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    })
  }, [])

  useLayoutEffect(() => {
    if (!lenis || !wrapRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      if (bgRef.current) {
        const bp = window.innerHeight * 0.2 // parallax amount

        gsap.fromTo(
          bgRef.current,
          { backgroundPosition: `50% ${-bp}px` },
          {
            backgroundPosition: `50% ${bp}px`,
            ease: "none",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top 50%",
        invalidateOnRefresh: true,
        onEnter: enterTransition,
        onLeaveBack: rollbackTransition,
      })
    }, wrapRef)

    return () => {
      ctx.revert()
      killTween(textTween.current)
      killTween(thumbTween.current)
      const targets = [
        wrapRef.current,
        maskRef.current,
        thumbRef.current,
      ].filter(Boolean) as HTMLElement[]
      if (targets.length) gsap.set(targets, { clearProps: "all" })
      setState("idle")
      abortRef.current?.abort()
      abortRef.current = null
      lenis.start()
    }
  }, [lenis, animationKey])

  return nextProject ? (
    <div ref={wrapRef}>
      <div className="relative w-full h-lvh overflow-hidden">
        {/* COVER */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            willChange: "background-position",
            backgroundImage: `url(${getImageUrl({
              image: nextProject?.coverList,
              breakpoint,
            })})`,
          }}
        />

        {/* THUMB */}
        <div
          ref={thumbRef}
          className={cn(
            "absolute top-1/2 left-1/2 md:left-[7vw]",
            "-translate-y-1/2 -translate-x-1/2 md:translate-x-0",
            "w-[70vw] max-md:landscape:w-[50vw] md:w-[50vw] lg:w-[35vw]",
            "aspect-4/3 overflow-hidden",
            "opacity-0",
          )}
        >
          <Image
            image={nextProject?.coverDetail}
            resizeId="cover-detail"
            fill
            fit="cover"
          />
        </div>

        {/* TITLE */}
        <div
          className={cn(
            "absolute",
            "top-1/2 -translate-y-1/2 left-[14px] md:left-[calc(50%)]",
            "-translate-y-[calc(50%-4px)] md:-translate-y-[calc(50%-6px)]",
          )}
        >
          <div className="type-h1 leading-none text-white opacity-[0.35]">
            {nextProject?.title ?? ""}
          </div>
          <div
            ref={maskRef}
            aria-hidden="true"
            style={{ WebkitBackgroundClip: "text" }}
            className={cn(
              "absolute inset-0 type-h1 leading-none",
              "bg-clip-text text-transparent bg-size-[0%_100%] bg-no-repeat",
              "bg-[linear-gradient(to_right,white_100%,white_100%)]",
            )}
          >
            {nextProject?.title ?? ""}
          </div>
        </div>

        {/* YEAR */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px]">
          <span className="flex overflow-hidden">
            <span className="type-caption text-white">{nextProject?.year}</span>
          </span>
        </div>
      </div>
    </div>
  ) : null
}
