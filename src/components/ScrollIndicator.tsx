"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useLenis, useAnimationKey } from "@/components/LenisProvider"

import { cn } from "@/utils/classNames"

type ScrollIndicatorProps = {
  delay?: number
  variant?: "light" | "dark"
}

export default function ScrollIndicator({
  delay = 3000,
  variant = "light",
}: ScrollIndicatorProps) {
  const lenis = useLenis()
  const animationKey = useAnimationKey()

  const [show, setShow] = useState(true)

  const tm = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hide = useCallback(() => {
    setShow(false)

    if (tm.current) {
      clearTimeout(tm.current)
    }

    tm.current = setTimeout(() => {
      if (window.scrollY === 0) setShow(true)
      tm.current = null
    }, delay)
  }, [delay])

  useEffect(() => {
    if (!lenis) return

    setShow(lenis.scroll === 0)
    let lastScrollY = lenis.scroll || 0

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        hide()
      }
    }

    const onScroll = () => {
      if (lenis.scroll > lastScrollY) hide()
      lastScrollY = lenis.scroll
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onScroll, { passive: true })
    window.addEventListener("touchstart", onScroll, { passive: true })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onScroll)
      window.removeEventListener("touchstart", onScroll)
      window.removeEventListener("keydown", onKeyDown)

      if (tm.current) {
        clearTimeout(tm.current)
        tm.current = null
      }
    }
  }, [lenis, animationKey, hide])

  return (
    <>
      <style>{`
        @keyframes scrollDown {
          0%   { transform: translateY(-32px); }
          100% { transform: translateY(38px); }
        }
        .scroll-indicator-bar {
          animation: scrollDown 2s cubic-bezier(0.83, 0, 0.17, 1) infinite;
        }
      `}</style>
      <div
        className={cn(
          "relative w-[3px] h-[40px]",
          "overflow-hidden pointer-events-none",
          variant === "dark" ? "bg-black/20" : "bg-white/20",
          "transition-opacity duration-500 ease-out",
          show ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className={cn(
            "scroll-indicator-bar absolute top-0 left-0 w-full h-[32px]",
            variant === "dark" ? "bg-black" : "bg-white",
          )}
        />
      </div>
    </>
  )
}
