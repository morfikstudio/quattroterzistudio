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
      // Exit animation is handled by ProjectsScroll before navigation
      if (currentPath === "/projects" && pathname === "/archive") {
        done()
        return
      }

      // ─── /archive → /projects ────────────────────────────────────────────────
      // Entrance animation is handled by ProjectsScroll on mount
      if (currentPath === "/archive" && pathname === "/projects") {
        done()
        return
      }

      // ─── Default: cross-fade (mobile only) ───────────────────────────────────
      // Usato ad esempio per /projects → /projects/[slug] dove l'expand della
      // thumbnail è già completato prima di router.push: il cross-fade dà
      // continuità visiva tra la thumbnail espansa e il project detail.
      // Su desktop la transizione viene saltata perché l'expand gestisce già tutto.
      if (window.innerWidth >= 1024) {
        done()
        return
      }
      gsap.set(incoming, { opacity: 0 })
      gsap
        .timeline({ onComplete: done })
        .to(outgoing, { opacity: 0, duration: 0.35, ease: "power2.out" }, 0)
        .to(incoming, { opacity: 1, duration: 0.35, ease: "power2.in" }, 0.2)
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
        <div ref={incomingRef} style={{ ...TRANSITION_STYLE, opacity: 0 }}>
          {children}
        </div>
      )}
    </div>
  )
}
