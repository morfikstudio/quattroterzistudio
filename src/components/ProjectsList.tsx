"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"

import NextImage from "next/image"
import Image from "@/components/ui/Image"
import { useImageScale } from "@/hooks/useImageScale"
import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

const SLIDES_PER_VIEW = 7

// Placeholder — sostituire con dati reali Sanity quando disponibili
type PlaceholderProject = { id: string; title: string; code: string }
const PLACEHOLDER_PROJECTS: PlaceholderProject[] = [
  { id: "10", title: "Casa sul Lago", code: "M288NV4" },
  { id: "20", title: "Residenza Borghese", code: "K471RP9" },
  { id: "30", title: "Loft Industriale", code: "B302XL7" },
  { id: "40", title: "Villa Moderna", code: "G815TQ2" },
  { id: "50", title: "Appartamento Minimal", code: "H093JY6" },
  { id: "60", title: "Studio Creativo", code: "N567WC8" },
  { id: "70", title: "Penthouse Milano", code: "R124KD5" },
  { id: "80", title: "Cascina Ristrutturata", code: "F690SE3" },
  { id: "90", title: "Atelier Fotografico", code: "D743MZ1" },
  { id: "100", title: "Showroom Design", code: "A856HB0" },
  { id: "110", title: "Penthouse Roma", code: "T219UF8" },
]

type Props = { projects?: PROJECTS_QUERY_RESULT }

