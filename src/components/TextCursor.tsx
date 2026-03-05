"use client"

import { useEffect, useRef, useState, useMemo } from "react"

import { useCursorStore } from "@/stores/cursorStore"
import { useIsTouch } from "@/hooks/useIsTouch"
import { usePointer } from "@/hooks/usePointer"
import { cn } from "@/lib/utils"

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

  const shouldTick = useMemo(
    () => cursorEnabled && isActive && !isTouch,
    [cursorEnabled, isActive, isTouch],
  )

  function tick() {
    setPosition((prev) => ({
      x: lerp(prev.x, targetRef.current.x, 0.075),
      y: lerp(prev.y, targetRef.current.y, 0.075),
    }))

    rafRef.current = requestAnimationFrame(tick)
  }

  function cleanup() {
    document.body.style.cursor = ""

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
  }

  useEffect(() => {
    targetRef.current = targetPosition
  }, [targetPosition])

  useEffect(() => {
    if (shouldTick) {
      document.body.style.cursor = "none"
      tick()
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  }, [shouldTick])

  return shouldTick ? (
    <div
      className={cn(
        "flex items-center gap-1 fixed left-0 top-0 z-9999 pointer-events-none mix-blend-difference transition-opacity duration-1000 ease-out",
        isActive ? "opacity-100" : "opacity-0",
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-2.5px, -50%)`,
      }}
      aria-hidden
    >
      <span className="block w-[5px] h-[5px] bg-white" />
      <span className="font-[Helvetica] text-[10px] font-medium uppercase tracking-tight text-white mt-px">
        {text}
      </span>
    </div>
  ) : null
}
