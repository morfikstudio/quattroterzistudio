"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import gsap from "gsap"

const PHASE_1_DURATION = 0.85
const PAUSE_DURATION = 0.08
const PHASE_2_DURATION = 0.85

export function dispatchCurtainNavigate(url: string) {
  window.dispatchEvent(new CustomEvent("curtain:navigate", { detail: { url } }))
}

export default function CurtainTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const isTransitioningRef = useRef(false)

  /* Fase 2 — quando la nuova pagina è pronta, il curtain esce verso l'alto */
  useEffect(() => {
    if (!isTransitioningRef.current) return
    isTransitioningRef.current = false

    const curtain = curtainRef.current
    if (!curtain) return

    gsap.to(curtain, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: PHASE_2_DURATION,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(curtain, { clipPath: "inset(100% 0% 0% 0%)" })
      },
    })
  }, [pathname])

  /* Fase 1 — intercetta l'evento, copre lo schermo, poi naviga */
  useEffect(() => {
    const curtain = curtainRef.current

    const handleNavigate = (e: Event) => {
      const { url } = (e as CustomEvent<{ url: string }>).detail
      if (!curtain) {
        router.push(url)
        return
      }

      isTransitioningRef.current = true
      gsap.killTweensOf(curtain)
      gsap.set(curtain, { clipPath: "inset(100% 0% 0% 0%)" })

      gsap
        .timeline()
        .to(curtain, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: PHASE_1_DURATION,
          ease: "power3.inOut",
        })
        .to(curtain, { duration: PAUSE_DURATION })
        .call(() => router.push(url))
    }

    window.addEventListener("curtain:navigate", handleNavigate)
    return () => window.removeEventListener("curtain:navigate", handleNavigate)
  }, [router])

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[60] bg-black pointer-events-none"
      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      aria-hidden="true"
    />
  )
}
