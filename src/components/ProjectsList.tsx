"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"

const PROJECTS = [
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
const SLIDES_PER_VIEW = 7
const FRICTION = 0.92
const WHEEL_MULT = 0.6
// 3 copies: pre | real | post — garantisce loop fluido in entrambe le direzioni
const LOOP_ITEMS = [...PROJECTS, ...PROJECTS, ...PROJECTS]

type ImageRect = { top: number; left: number; width: number; height: number }

export default function ProjectsList() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [imageRect, setImageRect] = useState<ImageRect | null>(null)
  const [itemHeight, setItemHeight] = useState(0)

  // Se c'è un hover, mostra quell'immagine; altrimenti quella attiva da scroll
  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const mirrorRef = useRef<HTMLUListElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const translateRef = useRef(0)
  const velocityRef = useRef(0)
  const rafRef = useRef<number>(0)

  // Calcola il translate iniziale: primo item del blocco centrale centrato
  const getInitialTranslate = useCallback((h: number) => {
    const ih = h / SLIDES_PER_VIEW
    return h / 2 - N * ih - ih / 2
  }, [])

  // Applica transform a lista e mirror (stesso valore = allineamento garantito)
  const applyTransform = useCallback((translate: number) => {
    const t = `translate3d(0, ${translate}px, 0)`
    if (listRef.current) listRef.current.style.transform = t
    if (mirrorRef.current) mirrorRef.current.style.transform = t
    translateRef.current = translate
  }, [])

  // Loop fix: mantiene il translate nel range del blocco centrale
  const loopFix = useCallback(
    (translate: number, ih: number) => {
      const span = N * ih
      if (
        translate >
        getInitialTranslate(containerRef.current?.clientHeight ?? 0) + span / 2
      )
        return translate - span
      if (
        translate <
        getInitialTranslate(containerRef.current?.clientHeight ?? 0) - span / 2
      )
        return translate + span
      return translate
    },
    [getInitialTranslate],
  )

  // Aggiorna l'indice attivo dal translate corrente
  const updateActiveIndex = useCallback(
    (translate: number, ih: number, containerH: number) => {
      if (ih === 0) return
      const rawIndex = (containerH / 2 - translate) / ih - 0.5
      const fullIndex = Math.round(rawIndex)
      const realIndex = ((fullIndex % N) + N) % N
      setActiveIndex(realIndex)
    },
    [],
  )

  // Init/resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const init = () => {
      const h = el.clientHeight
      const ih = h / SLIDES_PER_VIEW
      setItemHeight(ih)
      const initial = getInitialTranslate(h)
      applyTransform(initial)
      updateActiveIndex(initial, ih, h)
    }
    init()
    window.addEventListener("resize", init)
    return () => window.removeEventListener("resize", init)
  }, [getInitialTranslate, applyTransform, updateActiveIndex])

  // Image bounds per il mirror clip
  useEffect(() => {
    const el = imageRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setImageRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  // Anima verso un item specifico (click) — durata fissa con easeOutQuart
  const scrollToItem = useCallback(
    (itemIndex: number) => {
      const el = containerRef.current
      if (!el) return
      velocityRef.current = 0
      cancelAnimationFrame(rafRef.current)
      const ih = el.clientHeight / SLIDES_PER_VIEW
      const rawTarget = el.clientHeight / 2 - (itemIndex + 0.5) * ih
      const target = loopFix(rawTarget, ih)
      const startTranslate = translateRef.current
      const startTime = performance.now()
      const DURATION = 700 // ms
      const step = (now: number) => {
        const t = Math.min((now - startTime) / DURATION, 1)
        // easeOutQuart: parte veloce, rallenta molto verso la fine
        const eased = 1 - Math.pow(1 - t, 4)
        const next = startTranslate + (target - startTranslate) * eased
        applyTransform(next)
        updateActiveIndex(next, ih, el.clientHeight)
        if (t < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [loopFix, applyTransform, updateActiveIndex],
  )

  // Animazione momentum
  const animate = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    velocityRef.current *= FRICTION
    if (Math.abs(velocityRef.current) < 0.1) {
      velocityRef.current = 0
      return
    }
    const ih = el.clientHeight / SLIDES_PER_VIEW
    const next = loopFix(translateRef.current + velocityRef.current, ih)
    applyTransform(next)
    updateActiveIndex(next, ih, el.clientHeight)
    rafRef.current = requestAnimationFrame(animate)
  }, [loopFix, applyTransform, updateActiveIndex])

  // Wheel
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      velocityRef.current -= e.deltaY * WHEEL_MULT
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [animate])

  // Touch
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let lastY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY
      velocityRef.current = 0
      cancelAnimationFrame(rafRef.current)
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const y = e.touches[0].clientY
      const delta = y - lastY
      lastY = y
      velocityRef.current = delta
      const ih = el.clientHeight / SLIDES_PER_VIEW
      const next = loopFix(translateRef.current + delta, ih)
      applyTransform(next)
      updateActiveIndex(next, ih, el.clientHeight)
    }
    const onTouchEnd = () => {
      rafRef.current = requestAnimationFrame(animate)
    }
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [animate, loopFix, applyTransform, updateActiveIndex])

  const renderItems = (white = false) =>
    LOOP_ITEMS.map((project, i) => {
      const realIndex = i % N
      const isActive = realIndex === activeIndex
      const isHovered = hoverIndex === realIndex
      return (
        <li
          key={i}
          style={{ height: itemHeight || `${100 / SLIDES_PER_VIEW}vh` }}
          className="flex items-center cursor-pointer"
          onMouseEnter={() => setHoverIndex(realIndex)}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={() => scrollToItem(i)}
        >
          {/* padding wrapper */}
          <span className="px-6 md:px-10">
            {/* inline-block così l'underline è largo quanto il testo */}
            <span
              className="relative inline-block leading-tight"
              style={{
                fontSize: "clamp(40px, 5.5vw, 70px)",
                fontWeight: 300,
                color: white
                  ? "white"
                  : isHovered || isActive
                    ? "#000"
                    : "#bcbcbc",
                transition: "color 0.35s ease-out",
              }}
            >
              case {String(realIndex + 1).padStart(3, "0")}
              {/* Underline: clip-path per animare L→R su enter, R→L su exit */}
              <span
                className="absolute left-0 bottom-0 w-full"
                style={{
                  height: "2px",
                  backgroundColor: "currentColor",
                  clipPath: isHovered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                  transition: "clip-path 0.4s ease-out",
                }}
              />
            </span>
          </span>
        </li>
      )
    })

  return (
    <div className="projects-list relative h-screen md:grid md:grid-cols-2">
      {/* Mobile: immagine centrata dietro */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center px-13">
        <div
          ref={imageRef}
          className="relative w-full"
          style={{ aspectRatio: "4/3" }}
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

      {/* Desktop: colonna sinistra immagine */}
      <div className="hidden md:flex items-center justify-center h-screen px-12">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
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

      {/* Lista principale */}
      <div ref={containerRef} className="relative h-screen overflow-hidden">
        {/* Master list */}
        <ul
          ref={listRef}
          className="absolute inset-x-0 top-0 list-none m-0 p-0"
          style={{ willChange: "transform" }}
        >
          {renderItems(false)}
        </ul>

        {/* Mirror overlay: solo mobile, clippato ai bounds dell'immagine */}
        {imageRect && imageRect.width > 0 && itemHeight > 0 && (
          <div
            className="md:hidden absolute overflow-hidden pointer-events-none"
            style={{
              top: imageRect.top,
              left: imageRect.left,
              width: imageRect.width,
              height: imageRect.height,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -imageRect.top,
                left: -imageRect.left,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
              }}
            >
              <ul
                ref={mirrorRef}
                className="absolute inset-x-0 top-0 list-none m-0 p-0"
                style={{ willChange: "transform" }}
              >
                {renderItems(true)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
