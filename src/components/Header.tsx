"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

import { cn } from "@/utils/classNames"
import Contact from "@/components/Contact"
import { useNavigationStore } from "@/stores/navigationStore"
import { useContactStore } from "@/stores/contactStore"
import { dispatchCurtainNavigate } from "@/components/CurtainTransition"

const navLinkClass = cn("link-underline")
const navUnderlineClass = cn("link-underline-bar")

export default function Header() {
  const isContactOpen = useContactStore((s) => s.isOpen)
  const openContact = useContactStore((s) => s.open)
  const closeContact = useContactStore((s) => s.close)
  const pathname = usePathname()
  const setPreviousPath = useNavigationStore((s) => s.setPreviousPath)
  const navRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const splashEntryPlayedRef = useRef(false)

  useEffect(() => {
    navRef.current
      ?.querySelectorAll<HTMLElement>(".link-underline")
      .forEach((el) => delete el.dataset.line)
  }, [pathname])

  /*
    Splash → Header entry animation.
    Plays only when navigating away from "/" (i.e. from the splash) to any
    other route where the Header is rendered. Fires once per session — the
    ref persists across re-renders of this component.
      - Logo: y from 100% + opacity 0 → 1
      - Nav links: SplitText "lines" reveal (same pattern as TextTwoCol)
  */
  useLayoutEffect(() => {
    // Reset the one-shot flag while on "/" so the next splash exit re-plays
    // the entry animation.
    if (pathname === "/") {
      splashEntryPlayedRef.current = false
      return
    }
    if (splashEntryPlayedRef.current) return
    if (useNavigationStore.getState().previousPath !== "/") return
    splashEntryPlayedRef.current = true

    gsap.registerPlugin(SplitText)

    /*
      Small delay so the entry animations are visible while the splash is
      still dissolving on top (splash fade ~1.3s). Without it, the logo
      and links would reach their final state before the splash fully
      reveals them, and the user would miss the transition.
    */
    const entryDelay = 0.5

    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.set(logoRef.current, { yPercent: 100, opacity: 0 })
        gsap.to(logoRef.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          delay: entryDelay,
          ease: "power3.out",
        })
      }

      const textEls =
        navRef.current?.querySelectorAll<HTMLElement>("[data-split]") ?? []
      if (textEls.length) {
        const splits = Array.from(textEls).map(
          (el) => new SplitText(el, { type: "lines", mask: "lines" }),
        )
        const lines = splits.flatMap((s) => s.lines)

        gsap.set(lines, { yPercent: 110 })
        gsap.to(lines, {
          yPercent: 0,
          duration: 1.25,
          delay: entryDelay,
          ease: "power3.out",
          stagger: 0.03,
        })
      }
    })

    return () => {
      ctx.revert()
    }
  }, [pathname])

  if (pathname === "/") return null

  const isProjectsActive =
    pathname === "/projects" ||
    pathname === "/archive" ||
    pathname.startsWith("/archive/")
  const isAboutActive = pathname === "/about" || pathname.startsWith("/about/")
  const navItems = [
    { href: "/projects", label: "Works,", isActive: isProjectsActive },
    { href: "/about", label: "About,", isActive: isAboutActive },
  ]

  return (
    <>
      <nav
        className={cn("fixed top-0 left-0 w-full z-50", "mix-blend-difference")}
      >
        <div
          className={cn(
            "flex justify-between items-center",
            "mx-auto p-3 md:px-6 md:py-4",
          )}
        >
          <Link
            href="/"
            className="block text-white overflow-hidden"
            onClick={() => setPreviousPath("/")}
          >
            <div
              ref={logoRef}
              className={cn("logo", "group flex items-center")}
            >
              <div
                className={cn(
                  "rect bg-transparent relative",
                  "w-[44px] h-[33px] border-3 border-current",
                )}
              >
                <div
                  className={cn(
                    "rect-inner bg-current",
                    "absolute top-0 left-0 w-full h-full",
                    "[clip-path:polygon(0_0,_100%_0%,_100%_100%,_0%_100%)] transition-[clip-path] duration-900 ease-out group-hover:[clip-path:polygon(100%_0,_100%_0%,_100%_100%,_100%_100%)]",
                  )}
                ></div>
              </div>
              <div
                className={cn(
                  "text-container overflow-hidden",
                  "flex flex-col w-[120px]  pl-2",
                )}
              >
                <span
                  className={cn(
                    "text-1",
                    "uppercase text-[14px] font-medium",
                    "h-[16px] -translate-x-[120px] group-hover:translate-x-0",
                    "transition-transform duration-1500 delay-100 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  )}
                >
                  quattroterzi
                </span>
                <span
                  className={cn(
                    "text-2",
                    "uppercase text-[14px] font-medium",
                    "h-[16px] -translate-x-[120px] group-hover:translate-x-0",
                    "transition-transform duration-1500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  )}
                >
                  studio
                </span>
              </div>
            </div>
          </Link>
          <div
            ref={navRef}
            className={cn("flex gap-2", "type-menu text-white")}
          >
            {navItems.map((item) => {
              const needsCurtain =
                item.href === "/about" || pathname === "/about"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navLinkClass,
                    item.isActive && "text-active-link pointer-events-none",
                  )}
                  onClick={(e) => {
                    if (needsCurtain && !item.isActive) {
                      e.preventDefault()
                      setPreviousPath(pathname)
                      dispatchCurtainNavigate(item.href)
                    } else {
                      setPreviousPath(pathname)
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isActive) e.currentTarget.dataset.line = "in"
                  }}
                  onMouseLeave={(e) => {
                    if (!item.isActive) e.currentTarget.dataset.line = "out"
                  }}
                >
                  <span data-split>{item.label}</span>
                  {!item.isActive ? (
                    <span className={navUnderlineClass} />
                  ) : null}
                </Link>
              )
            })}
            <button
              onClick={() => openContact()}
              className={cn(navLinkClass, "cursor-pointer")}
              onMouseEnter={(e) => {
                e.currentTarget.dataset.line = "in"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.dataset.line = "out"
              }}
            >
              <span data-split>Contact</span>
              <span className={navUnderlineClass} />
            </button>
          </div>
        </div>
      </nav>

      <Contact isOpen={isContactOpen} onClose={closeContact} />
    </>
  )
}
