"use client"

import { useEffect, useState } from "react"

/**
 * True when the UA reports `(pointer: coarse)` as primary (typical phones /
 * tablets). Unlike `maxTouchPoints`, hybrid laptops usually stay `false`,
 * so GSAP scroll snap can stay enabled for trackpad/desktop use.
 */
export function usePointerCoarse() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    const sync = () => setCoarse(mq.matches)

    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return coarse
}
