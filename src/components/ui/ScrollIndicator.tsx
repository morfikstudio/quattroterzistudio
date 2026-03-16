"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/utils/classNames"

type ScrollIndicatorProps = {
  delay?: number
}

export default function ScrollIndicator({
  delay = 4000,
}: ScrollIndicatorProps) {
  const [show, setShow] = useState(true)
  const tm = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hide = useCallback(() => {
    setShow(false)

    if (tm.current) {
      clearTimeout(tm.current)
    }

    tm.current = setTimeout(() => {
      // only show if at top of page
      if (window.scrollY === 0) {
        setShow(true)
      }
      tm.current = null
    }, delay)
  }, [delay])

  useEffect(() => {
    setShow(window.scrollY === 0)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "PageDown" ||
        e.key === "PageUp"
      ) {
        hide()
      }
    }

    window.addEventListener("scroll", hide, { passive: true })
    window.addEventListener("wheel", hide, { passive: true })
    window.addEventListener("touchstart", hide, { passive: true })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("scroll", hide)
      window.removeEventListener("wheel", hide)
      window.removeEventListener("touchstart", hide)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [hide])

  useEffect(() => {
    return () => {
      if (tm.current) {
        clearTimeout(tm.current)
      }
    }
  }, [])

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
          "relative w-[3px] h-[38px]",
          "overflow-hidden bg-white/20 pointer-events-none",
          "transition-opacity duration-500 ease-out",
          show ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="scroll-indicator-bar absolute top-0 left-0 w-full h-[32px] bg-white" />
      </div>
    </>
  )
}
