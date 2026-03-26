"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SplitText from "gsap/SplitText"

import { PortableText } from "next-sanity"
import { components as portableTextComponents } from "@/sanity/portableTextComponents"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

import { useLenis } from "@/components/LenisProvider"

gsap.registerPlugin(ScrollTrigger, SplitText)

type ContentsProps = {
  client?: NonNullable<PROJECT_QUERY_RESULT>["client"] | null
  sector?: NonNullable<PROJECT_QUERY_RESULT>["sector"] | null
  credits?: NonNullable<PROJECT_QUERY_RESULT>["credits"] | null
  description?: NonNullable<PROJECT_QUERY_RESULT>["description"] | null
}

export default function Contents({
  client,
  sector,
  credits,
  description,
}: ContentsProps) {
  const lenis = useLenis()
  const wrapRef = useRef<HTMLDivElement>(null)

  function getBlockElements(selector: string) {
    return wrapRef.current
      ? Array.from(
          wrapRef.current.querySelectorAll<HTMLElement>(selector) ?? [],
        )
      : []
  }

  useLayoutEffect(() => {
    if (!lenis || !wrapRef.current) return

    const ctx = gsap.context(() => {
      let contents = getBlockElements("[data-block-content]")
      const descriptionText = getBlockElements(
        "[data-block-content-description] > p",
      )

      contents = contents.concat(descriptionText)

      if (contents.length === 0) return

      const lines = contents
        .filter(Boolean)
        .map((el) => new SplitText(el, { type: "lines", mask: "lines" }))
        .flatMap((s) => s.lines)

      if (lines.length === 0) return

      gsap.killTweensOf(lines)
      gsap.set(lines, { yPercent: 110 })

      gsap.to(lines, {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.02,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 75%",
          invalidateOnRefresh: true,
        },
      })
    }, wrapRef)

    return () => {
      ctx.revert()
    }
  }, [lenis])

  return (
    <div
      ref={wrapRef}
      className={cn("flex flex-col md:flex-row gap-[48px] md:gap-[24px]")}
    >
      <div className="flex flex-wrap gap-[24px] md:flex-1/2">
        {client && (
          <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
            <span className="type-caption text-[#B7B7B7]" data-block-content>
              Client
            </span>
            <div
              className="type-body-s uppercase text-black"
              data-block-content
            >
              {client}
            </div>
          </div>
        )}

        {sector && (
          <div className="flex flex-col basis-[calc(50%-12px)] md:basis-full shrink-0 gap-[6px]">
            <span className="type-caption text-[#B7B7B7]" data-block-content>
              Sector
            </span>
            <div
              className="type-body-s uppercase text-black"
              data-block-content
            >
              {sector}
            </div>
          </div>
        )}

        {credits && credits.length > 0 && (
          <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
            <span className="type-caption text-[#B7B7B7]" data-block-content>
              Credits
            </span>
            <div className="type-body-s uppercase text-black">
              {credits.map((credit) => (
                <div key={credit} data-block-content>
                  {credit}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {description && (
        <div className="flex flex-col gap-[6px] md:flex-1/2">
          <span className="type-caption text-[#B7B7B7]" data-block-content>
            Description
          </span>

          {description?.length ? (
            <div
              data-block-content-description
              className="prose prose-neutral dark:prose-invert max-w-none prose-strong:text-inherit type-body-s uppercase text-black"
            >
              <PortableText
                value={description}
                components={portableTextComponents}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
