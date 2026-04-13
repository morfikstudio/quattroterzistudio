"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/utils/classNames"
import { useLenis } from "@/components/LenisProvider"
import Button from "./ui/Button"
import Icon from "./ui/Icon"

interface TextTwoColProps {
  label: string
  paragraphs: string[]
  className?: string
}

export default function TextTwoCol({
  label,
  paragraphs,
  className,
}: TextTwoColProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useLayoutEffect(() => {
    if (!lenis || !containerRef.current) return

    gsap.registerPlugin(SplitText, ScrollTrigger)

    const ctx = gsap.context(() => {
      const textEls =
        containerRef.current?.querySelectorAll<HTMLElement>("[data-split]") ??
        []
      if (!textEls.length) return

      const splits = Array.from(textEls).map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )
      const lines = splits.flatMap((s) => s.lines)

      gsap.set(lines, { yPercent: 110 })
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.03,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          invalidateOnRefresh: true,
        },
      })

      return () => {
        splits.forEach((s) => s.revert())
      }
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [lenis])

  return (
    <div
      ref={containerRef}
      className={cn("text-two-col", "flex flex-col md:flex-row")}
    >
      <span
        data-split
        className="type-caption uppercase md:flex-1 mb-6 md:mb-0"
      >
        {label}
      </span>

      <div className="flex flex-col gap-6 md:gap-8 md:flex-1  ">
        {paragraphs.map((text, i) => (
          <p data-split key={i} className="uppercase font-medium">
            {text}
          </p>
        ))}

        <div className="cta font-medium">
          <Button
            label="Discover our work"
            icon={<Icon type="arrowRight" size="s" />}
            href="/projects"
            size="l"
          />
        </div>
      </div>
    </div>
  )
}
