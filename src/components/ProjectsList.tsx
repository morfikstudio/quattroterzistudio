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

const SLIDES_PER_VIEW = 7

// Placeholder — sostituire con dati reali Sanity quando disponibili
type PlaceholderProject = { id: string; title: string }
const PLACEHOLDER_PROJECTS: PlaceholderProject[] = [
  { id: "10", title: "Casa sul Lago" },
  { id: "20", title: "Residenza Borghese" },
  { id: "30", title: "Loft Industriale" },
  { id: "40", title: "Villa Moderna" },
  { id: "50", title: "Appartamento Minimal" },
  { id: "60", title: "Studio Creativo" },
  { id: "70", title: "Penthouse Milano" },
  { id: "80", title: "Cascina Ristrutturata" },
  { id: "90", title: "Atelier Fotografico" },
  { id: "100", title: "Showroom Design" },
  { id: "110", title: "Penthouse Roma" },
]

type Props = { projects?: PROJECTS_QUERY_RESULT }

export default function ProjectsList({ projects }: Props) {
  const usePlaceholder = !projects || projects.length === 0
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  const velocityRef = useRef(0)
  const prevTranslateRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const scrollCheckRef = useRef<number>(0)

  const { mobileImgRef, desktopImgRef, startScaleLoop } = useImageScale({
    velocityRef,
  })

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(scrollCheckRef.current)
  }, [])

  // Traccia la velocità dal delta tra frame successivi di onSetTranslate,
  // avvia lo scale loop e gestisce il flag isScrolling.
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

  // Durante lo scroll l'immagine segue l'elemento attivo;
  // solo a riposo segue l'hover.
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
          font-weight: 300;
          text-decoration: none;
          transition: color 0.45s cubic-bezier(0.6, 0, 0.2, 1);
        }
        .pl-underline {
          height: 2px;
          background-color: currentColor;
          transition: clip-path 0.45s cubic-bezier(0.6, 0, 0.2, 1);
        }
        .pl-fade-top,
        .pl-fade-bottom {
          position: absolute;
          left: 0;
          right: 0;
          height: 30%;
          pointer-events: none;
          z-index: 2;
        }
        .pl-fade-top {
          top: 0;
          background: linear-gradient(to bottom, #fff 20%, transparent 100%);
        }
        .pl-fade-bottom {
          bottom: 0;
          background: linear-gradient(to top, #fff 20%, transparent 100%);
        }
      `}</style>

      <div className="relative h-screen md:grid md:grid-cols-2">
        {/* Immagine — solo mobile, assoluta dietro la lista */}
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
                        image={p.coverThumb}
                        resizeId="cover-thumb"
                        fill
                        fit="cover"
                        priority={i === 0}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Immagine — solo desktop */}
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
                        image={p.coverThumb}
                        resizeId="cover-thumb"
                        fill
                        fit="cover"
                        priority={i === 0}
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
          <Swiper
            direction="vertical"
            loop
            centeredSlides
            slidesPerView={SLIDES_PER_VIEW}
            freeMode={{
              enabled: true,
              momentum: true,
              momentumRatio: 1.5,
              momentumVelocityRatio: 1.2,
            }}
            mousewheel={{ sensitivity: 1 }}
            modules={[FreeMode, Mousewheel]}
            onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex)}
            onSetTranslate={handleSetTranslate}
            className="h-full"
          >
            {(usePlaceholder ? PLACEHOLDER_PROJECTS : projects!).map((p, i) => (
              <SwiperSlide key={"id" in p ? p.id : p._id} role="listitem">
                <div className="flex items-center h-full px-6 md:pl-[calc(50%+2.5rem)] md:pr-10">
                  <a
                    href="#"
                    className="pl-item-link relative inline-block leading-tight cursor-pointer focus-visible:outline-none"
                    style={{
                      color:
                        hoverIndex === i || activeIndex === i
                          ? "#000"
                          : "#bcbcbc",
                    }}
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onFocus={() => setHoverIndex(i)}
                    onBlur={() => setHoverIndex(null)}
                    onClick={(e) => e.preventDefault()}
                    aria-label={`${p.title}, case ${String(i + 1).padStart(3, "0")}`}
                  >
                    case {String(i + 1).padStart(3, "0")}
                    <span
                      className="pl-underline absolute left-0 bottom-0 w-full"
                      style={{
                        clipPath:
                          hoverIndex === i
                            ? "inset(0 0% 0 0)"
                            : "inset(0 100% 0 0)",
                      }}
                    />
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Fade top/bottom — solo mobile */}
          <div aria-hidden="true" className="pl-fade-top md:hidden" />
          <div aria-hidden="true" className="pl-fade-bottom md:hidden" />
        </div>
      </div>
    </>
  )
}
