"use client"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

import Image from "@/components/ui/Image"
import ScrollIndicator from "@/components/ScrollIndicator"

type HeroProps = {
  cover: NonNullable<PROJECT_QUERY_RESULT>["coverDetail"]
  title: NonNullable<PROJECT_QUERY_RESULT>["title"] | null
  year: NonNullable<PROJECT_QUERY_RESULT>["year"] | null
  onCoverLoad: (ready: boolean) => void
}

export default function Hero({ cover, title, year, onCoverLoad }: HeroProps) {
  return (
    <div className="relative">
      {/* COVER IMAGE */}
      <div className="relative">
        <Image
          image={cover}
          resizeId="cover-detail"
          className="w-full"
          priority
          onLoad={() => onCoverLoad(true)}
        />

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
          <ScrollIndicator />
        </div>
      </div>

      {/* TITLE AND YEAR */}
      <div className="absolute inset-0 pointer-events-none pb-16">
        {title && (
          <div
            className={cn(
              "sticky overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 ml-[14px] md:ml-[calc(50%)]",
            )}
          >
            <h1>
              {title.split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block type-h1 leading-none text-white"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>
        )}

        {year && (
          <div
            className={cn(
              "absolute overflow-hidden pointer-events-auto",
              "top-[50vh] -translate-y-1/2 right-[14px] md:right-[24px]",
            )}
          >
            <span className="flex overflow-hidden">
              <span className="type-caption text-white">{year}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
