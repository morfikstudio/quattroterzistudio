"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/utils/classNames"
import { useLenis } from "@/components/LenisProvider"
import { defaultItems, HoverListProps } from "./types"

export default function HoverListMobile({
  items = defaultItems,
  label,
  className,
}: HoverListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const descSplits = useRef<SplitText[]>([])
  const activeIdxRef = useRef<number>(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const lenis = useLenis()

  /* ── Open a specific accordion item ─────────────────────────────────── */
  const openItem = (index: number) => {
    if (activeIdxRef.current === index) return

    const prevIdx = activeIdxRef.current
    const prev = contentRefs.current[prevIdx]
    const next = contentRefs.current[index]

    // Snap prev description lines hidden immediately
    const prevLines = descSplits.current[prevIdx]?.lines
    if (prevLines) {
      gsap.to(prevLines, { yPercent: 110, duration: 0, overwrite: true })
    }

    // Close prev height
    if (prev) {
      gsap.to(prev, { height: 0, duration: 0.5, ease: "power3.inOut" })
    }

    // Open next height
    if (next) {
      gsap.to(next, {
        height: next.scrollHeight,
        duration: 0.5,
        ease: "power3.inOut",
      })
    }

    // Animate next description lines in with a slight delay
    const nextLines = descSplits.current[index]?.lines
    if (nextLines) {
      gsap.fromTo(
        nextLines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.035,
          delay: 0.15,
          overwrite: true,
        },
      )
    }

    activeIdxRef.current = index
    setActiveIndex(index)
  }

  /* ── Setup ───────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!lenis) return

    gsap.registerPlugin(SplitText, ScrollTrigger)

    const ctx = gsap.context(() => {
      // Pre-split all description paragraphs
      descRefs.current.forEach((el, i) => {
        if (!el) return
        const split = new SplitText(el, { type: "lines", mask: "lines" })
        descSplits.current[i] = split
        // Hide all lines initially
        gsap.set(split.lines, { yPercent: 110 })
      })

      // Initial heights: first open, rest closed
      contentRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.set(el, {
          height: i === 0 ? el.scrollHeight : 0,
          overflow: "hidden",
        })
      })

      // SplitText on titles — animate in before pinning starts
      const titleEls = titleRefs.current.filter(Boolean) as HTMLSpanElement[]
      const titleSplits = titleEls.map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )
      const titleLines = titleSplits.flatMap((s) => s.lines)

      gsap.set(titleLines, { yPercent: 110 })
      gsap.to(titleLines, {
        yPercent: 0,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          invalidateOnRefresh: true,
          onEnter: () => {
            // Animate first item's description lines in on viewport enter
            const firstLines = descSplits.current[0]?.lines
            if (firstLines) {
              gsap.to(firstLines, {
                yPercent: 0,
                duration: 0.85,
                ease: "power3.out",
                stagger: 0.035,
                delay: 0.3,
                overwrite: true,
              })
            }
          },
        },
      })

      // Pinned scroll: each step = one item
      const scrollPerStep = window.innerHeight * 0.7
      const totalScroll = (items.length - 1) * scrollPerStep

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 15%",
        end: `+=${totalScroll}`,
        pin: true,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (items.length - 1),
          duration: { min: 0.3, max: 0.6 },
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          const newIndex = Math.round(self.progress * (items.length - 1))
          openItem(newIndex)
        },
      })

      return () => {
        titleSplits.forEach((s) => s.revert())
        descSplits.current.forEach((s) => s?.revert())
      }
    }, containerRef)

    return () => ctx.revert()
  }, [lenis])

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={cn("hover-list-mobile px-4 my-12", className)}
    >
      {label && (
        <span className="type-caption uppercase block mb-8">{label}</span>
      )}

      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i}>
            {/* Title row */}
            <div className="py-3">
              <span
                ref={(el) => {
                  titleRefs.current[i] = el
                }}
                className={cn(
                  "type-h2 uppercase block transition-colors duration-300",
                  activeIndex !== i ? "text-tertiary" : "text-black",
                )}
              >
                {item.title}
              </span>
            </div>

            {/* Accordion content */}
            <div
              ref={(el) => {
                contentRefs.current[i] = el
              }}
              className="overflow-hidden"
            >
              <div className="pb-4 type-caption uppercase">
                <p
                  ref={(el) => {
                    descRefs.current[i] = el
                  }}
                  className="text-tertiary leading-relaxed"
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
