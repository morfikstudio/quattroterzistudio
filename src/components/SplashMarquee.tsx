"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import gsap from "gsap"

import { cn } from "@/utils/classNames"
import { useCursorStore } from "@/stores/cursorStore"
import { useNavigationStore } from "@/stores/navigationStore"
import { useIsTouch } from "@/hooks/useIsTouch"

const MARQUEE_X_OFFSET = -0.75

type SplashProps = {
  title: string
  ctaText: string
}

export default function Splash({ title, ctaText }: SplashProps) {
  const router = useRouter()
  const pathname = usePathname()
  const setCursor = useCursorStore((s) => s.setCursor)
  const isTouch = useIsTouch()

  /*
    Splash is mounted inside the layout and persists across route changes.
    Visibility is gated by the pathname:
      - pathname === "/"  → show splash (landing or logo click from another route)
      - during the exit animation we keep `visible = true` even after pathname
        becomes "/projects", so the splash stays on top until its tween completes
      - at animation end, `setVisible(false)` unmounts the DOM
  */
  const [visible, setVisible] = useState(() => pathname === "/")

  useEffect(() => {
    if (pathname === "/") {
      isLeavingRef.current = false
      setVisible(true)
    }
  }, [pathname])

  const wrapRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const centerXRef = useRef(0)
  const isLeavingRef = useRef(false)

  const renderTitleWords = useCallback(
    (prefix: string) => {
      const titleWords = title.trim().split(/\s+/).filter(Boolean)

      return (
        <div
          className={cn(
            "inline-block px-[0.25em]",
            "font-[Helvetica] text-[clamp(3rem,15vw,10rem)] font-medium uppercase leading-none",
          )}
        >
          {titleWords.map((word, wordIndex) => (
            <span
              key={`${prefix}-word-${wordIndex}`}
              className="inline-block align-bottom"
            >
              {word.split("").map((letter, letterIndex) => (
                <span
                  key={`${prefix}-${wordIndex}-${letterIndex}`}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <span
                    className="inline-block -mx-[0.01em]"
                    data-splash-letter
                  >
                    {letter}
                  </span>
                </span>
              ))}
              {wordIndex < titleWords.length - 1 ? (
                <span className="inline-block overflow-hidden align-bottom">
                  <span className="inline-block" data-splash-letter>
                    {"\u00A0"}
                  </span>
                </span>
              ) : null}
            </span>
          ))}
        </div>
      )
    },
    [title],
  )

  const marqueeX = useCallback(() => {
    return centerXRef.current * (1 + MARQUEE_X_OFFSET)
  }, [])

  /**
   * Initialize marquee animation
   */
  useLayoutEffect(() => {
    if (!visible) return

    const ctx = gsap.context(() => {
      if (!wrapRef.current || !marqueeRef.current) return

      const marqueeEl = marqueeRef.current
      const letters = Array.from(
        marqueeEl.querySelectorAll<HTMLElement>("[data-splash-letter]"),
      ).filter(Boolean)
      centerXRef.current = window.innerWidth / 2
      const marqueeLoopTime = title.length * 0.7

      // Svela gli elementi nascosti inline (opacity:0 / visibility:hidden)
      // solo ora, così non c'è flash al primo paint.
      gsap.set(rectRef.current, { opacity: 1 })
      gsap.set(marqueeEl, { visibility: "visible" })

      gsap
        .timeline({
          delay: 0.5,
        })
        .set(marqueeEl, { xPercent: 0, x: marqueeX(), force3D: false }, 0)
        .from(
          rectRef.current,
          {
            scale: 0.25,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
          },
          0,
        )
        .from(
          letters,
          {
            yPercent: 100,
            stagger: 0.05,
            duration: 0.9,
            delay: 0.2,
            ease: "expo.out",
            force3D: false,
          },
          0,
        )
        .to(
          marqueeEl,
          {
            xPercent: -(100 / 3),
            duration: marqueeLoopTime,
            ease: "none",
          },
          0,
        )
        .fromTo(
          marqueeEl,
          { xPercent: -(100 / 3), x: marqueeX },
          {
            xPercent: -(200 / 3),
            x: marqueeX,
            duration: marqueeLoopTime,
            ease: "none",
            repeat: -1,
          },
        )
    }, wrapRef)

    return () => {
      ctx?.revert()
    }
  }, [title, marqueeX, visible])

  /**
   * Update marquee x position when window is resized
   */
  useEffect(() => {
    const onResize = () => {
      centerXRef.current = window.innerWidth / 2
      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { x: marqueeX() })
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [marqueeX])

  /**
   * Show custom text cursor while splash is visible
   */
  useEffect(() => {
    if (!visible) return
    setCursor(true)
    return () => setCursor(false)
  }, [setCursor, visible])

  /**
   * Splash exit animation — /projects viene montata subito sotto il wrap
   * (z-[9999]) grazie a router.push anticipato; il rect nero si espande E
   * contemporaneamente l'intero wrap (rect + bg bianco + lettere) fa fade out,
   * così mentre il rettangolo cresce diventa anche sempre più trasparente e
   * rivela /projects sotto.
   */
  const handleEnter = useCallback(() => {
    if (isLeavingRef.current || !rectRef.current || !wrapRef.current) return
    isLeavingRef.current = true

    // 1. Anticipa la navigazione: /projects comincia a montarsi in background
    //    mentre lo splash si dissolve sopra.
    useNavigationStore.getState().setPreviousPath(window.location.pathname)
    router.push("/projects")

    const el = rectRef.current
    const wrap = wrapRef.current
    const box = el.getBoundingClientRect()

    if (marqueeRef.current) gsap.killTweensOf(marqueeRef.current)

    // Fissa il rect alla sua posizione corrente (coordinate relative al fixed parent)
    gsap.set(el, {
      position: "absolute",
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
      xPercent: 0,
      yPercent: 0,
      x: 0,
      y: 0,
      maxWidth: "none",
    })

    const expandDuration = 1.3
    const fadeDelay = 0.3

    // 2. Rect si espande a full-screen
    gsap.to(el, {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      duration: expandDuration,
      ease: "expo.inOut",
    })

    // 3. Lettere del marquee fade out rapido — devono sparire prima che
    //    il wrap inizi a dissolversi.
    const letters = wrap.querySelectorAll<HTMLElement>("[data-splash-letter]")
    if (letters.length) {
      gsap.to(letters, {
        opacity: 0,
        duration: 0.65,
        ease: "power2.in",
      })
    }

    // 4. Wrap intero (bg + rect) si dissolve con un piccolo delay rispetto
    //    all'espansione, così il rect resta pieno all'inizio e inizia a
    //    svanire solo quando l'espansione è già in corso.
    gsap.to(wrap, {
      opacity: 0,
      duration: expandDuration,
      delay: fadeDelay,
      ease: "power2.inOut",
      onComplete: () => {
        setCursor(false)
        setVisible(false)
      },
    })

    // ProjectsScroll si auto-triggera la reveal animation quando `show`
    // diventa true e previousPath è "/", quindi qui non serve più dispatch.
  }, [setCursor, router])

  if (!visible) return null

  return (
    <div
      ref={wrapRef}
      onClick={handleEnter}
      className="fixed inset-0 z-[9999] cursor-none bg-white"
    >
      <div
        ref={rectRef}
        className={cn(
          "absolute aspect-4/3 bg-black",
          "w-full max-w-[65vw] md:max-w-[75vw] lg:max-w-[35vw]",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={{ opacity: 0 }}
      />

      <div
        className="absolute inset-0 z-10 flex items-center overflow-hidden mix-blend-difference"
        aria-hidden
      >
        <div
          ref={marqueeRef}
          className="inline-flex whitespace-nowrap text-white"
          style={{ visibility: "hidden" }}
        >
          {/* 0.5em/1em -> center letters vertically to compensate for the Helvetica line height */}
          <div className="flex translate-y-[0.5em] lg:translate-y-[1em]">
            {renderTitleWords("title-1")}
            {renderTitleWords("title-2")}
            {renderTitleWords("title-3")}
          </div>
        </div>
      </div>

      {isTouch && (
        <span
          className={cn(
            "absolute bottom-25 left-1/2 -translate-x-1/2",
            "font-[Helvetica] text-[12px] font-medium uppercase text-black",
          )}
        >
          {ctaText}
        </span>
      )}
    </div>
  )
}