export default function ProjectsList({ projects }: Props) {
  const usePlaceholder = !projects || projects.length === 0
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  const interactedItemsRef = useRef<Set<number>>(new Set())
  const prevActiveRef = useRef(0)
  const isMobileRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  const velocityRef = useRef(0)
  const prevTranslateRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const scrollCheckRef = useRef<number>(0)

  const { mobileImgRef, desktopImgRef, startScaleLoop } = useImageScale({
    velocityRef,
  })

  // Cleanup requestAnimationFrame on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(scrollCheckRef.current)
  }, [])

  // Detect mobile to drive the underline on activeIndex only on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = (matches: boolean) => {
      isMobileRef.current = matches
      setIsMobile(matches)
    }
    update(mq.matches)
    mq.addEventListener("change", (e) => update(e.matches))
    return () => mq.removeEventListener("change", (e) => update(e.matches))
  }, [])

  // Track the velocity from the delta between successive frames of onSetTranslate,
  // start the scale loop and manage the isScrolling flag.
  const handleSetTranslate = useCallback(
    (_swiper: SwiperType, translate: number) => {
      if (prevTranslateRef.current !== null) {
        velocityRef.current = translate - prevTranslateRef.current
        startScaleLoop()

        if (!isScrollingRef.current) {
          isScrollingRef.current = true
          setIsScrolling(true)
        }

        cancelAnimationFrame(scrollCheckRef.current)
        const check = () => {
          if (Math.abs(velocityRef.current) > 0.5) {
            scrollCheckRef.current = requestAnimationFrame(check)
          } else {
            isScrollingRef.current = false
            setIsScrolling(false)
          }
        }
        scrollCheckRef.current = requestAnimationFrame(check)
      }
      prevTranslateRef.current = translate
    },
    [startScaleLoop],
  )

  // During scroll the image follows the active element;
  // only at rest it follows the hover.
  const displayIndex = isScrolling
    ? activeIndex
    : hoverIndex !== null
      ? hoverIndex
      : activeIndex

  return (
    <>
      <style>{`
        .pl-img-wrapper {
          aspect-ratio: 4 / 3;
          transform-origin: center;
        }
        .pl-item-link {
          font-size: clamp(40px, 5.5vw, 70px);
          transition: color 0.45s cubic-bezier(0.6, 0, 0.2, 1);
          @media (max-width: 767px) {
            opacity: 0.5;
          }
        }
        .pl-item-link[data-active="true"] { color: #000; }
        @media (max-width: 767px) {
          .pl-item-link[data-active="true"] { color: #fff; mix-blend-mode: difference; opacity: 1; }
        }
        .pl-underline {
          clip-path: inset(0 100% 0 0);
        }
        @keyframes pl-line-in {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes pl-line-out {
          from { clip-path: inset(0 0% 0 0); }
          to   { clip-path: inset(0 0% 0 100%); }
        }
        .pl-item-link[data-line="in"] .pl-underline {
          animation: pl-line-in 0.45s cubic-bezier(0.6, 0, 0.2, 1) forwards;
        }
        .pl-item-link[data-line="out"] .pl-underline {
          animation: pl-line-out 0.45s cubic-bezier(0.6, 0, 0.2, 1) forwards;
        }
        .pl-fade-top {
          background: linear-gradient(to bottom, #fff 20%, transparent 100%);
        }
        .pl-fade-bottom {
          background: linear-gradient(to top, #fff 20%, transparent 100%);
        }
        @media (max-width: 767px) {
          .pl-swiper-blend { mix-blend-mode: difference; }
        }
      `}</style>

      <div className="relative h-screen md:grid md:grid-cols-2">
        {/* Mobile image */}
        <div className="md:hidden absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[70vw]">
            <div
              ref={mobileImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              {usePlaceholder
                ? PLACEHOLDER_PROJECTS.map((p, i) => (
                    <div
                      key={p.id}
                      className="absolute inset-0"
                      style={{ display: displayIndex === i ? "block" : "none" }}
                    >
                      <NextImage
                        src={`https://picsum.photos/seed/${p.id}/800/600`}
                        fill
                        alt={p.title}
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ))
                : projects!.map((p, i) => (
                    <div
                      key={p._id}
                      className="absolute inset-0"
                      style={{ display: displayIndex === i ? "block" : "none" }}
                    >
                      <Image
                        image={p.coverDetail}
                        resizeId="cover-detail"
                        fill
                        fit="cover"
                        priority={i < 2}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Desktop image */}
        <div className="hidden md:block relative h-screen">
          <div className="absolute top-1/2 left-[7vw] -translate-y-1/2 w-[50vw] lg:w-[35vw]">
            <div
              ref={desktopImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              {usePlaceholder
                ? PLACEHOLDER_PROJECTS.map((p, i) => (
                    <div
                      key={p.id}
                      className="absolute inset-0"
                      style={{ display: displayIndex === i ? "block" : "none" }}
                    >
                      <NextImage
                        src={`https://picsum.photos/seed/${p.id}/800/600`}
                        fill
                        alt={p.title}
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ))
                : projects!.map((p, i) => (
                    <div
                      key={p._id}
                      className="absolute inset-0"
                      style={{ display: displayIndex === i ? "block" : "none" }}
                    >
                      <Image
                        image={p.coverDetail}
                        resizeId="cover-detail"
                        fill
                        fit="cover"
                        priority={i < 2}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div
          className="relative h-screen md:absolute md:inset-0 md:z-10"
          role="region"
          aria-label="Lista progetti"
        >
          <div className={cn("pl-swiper-blend h-full", "group")}>
            <Swiper
              direction="vertical"
              loop
              centeredSlides
              slidesPerView={SLIDES_PER_VIEW}
              speed={600}
              freeMode={{
                enabled: true,
                momentum: true,
                momentumRatio: 2,
                momentumVelocityRatio: 1.5,
                minimumVelocity: 0.02,
                sticky: true,
              }}
              // breakpoints={{
              //   1024: {
              //     freeMode: {
              //       sticky: false,
              //     },
              //   },
              // }}
              mousewheel={{ sensitivity: 1, thresholdDelta: 10 }}
              modules={[FreeMode, Mousewheel]}
              onRealIndexChange={(swiper) => {
                if (isMobileRef.current) {
                  interactedItemsRef.current.add(prevActiveRef.current)
                  prevActiveRef.current = swiper.realIndex
                }
                setActiveIndex(swiper.realIndex)
              }}
              onSetTranslate={handleSetTranslate}
              className="h-full"
            >
              {(usePlaceholder ? PLACEHOLDER_PROJECTS : projects!).map(
                (p, i) => (
                  <SwiperSlide key={"id" in p ? p.id : p._id} role="listitem">
                    <div className="flex items-center h-full px-6 md:pl-[calc(50%+2.5rem)] md:pr-10">
                      <a
                        href="#"
                        className={cn(
                          "pl-item-link",
                          "type-h1  text-secondary no-underline focus-visible:outline-none",
                          "relative inline-block leading-tight cursor-pointer  ",
                        )}
                        data-active={
                          hoverIndex === i || activeIndex === i
                            ? "true"
                            : "false"
                        }
                        data-line={
                          hoverIndex === i || (isMobile && activeIndex === i)
                            ? "in"
                            : interactedItemsRef.current.has(i)
                              ? "out"
                              : undefined
                        }
                        onMouseEnter={() => {
                          interactedItemsRef.current.add(i)
                          setHoverIndex(i)
                        }}
                        onMouseLeave={() => setHoverIndex(null)}
                        onFocus={() => setHoverIndex(i)}
                        onBlur={() => setHoverIndex(null)}
                        onClick={(e) => e.preventDefault()}
                        aria-label={`${p.title}, ${"code" in p ? p.code : String(i + 1).padStart(3, "0")}`}
                      >
                        {"code" in p ? p.code : String(i + 1).padStart(3, "0")}
                        <span
                          className={cn(
                            "pl-underline",
                            "absolute left-0 w-full h-0.5 bg-current bottom-[0.1em]",
                            "transition-transform duration-300 ease-out group-hover:translate-x-1",
                          )}
                        />
                      </a>
                    </div>
                  </SwiperSlide>
                ),
              )}
            </Swiper>
          </div>

          {/* Fade top/bottom */}
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-top",
              "md:hidden absolute left-0 right-0 top-0 h-[30%] pointer-events-none z-[2]",
              "transition-transform duration-300 ease-out group-hover:translate-x-1",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-bottom",
              "md:hidden absolute left-0 right-0 bottom-0 h-[30%] pointer-events-none z-[2]",
              "transition-transform duration-300 ease-out group-hover:translate-x-1",
            )}
          />
        </div>
      </div>
    </>
  )
}
