"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import NextImage from "next/image"
import { useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"

import gsap from "gsap"
import Image from "@/components/ui/Image"
import { useImageScale } from "@/hooks/useImageScale"
import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

const SLIDES_PER_VIEW = 7

// Placeholder — sostituire con dati reali Sanity quando disponibili
type PlaceholderProject = {
  id: string
  title: string
  code: string
  year: string
}
const PLACEHOLDER_PROJECTS: PlaceholderProject[] = [
  { id: "10", title: "Casa sul Lago", code: "M288NV4", year: "2023" },
  { id: "20", title: "Residenza Borghese", code: "K471RP9", year: "2022" },
  { id: "30", title: "Loft Industriale", code: "B302XL7", year: "2023" },
  { id: "40", title: "Villa Moderna", code: "G815TQ2", year: "2021" },
  { id: "50", title: "Appartamento Minimal", code: "H093JY6", year: "2024" },
  { id: "60", title: "Studio Creativo", code: "N567WC8", year: "2022" },
  { id: "70", title: "Penthouse Milano", code: "R124KD5", year: "2024" },
  { id: "80", title: "Cascina Ristrutturata", code: "F690SE3", year: "2021" },
  { id: "90", title: "Atelier Fotografico", code: "D743MZ1", year: "2023" },
  { id: "100", title: "Showroom Design", code: "A856HB0", year: "2022" },
  { id: "110", title: "Penthouse Roma", code: "T219UF8", year: "2024" },
]

function SelectionCTA({ onNavigate }: { onNavigate: () => void }) {
  const Icons = () => (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="flex w-[4px] h-[4px] bg-black max-md:bg-white" />
    </div>
  )
  return (
    <button
      onClick={onNavigate}
      className="appearance-none bg-transparent p-0 border-0"
    >
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
    </button>
  )
}

type Props = { projects?: PROJECTS_QUERY_RESULT }

export default function ProjectsList({ projects }: Props) {
  const usePlaceholder = !projects || projects.length === 0
  const items = usePlaceholder ? PLACEHOLDER_PROJECTS : projects!

  const router = useRouter()
  const [clipState, setClipState] = useState<"enter" | "exiting">("enter")
  const isExitingRef = useRef(false)
  const listContainerRef = useRef<HTMLDivElement | null>(null)
  const wordSpansRef = useRef<HTMLElement[]>([])
  const yearSpanRef = useRef<HTMLSpanElement | null>(null)
  // Mobile enter: unlock underline only when word is almost done (0.4s delay + ~0.9s into anim)
  const [pageEnterDone, setPageEnterDone] = useState(false)
  // Mobile exit: force active underline to "out" before words animate away
  const [underlineExiting, setUnderlineExiting] = useState(false)

  const allAnimTargets = useCallback(
    () => [
      ...wordSpansRef.current,
      ...(yearSpanRef.current ? [yearSpanRef.current] : []),
    ],
    [],
  )

  const navigate = useCallback(
    (url: string) => {
      if (isExitingRef.current) return
      isExitingRef.current = true
      setClipState("exiting")
      const startWords = () =>
        gsap.to(allAnimTargets(), {
          y: "-110%",
          duration: 0.7,
          ease: "power3.in",
          overwrite: true,
          onComplete: () => router.push(url),
        })
      if (isMobileRef.current) {
        setUnderlineExiting(true)
        setTimeout(startWords, 400)
      } else {
        startWords()
      }
    },
    [router, allAnimTargets],
  )

  // Unlock mobile underline when word is almost fully visible
  useEffect(() => {
    const t = setTimeout(() => setPageEnterDone(true), 1300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handlePopstate = () => {
      if (isExitingRef.current) return
      isExitingRef.current = true
      setClipState("exiting")
    }
    window.addEventListener("popstate", handlePopstate)
    return () => window.removeEventListener("popstate", handlePopstate)
  }, [])

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

  const activeItem = items[activeIndex]
  const activeYear = activeItem
    ? "year" in activeItem
      ? (activeItem as PlaceholderProject).year
      : ((activeItem as PROJECTS_QUERY_RESULT[number]).year ?? "")
    : ""

  const getLabel = (
    item: PlaceholderProject | PROJECTS_QUERY_RESULT[number],
  ) => ("code" in item ? item.code : (item.title ?? ""))

  const getKey = (item: PlaceholderProject | PROJECTS_QUERY_RESULT[number]) =>
    "id" in item ? item.id : item._id

  return (
    <>
      <style>{`
        @keyframes pl-clip-enter {
          from { clip-path: inset(100% 0 0 0); }
          to   { clip-path: inset(0% 0 0 0); }
        }
        @keyframes pl-clip-exit {
          from { clip-path: inset(0% 0 0 0); }
          to   { clip-path: inset(100% 0 0 0); }
        }
        .pl-img-clip[data-clip="enter"] {
          clip-path: inset(100% 0 0 0);
          animation: pl-clip-enter 1.35s cubic-bezier(0.22, 1, 0.36, 1) .75s forwards;
        }
        .pl-img-clip[data-clip="exiting"] {
          animation: pl-clip-exit 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

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

        .pl-year-span {
          transform: translateY(110%);
          display: block;
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

        .pl-word-inner {
          transform: translateY(110%);
          display: inline-block;
        }
      `}</style>

      <div className="fixed bottom-5 left-6 z-30">
        <SelectionCTA onNavigate={() => navigate("/projects")} />
      </div>

      <div className="fixed top-1/2 -translate-y-1/2 right-[14px] md:right-[24px] z-30 pointer-events-none overflow-hidden">
        <span ref={yearSpanRef} className="pl-year-span type-caption">
          {activeYear}
        </span>
      </div>

      <div className="relative h-screen md:grid md:grid-cols-2">
        {/* Mobile image */}
        <div className="md:hidden absolute inset-0">
          <div
            className="pl-img-clip absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[60vw]"
            data-clip={clipState}
          >
            <div
              ref={mobileImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              {usePlaceholder
                ? PLACEHOLDER_PROJECTS.map((p, i) => (
                    <div
                      key={p.id}
                      className="pl-img-slide"
                      data-active={displayIndex === i ? "true" : "false"}
                    >
                      <NextImage
                        src={`https://picsum.photos/seed/${p.id}/800/600`}
                        fill
                        alt={p.title}
                        className="object-cover"
                        priority={i < 2}
                      />
                    </div>
                  ))
                : projects!.map((p, i) => (
                    <div
                      key={`${p._id}-${i}`}
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
          <div
            className="pl-img-clip absolute top-1/2 left-[7vw] -translate-y-1/2 w-[50vw] lg:w-[35vw]"
            data-clip={clipState}
          >
            <div
              ref={desktopImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              {usePlaceholder
                ? PLACEHOLDER_PROJECTS.map((p, i) => (
                    <div
                      key={p.id}
                      className="pl-img-slide"
                      data-active={displayIndex === i ? "true" : "false"}
                    >
                      <NextImage
                        src={`https://picsum.photos/seed/${p.id}/800/600`}
                        fill
                        alt={p.title}
                        className="object-cover"
                        priority={i < 2}
                      />
                    </div>
                  ))
                : projects!.map((p, i) => (
                    <div
                      key={`${p._id}-${i}`}
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
            ref={listContainerRef}
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
                setTimeout(() => {
                  if (!listContainerRef.current) return
                  const spans = Array.from(
                    listContainerRef.current.querySelectorAll<HTMLElement>(
                      ".pl-word-inner",
                    ),
                  ).filter((s) => !s.closest(".swiper-slide-duplicate"))
                  if (!spans.length) return
                  wordSpansRef.current = spans
                  gsap.fromTo(
                    [
                      ...spans,
                      ...(yearSpanRef.current ? [yearSpanRef.current] : []),
                    ],
                    { y: "110%" },
                    { y: "0%", duration: 1.2, ease: "power3.out", delay: 0.4 },
                  )
                }, 0)
              }}
              onSetTranslate={handleSetTranslate}
              className="h-full"
            >
              {items.map((p, i) => (
                <SwiperSlide key={getKey(p)} role="listitem">
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
                        (isMobile &&
                          !isScrolling &&
                          pageEnterDone &&
                          !underlineExiting &&
                          activeIndex === i)
                          ? "in"
                          : interactedItemsRef.current.has(i) ||
                              (isMobile &&
                                underlineExiting &&
                                activeIndex === i)
                            ? "out"
                            : undefined
                      }
                      onFocus={() => setHoverIndex(i)}
                      onBlur={() => setHoverIndex(null)}
                      onClick={(e) => e.preventDefault()}
                      aria-label={getLabel(p)}
                    >
                      {getLabel(p)
                        .split(" ")
                        .map((word, j, arr) => (
                          <span
                            key={j}
                            className="overflow-hidden inline-block align-bottom"
                          >
                            <span className="pl-word-inner">
                              {word}
                              {j < arr.length - 1 ? "\u00A0" : ""}
                            </span>
                          </span>
                        ))}
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
