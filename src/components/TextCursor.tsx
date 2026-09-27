"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"

import { useCursorStore } from "@/stores/cursorStore"
import { useIsTouch } from "@/hooks/useIsTouch"
import { usePointer } from "@/hooks/usePointer"

type TextCursorProps = {
  text: string
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function TextCursor({ text }: TextCursorProps) {
  const cursorEnabled = useCursorStore((s) => s.cursorEnabled)
  const isTouch = useIsTouch()
  const { position: targetPosition, isActive } = usePointer()

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // Stay mounted after the cursor is disabled until the exit animation has played
  const canShow = isActive && !isTouch
  const [prevEnabled, setPrevEnabled] = useState(cursorEnabled)
  const [exiting, setExiting] = useState(false)
  if (cursorEnabled !== prevEnabled) {
    setPrevEnabled(cursorEnabled)
    setExiting(!cursorEnabled && canShow)
  }

  const hideNativeCursor = cursorEnabled && canShow
  const rendered = (cursorEnabled || exiting) && canShow

  useEffect(() => {
    targetRef.current = targetPosition
  }, [targetPosition])

  useEffect(() => {
    if (!hideNativeCursor) return
    document.body.style.cursor = "none"
    return () => {
      document.body.style.cursor = ""
    }
  }, [hideNativeCursor])

  useEffect(() => {
    if (!rendered) return

    const tick = () => {
      setPosition((prev) => ({
        x: lerp(prev.x, targetRef.current.x, 0.09),
        y: lerp(prev.y, targetRef.current.y, 0.09),
      }))
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [rendered])

  useLayoutEffect(() => {
    if (!exiting || !wrapRef.current) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => setExiting(false) })
        .to(
          "[data-cursor-letter]",
          {
            yPercent: -110,
            duration: 0.45,
            stagger: 0.012,
            ease: "power3.in",
          },
          0,
        )
        .to(
          "[data-cursor-square]",
          { scale: 0, duration: 0.35, ease: "power3.in" },
          0.1,
        )
    }, wrapRef)

    return () => ctx.revert()
  }, [exiting])

  return rendered ? (
    <div
      ref={wrapRef}
      className="flex items-center gap-1 fixed left-0 top-0 z-9999 pointer-events-none mix-blend-difference"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-2.5px, -50%)`,
      }}
      aria-hidden
    >
      <span data-cursor-square className="block w-[5px] h-[5px] bg-white" />
      <span className="flex overflow-hidden font-[Helvetica] text-[10px] font-medium uppercase tracking-tight text-white mt-px">
        {text.split("").map((char, i) => (
          <span key={i} data-cursor-letter className="inline-block">
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </div>
  ) : null
}
