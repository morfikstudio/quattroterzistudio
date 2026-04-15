"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/utils/classNames"
import { useLenis } from "@/components/LenisProvider"
import { defaultItems, HoverListProps } from "./types"

export default function HoverListDesktop({
  items = defaultItems,
  label,
  className,
}: HoverListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const splitInstances = useRef<SplitText[]>([])
  const activeIdx = useRef<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0)
  const lenis = useLenis()

  /* ── Animate a panel in ──────────────────────────────────────────────── */
  const animateIn = (panelIndex: number) => {
    const split = splitInstances.current[panelIndex]
    if (!split) return
    gsap.to(split.lines, {
      yPercent: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.035,
      overwrite: true,
      force3D: true,
    })
  }

  /* ── Snap a panel instantly to hidden ───────────────────────────────── */
  const snapHide = (panelIndex: number) => {
    const split = splitInstances.current[panelIndex]
    if (!split) return
    gsap.to(split.lines, {
      yPercent: 110,
      duration: 0,
      overwrite: true,
      force3D: true,
    })
  }

  /* ── Viewport-enter: animate titles + show first item ───────────────── */
  useLayoutEffect(() => {
    const scope = containerRef.current
    if (!lenis || !scope) return

    gsap.registerPlugin(SplitText, ScrollTrigger)

    const ctx = gsap.context(() => {
      // Pre-split all description paragraphs and hide them
      descRefs.current.forEach((el, i) => {
        if (!el) return
        const split = new SplitText(el, { type: "lines", mask: "lines" })
        splitInstances.current[i] = split
        gsap.set(split.lines, { yPercent: 110 })
      })

      // Split titles and animate in on scroll
      const titleEls = titleRefs.current.filter(Boolean) as HTMLSpanElement[]
      const titleSplits = titleEls.map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )
      const titleLines = titleSplits.flatMap((s) => s.lines)

      gsap.set(titleLines, { yPercent: 110, force3D: true })
      gsap.to(titleLines, {
        yPercent: 0,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.05,
        force3D: true,
        scrollTrigger: {
          trigger: scope,
          start: "top 85%",
          invalidateOnRefresh: true,
          onEnter: () => {
            activeIdx.current = 0
            animateIn(0)
          },
        },
      })

      return () => {
        titleSplits.forEach((s) => s.revert())
        splitInstances.current.forEach((s) => s?.revert())
      }
    }, scope)

    return () => ctx.revert()
  }, [lenis])

  /* ── Hover handlers ──────────────────────────────────────────────────── */
  const handleRowEnter = (index: number) => {
    if (activeIdx.current === index) return

    setHoveredIndex(index)

    // Instantly hide all other panels
    items.forEach((_, i) => {
      if (i !== index) snapHide(i)
    })

    animateIn(index)
    activeIdx.current = index
  }

  const handleListLeave = () => {
    setHoveredIndex(activeIdx.current)
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={cn("hover-list")}
      onMouseLeave={handleListLeave}
    >
      {label && (
        <span className="type-caption uppercase block mb-6 md:mb-10">
          {label}
        </span>
      )}

      <div className="flex flex-row gap-8">
        {/* ── Left: title list ─────────────────────────────────────────── */}
        <div className="flex-1 shrink-0 min-w-max">
          {items.map((item, i) => (
            <div
              key={i}
              className="py-1 cursor-default"
              onMouseEnter={() => handleRowEnter(i)}
            >
              <span
                ref={(el) => {
                  titleRefs.current[i] = el
                }}
                className={cn(
                  "type-h2 uppercase block whitespace-nowrap transition-colors duration-300",
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "text-tertiary"
                    : "text-black",
                )}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* ── Right: text panels ───────────────────────────────────────── */}
        <div className="flex flex-1 justify-end relative">
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute top-0 right-0 type-caption uppercase max-w-[280px]"
              aria-hidden={hoveredIndex !== i}
            >
              <p
                ref={(el) => {
                  descRefs.current[i] = el
                }}
                className="text-tertiary leading-relaxed"
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
