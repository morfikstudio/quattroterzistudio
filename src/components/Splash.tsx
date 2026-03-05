"use client"

import { useEffect } from "react"
import Link from "next/link"

import { useCursorStore } from "@/stores/cursorStore"
import { useIsTouch } from "@/hooks/useIsTouch"

type SplashProps = {
  title: string
  ctaText: string
}

function TextBlock({
  children = null,
  text = "",
}: {
  children?: React.ReactNode
  text?: string
}) {
  return (
    <span className="inline-block px-[0.25em] font-[Helvetica] uppercase text-[clamp(3rem,15vw,10rem)] font-medium">
      {children || text}
    </span>
  )
}

export default function Splash({ title, ctaText }: SplashProps) {
  const setCursor = useCursorStore((s) => s.setCursor)
  const isTouch = useIsTouch()

  useEffect(() => {
    setCursor(true)
    return () => setCursor(false)
  }, [setCursor])

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .splash-marquee-track {
            animation: splash-marquee 20s linear infinite;
          }

          @keyframes splash-marquee {
            0% {
              transform: translateX(-0.5em);
            }
            100% {
              transform: translateX(calc(-50% - 0.5em));
            }
          }
          `,
        }}
      />
      <Link href="/projects" className="cursor-none">
        <div className="relative w-full h-svh overflow-hidden bg-white">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[65vw] md:max-w-[75vw] lg:max-w-[35vw] aspect-4/3 bg-black" />
          <div
            className="absolute inset-0 z-10 flex items-center overflow-hidden mix-blend-difference pointer-events-none"
            aria-hidden
          >
            <div className="splash-marquee-track inline-flex whitespace-nowrap will-change-transform text-white">
              <TextBlock text={title} />
              <TextBlock text={title} />
            </div>
          </div>

          {isTouch && (
            <span className="absolute bottom-25 left-1/2 -translate-x-1/2 font-[Helvetica] text-[12px] font-medium uppercase text-black">
              {ctaText}
            </span>
          )}
        </div>
      </Link>
    </>
  )
}
