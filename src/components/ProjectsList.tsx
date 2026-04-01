"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"

import Image from "@/components/ui/Image"
import { useImageScale } from "@/hooks/useImageScale"
import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

const SLIDES_PER_VIEW = 7

function SelectionCTA() {
  const Icons = () => (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="flex w-[4px] h-[4px] bg-black max-md:bg-white" />
    </div>
  )
  return (
    <Link href="/projects">
      <div className="group relative h-[40px] w-[120px] border border-black max-md:bg-black flex items-center justify-center px-4">
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 group-hover:-translate-x-1 group-hover:opacity-0 transition-all duration-200 ease-in-out">
            <Icons />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:-translate-x-[calc(50%+14px)] transition-transform duration-400 ease-out">
            <span className="type-button-m uppercase text-black max-md:text-white">
              selection
            </span>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
            <Icons />
          </div>
        </div>
      </div>
    </Link>
  )
}

type Props = { projects: PROJECTS_QUERY_RESULT }

export default function ProjectsList({ projects }: Props) {
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
  const hoverIndexRef = useRef<number | null>(null)
  const swiperReadyRef = useRef(false)

  const { mobileImgRef, desktopImgRef, startScaleLoop } = useImageScale({
    velocityRef,
  })

  useEffect(() => {
    return () => cancelAnimationFrame(scrollCheckRef.current)
  }, [])

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

  const handleSetTranslate = useCallback(
    (_swiper: SwiperType, translate: number) => {
      if (!swiperReadyRef.current) {
        prevTranslateRef.current = translate
        return
      }
      if (prevTranslateRef.current !== null) {
        const delta = translate - prevTranslateRef.current

        if (delta !== 0) {
          velocityRef.current = delta
          startScaleLoop()

          if (hoverIndexRef.current !== null) {
            hoverIndexRef.current = null
            setHoverIndex(null)
          }

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
      }
      prevTranslateRef.current = translate
    },
    [startScaleLoop],
  )

  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex
  const isHovering = !isScrolling && hoverIndex !== null

  return (
    <>
      <style>{`
        .pl-img-slide {
          display: none;
          position: absolute;
          inset: 0;
        }
        .pl-img-slide[data-active="true"] {
          display: block;
        }

        .pl-item-link {
          font-size: clamp(40px, 5.5vw, 70px);
          opacity: 0.5;
          transition:
            color 1s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pl-item-link[data-active="true"] {
          color: #000;
          opacity: 1;
        }

        .pl-list[data-hovering="true"] .pl-item-link:not([data-active="true"]) {
          opacity: 0.2;
        }

        @media (max-width: 767px) {
          .pl-item-link[data-active="true"] {
            color: #fff;
            mix-blend-mode: difference;
            opacity: 1;
          }
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
          animation: pl-line-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .pl-item-link[data-line="out"] .pl-underline {
          animation: pl-line-out 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes pl-year-in {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0%); opacity: 1; }
        }
        .pl-year-fixed {
          opacity: 0;
          animation: pl-year-in 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
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

      <div className="fixed bottom-6 left-6 z-30">
        <SelectionCTA />
      </div>

      {projects[activeIndex]?.year != null && (
        <div className="fixed top-1/2 -translate-y-1/2 right-[14px] md:right-[24px] z-30 pointer-events-none overflow-hidden">
          <span key={activeIndex} className="pl-year-fixed type-caption block">
            {projects[activeIndex]?.year}
          </span>
        </div>
      )}

      <div className="relative h-screen md:grid md:grid-cols-2">
        {/* Mobile image */}
        <div className="md:hidden absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[70vw]">
            <div
              ref={mobileImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              {projects.map((p, i) => (
                <div
                  key={p._id}
                  className="pl-img-slide"
                  data-active={displayIndex === i ? "true" : "false"}
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
              {projects.map((p, i) => (
                <div
                  key={p._id}
                  className="pl-img-slide"
                  data-active={displayIndex === i ? "true" : "false"}
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
          <div
            className={cn("pl-swiper-blend pl-list h-full", "group")}
            data-hovering={isHovering ? "true" : "false"}
          >
            <Swiper
              direction="vertical"
              loop
              centeredSlides
              slidesPerView={SLIDES_PER_VIEW}
              speed={900}
              freeMode={{
                enabled: true,
                momentum: true,
                momentumRatio: 0.4,
                momentumVelocityRatio: 0.3,
                momentumBounce: false,
                minimumVelocity: 0.15,
              }}
              mousewheel={{ sensitivity: 1, thresholdDelta: 10 }}
              modules={[FreeMode, Mousewheel]}
              onRealIndexChange={(swiper) => {
                interactedItemsRef.current.add(prevActiveRef.current)
                prevActiveRef.current = swiper.realIndex
                setActiveIndex(swiper.realIndex)
              }}
              onAfterInit={() => {
                swiperReadyRef.current = true
              }}
              onSetTranslate={handleSetTranslate}
              className="h-full"
            >
              {projects.map((p, i) => (
                <SwiperSlide key={p._id} role="listitem">
                  <div
                    className="flex items-center h-full px-6 md:pl-[calc(50%+2.5rem)] md:pr-10"
                    onMouseEnter={() => {
                      interactedItemsRef.current.add(i)
                      setHoverIndex(i)
                    }}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <a
                      href="#"
                      className={cn(
                        "pl-item-link",
                        "type-h1 text-secondary no-underline focus-visible:outline-none",
                        "relative inline-block leading-tight cursor-pointer",
                      )}
                      data-active={
                        hoverIndex === i || activeIndex === i ? "true" : "false"
                      }
                      data-line={
                        (!isScrolling && hoverIndex === i) ||
                        (isMobile && activeIndex === i)
                          ? "in"
                          : interactedItemsRef.current.has(i)
                            ? "out"
                            : undefined
                      }
                      onFocus={() => setHoverIndex(i)}
                      onBlur={() => setHoverIndex(null)}
                      onClick={(e) => e.preventDefault()}
                      aria-label={p.title ?? undefined}
                    >
                      {p.title}
                      <span
                        className={cn(
                          "pl-underline",
                          "absolute left-0 w-full h-0.5 bg-current bottom-[0.1em]",
                        )}
                      />
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Fade top/bottom */}
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-top",
              "md:hidden absolute left-0 right-0 top-0 h-[30%] pointer-events-none z-[2]",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-bottom",
              "md:hidden absolute left-0 right-0 bottom-0 h-[30%] pointer-events-none z-[2]",
            )}
          />
        </div>
      </div>
    </>
  )
}
