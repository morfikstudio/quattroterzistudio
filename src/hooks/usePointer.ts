"use client"

import { useCallback, useEffect, useState } from "react"

export type UsePointerReturn = {
  position: { x: number; y: number }
  isActive: boolean
  isDown: boolean
}

export function usePointer(): UsePointerReturn {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isActive, setIsActive] = useState(false)
  const [isDown, setIsDown] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
    setIsActive(true)
  }, [])

  const handleClick = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
    setIsActive(true)
  }, [])

  const handleMouseDown = useCallback(() => setIsDown(true), [])
  const handleMouseUp = useCallback(() => setIsDown(false), [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleClick, handleMouseDown, handleMouseUp])

  return { position, isActive, isDown }
}
