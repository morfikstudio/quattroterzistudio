"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { cn } from "@/utils/classNames"
import Contact from "@/components/Contact"
import { useNavigationStore } from "@/stores/navigationStore"
import { dispatchCurtainNavigate } from "@/components/CurtainTransition"

const navLinkClass = cn("link-underline")
const navUnderlineClass = cn("link-underline-bar")

export default function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const pathname = usePathname()
  const setPreviousPath = useNavigationStore((s) => s.setPreviousPath)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    navRef.current
      ?.querySelectorAll<HTMLElement>(".link-underline")
      .forEach((el) => delete el.dataset.line)
  }, [pathname])

  if (pathname === "/") return null

  const isProjectsActive =
    pathname === "/projects" ||
    pathname.startsWith("/projects/") ||
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
            className="block text-white"
            onClick={() => setPreviousPath("/")}
          >
            <div className={cn("logo", "group flex items-center")}>
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
                  {item.label}
                  {!item.isActive ? (
                    <span className={navUnderlineClass} />
                  ) : null}
                </Link>
              )
            })}
            <button
              onClick={() => setIsContactOpen(true)}
              className={cn(navLinkClass, "cursor-pointer")}
              onMouseEnter={(e) => {
                e.currentTarget.dataset.line = "in"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.dataset.line = "out"
              }}
            >
              Contact
              <span className={navUnderlineClass} />
            </button>
          </div>
        </div>
      </nav>

      <Contact isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  )
}
