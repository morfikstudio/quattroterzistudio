"use client"

import { useEffect, useState } from "react"

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsTouch(
        typeof window !== "undefined" &&
          ("ontouchstart" in window || navigator.maxTouchPoints > 0),
      )
    }

    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isTouch
}
