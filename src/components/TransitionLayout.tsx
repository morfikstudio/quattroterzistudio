"use client"

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

// Rettangolo pieno
const CLIP_FULL = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
// Collassato sulla riga superiore
const CLIP_TOP = "polygon(0 0, 100% 0, 100% 0, 0 0)"

/*
  Durante la transizione i container diventano position:fixed inset:0.
  transform:translate3d(0,0,0) crea un nuovo containing block per i figli
  position:fixed (thumbnail, titoli…) che restano soggetti al clip-path del parent.
*/
const TRANSITION_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  transform: "translate3d(0,0,0)",
}

export default function TransitionLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children)
  const [currentPath, setCurrentPath] = useState(pathname)

  const wrapRef = useRef<HTMLDivElement>(null)
  const outgoingRef = useRef<HTMLDivElement>(null)
  const incomingRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (pathname === currentPath) return

    const outgoing = outgoingRef.current
    const incoming = incomingRef.current
    if (!outgoing || !incoming) return

    gsap.killTweensOf([outgoing, incoming])

    const ctx = gsap.context(() => {
      const done = () => {
        gsap.set([outgoing, incoming], { clearProps: "all" })
        setDisplayChildren(children)
        setCurrentPath(pathname)
      }

      // ─── /projects → /archive ────────────────────────────────────────────────
      // Outgoing (projects) si richiude verso l'alto con clip-path.
      // Fix scroll: il contenuto della pagina va traslato di -scrollY in modo
      // che il wipe parta dalla posizione viewport corrente, non dalla cima del
      // documento (che potrebbe essere sopra il fold quando si è scrollati).
      if (currentPath === "/projects" && pathname === "/archive") {
        const scrollY = window.scrollY

        const pageContent = outgoing.firstElementChild as HTMLElement | null
        if (pageContent) {
          gsap.set(pageContent, { y: -scrollY })
        }

        gsap.set(outgoing, { clipPath: CLIP_FULL, zIndex: 2 })
        gsap.set(incoming, { zIndex: 1 })

        gsap.to(outgoing, {
          clipPath: CLIP_TOP,
          duration: 0.85,
          ease: "power3.inOut",
          onComplete: done,
        })
        return
      }

      // ─── /archive → /projects ────────────────────────────────────────────────
      // Incoming (projects) si apre dall'alto verso il basso con clip-path.
      if (currentPath === "/archive" && pathname === "/projects") {
        gsap.set(incoming, { clipPath: CLIP_TOP, zIndex: 2 })
        gsap.set(outgoing, { zIndex: 1 })

        gsap.to(incoming, {
          clipPath: CLIP_FULL,
          duration: 0.85,
          ease: "power3.inOut",
          onComplete: done,
        })
        return
      }

      // ─── Default: cross-fade ─────────────────────────────────────────────────
      gsap
        .timeline({ onComplete: done })
        .to(outgoing, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0)
        .fromTo(
          incoming,
          { opacity: 0 },
          { opacity: 1, duration: 0.55, ease: "power2.in" },
          0.65,
        )
    }, wrapRef)

    return () => ctx.kill()
  }, [children, pathname])

  const isTransitioning = pathname !== currentPath

  return (
    <div ref={wrapRef} className="relative w-full min-h-svh">
      <div
        ref={outgoingRef}
        style={isTransitioning ? TRANSITION_STYLE : undefined}
      >
        {displayChildren}
      </div>

      {isTransitioning && (
        <div ref={incomingRef} style={TRANSITION_STYLE}>
          {children}
        </div>
      )}
    </div>
  )
}
