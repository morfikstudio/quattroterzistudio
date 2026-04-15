"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { cn } from "@/utils/classNames"
import ScrollIndicator from "@/components/ScrollIndicator"

export default function HeroAbout() {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const scope = containerRef.current
    if (!scope) return

    gsap.registerPlugin(SplitText)

    const ctx = gsap.context(() => {
      const textEls = scope.querySelectorAll<HTMLElement>("[data-split]")
      if (!textEls.length) return

      const splits = Array.from(textEls).map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )
      const lines = splits.flatMap((s) => s.lines)

      gsap.set(lines, { yPercent: 110 })
      gsap.to(lines, {
        yPercent: 0,
        y: 3,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.4,
      })

      return () => {
        splits.forEach((s) => s.revert())
      }
    }, scope)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <div ref={containerRef} className={cn("hero-about relative", " md:pr-12")}>
      <div
        className={cn(
          "content uppercase",
          "h-svh flex flex-col justify-center",
          "relative px-[12px] md:px-[24px] pt-[48px] md:py-[104px]",
          "max-w-[1280px] mx-auto",
        )}
      >
        <span
          data-split
          className={cn("label type-caption", "mb-[50px] md:mb-[120px]")}
        >
          ( we are quattroterzi )
        </span>
        <div className="">
          <div
            className={cn(
              "hero-about-title-container type-display-l max-md:text-[42px]",
              "flex flex-col mb-[50px]",
              "md:mb-0",
            )}
          >
            <span data-split className="block pt-[0.08em]">
              we make
            </span>
            <span
              data-split
              className="block pt-[0.08em] ml-[30px] md:ml-[100px]"
            >
              the unseen
            </span>
            <span data-split className="block pt-[0.08em]">
              fell unknown
            </span>
          </div>
        </div>
      </div>
      <span
        data-split
        className={cn(
          "label-right type-caption text-right ",
          "absolute right-4 md:right-[24px] bottom-1/4",
          "xl:right-12 xl:top-1/2 xl:bottom-auto xl:-translate-y-1/2 xl:translate-x-0",
        )}
      >
        Images creators
        <br />& Shadows lovers
      </span>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
        <ScrollIndicator variant="dark" />
      </div>
    </div>
  )
}
