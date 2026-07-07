"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import gsap from "gsap"

const PHASE_1_DURATION = 0.85
const PAUSE_DURATION = 0.015
const PHASE_2_DURATION = 0.85
// Max time Phase 2 waits for the destination content before revealing anyway,
// so the curtain never gets stuck if an image fails or is very slow to load.
const CONTENT_READY_TIMEOUT = 4000

export function dispatchCurtainNavigate(url: string) {
  window.dispatchEvent(new CustomEvent("curtain:navigate", { detail: { url } }))
}

/*
  Coordination between the curtain and the destination page: Phase 2 (the
  reveal) waits until the incoming view signals its first content is painted
  (the project Hero cover image loaded), so we never reveal a blank/white frame
  before the image pops in.
*/
let contentReady = false
let readyWaiter: (() => void) | null = null

/** Reset the latch at the start of each navigation. */
function resetCurtainContentReady() {
  contentReady = false
  readyWaiter = null
}

/** Called by the destination view when its first content is ready. */
export function signalCurtainContentReady() {
  contentReady = true
  const waiter = readyWaiter
  readyWaiter = null
  waiter?.()
}

/** Run `cb` once content is ready, or after a fallback timeout. */
function whenContentReady(cb: () => void) {
  if (contentReady) {
    cb()
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    readyWaiter = null
    cb()
  }
  readyWaiter = finish
  window.setTimeout(finish, CONTENT_READY_TIMEOUT)
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

    // Wait for the destination content (Hero image) before revealing, so the
    // curtain doesn't lift onto a blank frame.
    whenContentReady(() => {
      gsap.to(curtain, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: PHASE_2_DURATION,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(curtain, { clipPath: "inset(100% 0% 0% 0%)" })
        },
      })
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
      resetCurtainContentReady()
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
