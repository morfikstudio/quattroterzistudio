"use client"

import React, { useCallback, useRef, useState } from "react"
import Image from "next/image"

import { useScrollList, SLIDES_PER_VIEW } from "@/hooks/useScrollList"
import { useImageScale } from "@/hooks/useImageScale"
import { useMirrorRect } from "@/hooks/useMirrorRect"

type Project = { id: string; title: string }

const PROJECTS: Project[] = [
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
  { id: "110", title: "Showroom Design" },
]

const N = PROJECTS.length

/** Array triplo usato per il loop infinito: [pre | reale | post] */
const LOOP_ITEMS: Project[] = [...PROJECTS, ...PROJECTS, ...PROJECTS]

export default function ProjectsList() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollCheckRef = useRef<number>(0)

  // velocityRef è condiviso tra i due hook:
  // useScrollList lo scrive, useImageScale lo legge
  const velocityRef = useRef(0)

  const { mobileImgRef, desktopImgRef, startScaleLoop } = useImageScale({
    velocityRef,
  })

  // Quando lo scroll inizia: avvia scale loop + traccia velocità via RAF.
  // Quando velocityRef scende sotto soglia → isScrolling = false → torna l'hover.
  const handleScrollStart = useCallback(() => {
    startScaleLoop()
    setIsScrolling(true)
    cancelAnimationFrame(scrollCheckRef.current)
    const check = () => {
      if (Math.abs(velocityRef.current) > 0.5) {
        scrollCheckRef.current = requestAnimationFrame(check)
      } else {
        setIsScrolling(false)
      }
    }
    scrollCheckRef.current = requestAnimationFrame(check)
  }, [startScaleLoop, velocityRef])

  const {
    activeIndex,
    itemHeight,
    scrollToItem,
    containerRef,
    listRef,
    mirrorRef,
    itemRefs,
  } = useScrollList({ n: N, velocityRef, onScrollStart: handleScrollStart })

  const { imageRef, imageRect } = useMirrorRect()

  // Durante lo scroll l'immagine segue l'elemento attivo;
  // solo a riposo (mouse fermo) segue l'hover.
  const displayIndex = isScrolling
    ? activeIndex
    : hoverIndex !== null
      ? hoverIndex
      : activeIndex

  // ─── Render items ─────────────────────────────────────────────────────────

  const renderItems = (white = false) =>
    LOOP_ITEMS.map((project, i) => {
      const realIndex = i % N
      const isActive = realIndex === activeIndex
      const isHovered = hoverIndex === realIndex
      // Solo il blocco centrale è nel tab order e visibile agli screen reader
      const isMiddleCopy = i >= N && i < 2 * N

      return (
        <li
          key={i}
          style={{ height: itemHeight || `${100 / SLIDES_PER_VIEW}vh` }}
          className="flex items-center px-6 md:px-10"
          aria-hidden={!isMiddleCopy || undefined}
        >
          <a
            href="#"
            tabIndex={isMiddleCopy ? 0 : -1}
            ref={
              isMiddleCopy
                ? (el) => {
                    itemRefs.current[realIndex] = el
                  }
                : undefined
            }
            aria-current={isActive && isMiddleCopy ? "true" : undefined}
            aria-label={`${PROJECTS[realIndex].title}, case ${String(realIndex + 1).padStart(3, "0")}`}
            className="pl-item-link relative inline-block leading-tight cursor-pointer focus-visible:outline-none"
            onMouseEnter={() => setHoverIndex(realIndex)}
            onMouseLeave={() => setHoverIndex(null)}
            onFocus={() => {
              setHoverIndex(realIndex)
              if (isMiddleCopy) scrollToItem(i)
            }}
            onBlur={() => setHoverIndex(null)}
            onClick={(e) => {
              e.preventDefault()
              scrollToItem(i)
            }}
            style={{
              color: white
                ? "white"
                : isHovered || isActive
                  ? "#000"
                  : "#bcbcbc",
            }}
          >
            case {String(realIndex + 1).padStart(3, "0")}
            <span
              className="pl-underline absolute left-0 bottom-0 w-full"
              style={{
                clipPath: isHovered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              }}
            />
          </a>
        </li>
      )
    })

  // ─── Callback ref mobile: stesso nodo per mirror + scale ─────────────────

  const mobileImageCallbackRef = (el: HTMLDivElement | null) => {
    imageRef.current = el
    mobileImgRef.current = el
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

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
        .pl-scroll-list {
          will-change: transform;
        }
        .pl-mirror-inner {
          position: absolute;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
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

      <div className="projects-list relative h-screen md:grid md:grid-cols-2">
        {/* Mobile */}
        <div className="md:hidden absolute inset-0 flex items-center justify-center px-13">
          <div
            ref={mobileImageCallbackRef}
            className="pl-img-wrapper relative w-full"
          >
            {PROJECTS.map((project, i) => (
              <div
                key={project.id}
                className="absolute inset-0"
                style={{ display: displayIndex === i ? "block" : "none" }}
              >
                <Image
                  src={`https://picsum.photos/seed/${project.id}/800/600`}
                  fill
                  alt={project.title}
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center h-screen px-12">
          <div ref={desktopImgRef} className="pl-img-wrapper relative w-3/4">
            {PROJECTS.map((project, i) => (
              <div
                key={project.id}
                className="absolute inset-0"
                style={{ display: displayIndex === i ? "block" : "none" }}
              >
                <Image
                  src={`https://picsum.photos/seed/${project.id}/800/600`}
                  fill
                  alt={project.title}
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div
          ref={containerRef}
          role="region"
          aria-label="Lista progetti"
          className="relative h-screen overflow-hidden"
        >
          <ul
            ref={listRef}
            role="list"
            aria-label="Progetti"
            className="pl-scroll-list absolute inset-x-0 top-0 list-none m-0 p-0"
          >
            {renderItems(false)}
          </ul>

          {/* Fade top/bottom — solo mobile */}
          <div aria-hidden="true" className="pl-fade-top md:hidden" />
          <div aria-hidden="true" className="pl-fade-bottom md:hidden" />

          {/* Mirror lista mobile */}
          {imageRect && imageRect.width > 0 && itemHeight > 0 && (
            <div
              aria-hidden="true"
              className="md:hidden absolute overflow-hidden pointer-events-none"
              style={{
                top: imageRect.top,
                left: imageRect.left,
                width: imageRect.width,
                height: imageRect.height,
              }}
            >
              <div
                className="pl-mirror-inner"
                style={{ top: -imageRect.top, left: -imageRect.left }}
              >
                <ul
                  ref={mirrorRef}
                  className="pl-scroll-list absolute inset-x-0 top-0 list-none m-0 p-0"
                >
                  {renderItems(true)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
