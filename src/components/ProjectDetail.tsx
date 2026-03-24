"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react"
import { PortableText } from "next-sanity"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { components as portableTextComponents } from "@/sanity/portableTextComponents"
import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { getMediaLayoutByVariant } from "@/constants/projectMediaVariants"
import { cn } from "@/utils/classNames"

import { useBreakpoint } from "@/stores/breakpointStore"

import { useLenis } from "@/components/LenisProvider"
import Image from "@/components/ui/Image"
import ScrollIndicator from "@/components/ScrollIndicator"

gsap.registerPlugin([SplitText, ScrollTrigger])

type ProjectProps = {
  coverDetail: NonNullable<PROJECT_QUERY_RESULT>["coverDetail"] | null
  title: NonNullable<PROJECT_QUERY_RESULT>["title"] | null
  year: NonNullable<PROJECT_QUERY_RESULT>["year"] | null
  client: NonNullable<PROJECT_QUERY_RESULT>["client"] | null
  sector: NonNullable<PROJECT_QUERY_RESULT>["sector"] | null
  credits: NonNullable<PROJECT_QUERY_RESULT>["credits"] | null
  description: NonNullable<PROJECT_QUERY_RESULT>["description"] | null
  blocks: NonNullable<PROJECT_QUERY_RESULT>["blocks"] | null
  nextProject: NonNullable<PROJECT_QUERY_RESULT>["nextProject"]
}

