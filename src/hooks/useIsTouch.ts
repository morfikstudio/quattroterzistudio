"use client"

import { useEffect, useState } from "react"

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    )
  }, [])
  return isTouch
}
