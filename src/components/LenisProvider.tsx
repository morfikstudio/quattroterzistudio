"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import type { LenisOptions } from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)

const defaultEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))

function getLenisOptions(): LenisOptions {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  return {
    autoRaf: false,
    duration: prefersReducedMotion ? 0 : 1.25,
    easing: defaultEasing,
    syncTouch: false,
    anchors: true,
    smoothWheel: !prefersReducedMotion,
  }
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const pathname = usePathname()

  // create lenis instance and wire GSAP ticker
  useEffect(() => {
    const lenisInstance = new Lenis(getLenisOptions())

    const rafHandler = (time: number) => lenisInstance.raf(time * 1000)
    gsap.ticker.add(rafHandler)
    gsap.ticker.lagSmoothing(0)
    lenisInstance.on("scroll", ScrollTrigger.update)

    setLenis(lenisInstance)
    return () => {
      gsap.ticker.remove(rafHandler)
      lenisInstance.destroy()
      setLenis(null)
    }
  }, [])

  // scroll to top on route change
  useEffect(() => {
    if (!lenis) return
    lenis.scrollTo(0, { immediate: true, force: true })
  }, [lenis, pathname])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}