export default function ProjectDetail({
  coverDetail,
  title,
  year,
  client,
  sector,
  credits,
  description,
  blocks,
  nextProject,
}: ProjectProps) {
  const { current: breakpoint } = useBreakpoint()

  const [coverReady, setCoverReady] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const contentsRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const raf = useRef<number | null>(null)

  const onResize = useCallback(() => {
    if (raf.current !== null) return
    raf.current = window.requestAnimationFrame(() => {
      raf.current = null
      ScrollTrigger.refresh()
    })
  }, [])

  const renderBlocks = useCallback(
    (blocks: NonNullable<PROJECT_QUERY_RESULT>["blocks"] | null) => {
      const commonStyles = "py-[50px] md:py-[80px]"

      return blocks?.map((block) => {
        switch (block._type) {
          case "projectMediaPayoff":
            return (
              <div
                key={block._key}
                className={cn(
                  commonStyles,
                  "type-display-l uppercase leading-none text-black",
                )}
                data-block-payoff
              >
                {block.payoff}
              </div>
            )
          case "projectMediaSingle":
            return (
              <div
                key={block._key}
                data-block-media
                className={cn(
                  commonStyles,
                  "grid w-full grid-cols-12 gap-[24px]",
                )}
              >
                <div
                  data-block-media-inner
                  className={cn(
                    "w-full min-w-0 overflow-hidden",
                    getMediaLayoutByVariant(block._type, block.variant),
                  )}
                >
                  <Image
                    image={block.image}
                    resizeId="media-block-single"
                    className="w-full"
                  />
                </div>
              </div>
            )
          default:
            return null
        }
      })
    },
    [blocks],
  )

  useLayoutEffect(() => {
    if (!coverReady) return

    /* Intro animations */
    const ctx = gsap.context(() => {
      const isPortrait = breakpoint === "mobile" || breakpoint === "tablet"

      /* animation properties */
      const contentStart = isPortrait ? "top 75%" : "top 75%"
      const blockStart = isPortrait ? "top 75%" : "top 60%"
      const duration = 0.7
      const stagger = 0.05
      const ease = "power3.out"

      /* Contents */
      if (contentsRef.current && descriptionRef.current) {
        const contentLines = Array.from([
          ...Array.from(
            contentsRef.current.querySelectorAll<HTMLElement>(
              "[data-split-content]",
            ) ?? [],
          ),
          ...Array.from(
            descriptionRef.current.querySelectorAll<HTMLElement>("p"),
          ),
        ])
          .filter(Boolean)
          .map((el) => new SplitText(el, { type: "lines", mask: "lines" }))
          .flatMap((s) => s.lines)

        gsap.killTweensOf(contentLines)
        gsap.set(contentLines, { yPercent: 110 })

        gsap.to(contentLines, {
          yPercent: 0,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: contentsRef.current,
            start: contentStart,
            invalidateOnRefresh: true,
          },
        })
      }

      /* Main */
      if (mainRef.current) {
        /* Media */
        const mediaEls = Array.from(
          mainRef.current.querySelectorAll<HTMLElement>("[data-block-media]") ??
            [],
        )

        mediaEls.forEach((wrapper) => {
          const inner = wrapper.querySelector<HTMLElement>(
            "[data-block-media-inner]",
          )
          const img = inner?.querySelector<HTMLImageElement>("img")
          if (!inner || !img) return

          gsap.killTweensOf([inner, img])
          gsap.set(inner, {
            opacity: 0,
            y: 48,
            clipPath: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
          })
          gsap.set(img, {
            scale: 1.5,
            transformOrigin: "center center",
          })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: wrapper,
                start: blockStart,
                invalidateOnRefresh: true,
              },
            })
            .to(
              inner,
              {
                opacity: 1,
                y: 0,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration,
                ease,
              },
              0,
            )
            .to(
              img,
              {
                scale: 1,
                duration: duration + 0.5,
                ease,
              },
              0,
            )
        })

        /* Payoffs */
        const payOffEls = Array.from(
          mainRef.current.querySelectorAll<HTMLElement>(
            "[data-block-payoff]",
          ) ?? [],
        )

        payOffEls.forEach((el) => {
          const payoffLines = Array.from([el])
            .filter(Boolean)
            .map((el) => new SplitText(el, { type: "lines", mask: "lines" }))
            .flatMap((s) => s.lines)

          gsap.killTweensOf(payoffLines)
          gsap.set(payoffLines, { yPercent: 110 })

          gsap.to(payoffLines, {
            yPercent: 0,
            duration: duration * 1.5,
            stagger: stagger * 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: blockStart,
              invalidateOnRefresh: true,
            },
          })
        })
      }
    }, wrapRef)

    window.addEventListener("resize", onResize)
    return () => {
      ctx.revert()
      window.removeEventListener("resize", onResize)
      if (raf.current !== null) {
        window.cancelAnimationFrame(raf.current)
      }
    }
  }, [coverReady, breakpoint])

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative",
        "transition-opacity duration-500 ease-out",
        !coverReady && "opacity-0 pointer-events-none",
      )}
    >
      {/* HERO */}
      <section className="relative">
        {/* COVER IMAGE */}
        <div className="relative">
          <Image
            image={coverDetail}
            resizeId="cover-detail"
            className="w-full"
            priority
            onLoad={() => setCoverReady(true)}
          />

          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
            <ScrollIndicator />
          </div>
        </div>

        {/* TITLE AND YEAR */}
        <div className="absolute inset-0 pointer-events-none pb-16">
          <div
            className={cn(
              "sticky overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 ml-[14px] md:ml-[calc(50%)]",
            )}
          >
            <h1>
              {(title ?? "").split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block type-h1 leading-none text-white"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          <div
            className={cn(
              "absolute overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 right-[14px] md:right-[24px]",
            )}
          >
            <span className="flex overflow-hidden">
              <span className="type-caption text-white">{year}</span>
            </span>
          </div>
        </div>
      </section>

      {/* CONTENTS */}
      <section ref={contentsRef}>
        <div
          className={cn(
            "relative text-black max-w-[1280px] mx-auto",
            "px-[12px] md:px-[24px] py-[48px] md:py-[104px]",
            "flex flex-col md:flex-row gap-[48px] md:gap-[24px]",
          )}
        >
          {/* DETAILS */}
          <div className="flex flex-wrap gap-[24px] md:flex-1/2">
            <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
              <span className="type-caption text-[#B7B7B7]" data-split-content>
                Client
              </span>
              <div className="type-body-s uppercase" data-split-content>
                {client}
              </div>
            </div>

            <div className="flex flex-col basis-[calc(50%-12px)] md:basis-full shrink-0 gap-[6px]">
              <span className="type-caption text-[#B7B7B7]" data-split-content>
                Sector
              </span>
              <div className="type-body-s uppercase" data-split-content>
                {sector}
              </div>
            </div>

            {credits && credits.length > 0 && (
              <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
                <span
                  className="type-caption text-[#B7B7B7]"
                  data-split-content
                >
                  Credits
                </span>
                <div className="type-body-s uppercase">
                  {credits.map((credit) => (
                    <div key={credit} data-split-content>
                      {credit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-[6px] md:flex-1/2">
            <span className="type-caption text-[#B7B7B7]" data-split-content>
              Description
            </span>

            {description?.length ? (
              <div
                ref={descriptionRef}
                className="prose prose-neutral dark:prose-invert max-w-none prose-strong:text-inherit text-black type-body-s uppercase"
              >
                <PortableText
                  value={description}
                  components={portableTextComponents}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section ref={mainRef} className="relative px-[12px] md:px-[24px]">
        {renderBlocks(blocks)}
      </section>

      {/* NEXT PROJECT */}
      {nextProject && (
        <section>
          <NextProjectTeaser nextProject={nextProject} />
        </section>
      )}
    </div>
  )
}

const ENTER_THRESHOLD = 0.7
const LOAD_DURATION = 2
const SCROLL_DURATION = 1

function NextProjectTeaser({
  nextProject,
}: {
  nextProject: NonNullable<PROJECT_QUERY_RESULT>["nextProject"]
}) {
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
    <section ref={wrapRef}>
      <div className="relative w-full h-lvh overflow-hidden text-white">
        {/* COVER */}
        <Image
          image={nextProject?.coverList}
          resizeId="default"
          fill
          fit="cover"
          sizes="100vw"
        />

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

        {/* TITLE */}
        <div
          className={cn(
            "absolute",
            "top-1/2 -translate-y-1/2 left-[14px] md:left-[calc(50%)]",
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
    </section>
  ) : null
}
