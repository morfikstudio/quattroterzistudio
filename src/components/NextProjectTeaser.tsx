"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"

import { cn } from "@/utils/classNames"
import type { PROJECT_QUERY_RESULT } from "@/sanity/types"

import Image from "@/components/ui/Image"
import { useLenis } from "@/components/LenisProvider"

const ENTER_THRESHOLD = 0.7
const LOAD_DURATION = 2
const SCROLL_DURATION = 1

type NextProjectTeaserProps = {
  nextProject: NonNullable<PROJECT_QUERY_RESULT>["nextProject"]
}

export default function NextProjectTeaser({
  nextProject,
}: NextProjectTeaserProps) {
  const router = useRouter()
  const lenis = useLenis()

  const [state, setState] = useState<"idle" | "loading" | "navigating">("idle")
  const [inView, setInView] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const href = useMemo(
    () => `/projects/${nextProject?.slug?.current ?? ""}`,
    [nextProject],
  )

  const stopLoadingAnimation = useCallback(() => {
    if (tl.current) {
      tl.current.kill()
      tl.current = null
    }

    gsap.killTweensOf(maskRef.current)
    gsap.to(maskRef.current, {
      backgroundSize: "0% 100%",
      opacity: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => setState("idle"),
    })
  }, [])

  const thumbExitAnimation = useCallback((): Promise<void> => {
    if (!thumbRef.current) return Promise.resolve()

    const el = thumbRef.current
    const parentEl = el.parentElement
    const rect = el.getBoundingClientRect()
    const parentRect = parentEl?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    }
    // clear Tailwind's CSS transform variables before GSAP reads them,
    // so they don't get baked into the inline transform string
    el.style.setProperty("--tw-translate-x", "0px")
    el.style.setProperty("--tw-translate-y", "0px")

    return new Promise((res) => {
      gsap.fromTo(
        el,
        {
          top: rect.top - parentRect.top,
          left: rect.left - parentRect.left,
          width: rect.width,
        },
        {
          top: 0,
          left: 0,
          width: "100%",
          overwrite: true,
          duration: 1,
          ease: "expo.out",
          onComplete: res,
        },
      )
    })
  }, [])

  const navigateOutside = useCallback(() => {
    if (lenis && wrapRef.current) {
      setState("navigating")

      // // disable user scroll
      // lenis.stop()

      lenis.scrollTo(wrapRef.current, {
        offset: 0,
        duration: SCROLL_DURATION,
        force: true,
        lock: true,
        onComplete: () => {
          thumbExitAnimation().then(() => {
            lenis.start()
            router.push(href)
          })
        },
      })
    }
  }, [lenis, router, href])

  // IntersectionObserver
  useEffect(() => {
    if (!wrapRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return

        const ratio = entry.intersectionRatio

        const isInView = entry.isIntersecting && ratio >= ENTER_THRESHOLD
        setInView(isInView)

        if (isInView) {
          setState((s) => (s === "navigating" ? s : "loading"))
        } else {
          stopLoadingAnimation()
        }
      },
      { threshold: [ENTER_THRESHOLD, 1] },
    )

    observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [stopLoadingAnimation])

  /**
   * When entering ENTER_THRESHOLD
   * 1) Start loading animation
   * 2) Scroll to top when complete
   * 3) Navigate to next project
   */
  useLayoutEffect(() => {
    if (!inView || !maskRef.current || state !== "loading") return
    if (tl.current) return

    tl.current = gsap
      .timeline({
        onComplete: () => {
          tl.current = null
          navigateOutside()
        },
      })
      .fromTo(
        maskRef.current,
        { backgroundSize: "0% 100%", opacity: 1 },
        {
          backgroundSize: "100% 100%",
          duration: LOAD_DURATION,
          ease: "power4.inOut",
        },
      )

    return () => {
      if (tl.current) {
        tl.current.kill()
        tl.current = null
      }
    }
  }, [inView, state])

  return nextProject ? (
    <div ref={wrapRef}>
      <div className="relative w-full h-svh overflow-hidden text-white">
        {/* COVER */}
        <Image
          image={nextProject?.coverList}
          resizeId="default"
          fill
          fit="cover"
          sizes="100vw"
        />

        {/* TITLE */}
        <div
          className={cn(
            "absolute",
            "top-1/2 -translate-y-1/2 left-[14px] md:left-[calc(50%)]",
          )}
        >
          <div className="text-5xl md:text-7xl leading-tight opacity-[0.35]">
            {nextProject?.title ?? ""}
          </div>
          <div
            ref={maskRef}
            aria-hidden="true"
            style={{ WebkitBackgroundClip: "text" }}
            className={cn(
              "absolute inset-0 text-5xl md:text-7xl leading-tight",
              "bg-clip-text text-transparent bg-size-[0%_100%] bg-no-repeat",
              "bg-[linear-gradient(to_right,white_100%,white_100%)]",
            )}
          >
            {nextProject?.title ?? ""}
          </div>
        </div>

        {/* YEAR */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px]">
          <span className="flex leading-[1.2] text-sm overflow-hidden">
            <span>{nextProject?.year}</span>
          </span>
        </div>

        {/* THUMB */}
        <div
          ref={thumbRef}
          className={cn(
            "absolute top-1/2 left-1/2 md:left-[7vw]",
            "-translate-y-1/2 -translate-x-1/2 md:translate-x-0",
            "w-[70vw] md:w-[50vw] lg:w-[35vw]",
          )}
        >
          <Image
            image={nextProject?.coverDetail}
            resizeId="cover-detail"
            className="w-full"
          />
        </div>
      </div>
    </div>
  ) : null
}
