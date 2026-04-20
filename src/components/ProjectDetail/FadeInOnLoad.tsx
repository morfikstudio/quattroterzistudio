"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

let hasAnimated = false

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function isDirectLoad() {
  if (typeof window === "undefined") return false
  if (hasAnimated) return false

  const entries = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[]
  const nav = entries[0]
  if (!nav) return false

  try {
    const initialPath = new URL(nav.name).pathname
    return initialPath === window.location.pathname
  } catch {
    return false
  }
}

export default function FadeInOnLoad({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!isDirectLoad()) return
    const el = ref.current
    if (!el) return

    hasAnimated = true
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
    )
  }, [])

  return <div ref={ref}>{children}</div>
}
