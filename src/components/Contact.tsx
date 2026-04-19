"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

import { cn } from "@/utils/classNames"
import Button from "@/components/ui/Button"
import Icon, { Icons } from "./ui/Icon"
import Marquee from "@/components/ui/Marquee"

gsap.registerPlugin(SplitText)

interface ContactProps {
  isOpen: boolean
  onClose: () => void
}

export default function Contact({ isOpen, onClose }: ContactProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    tlRef.current?.kill()

    const textEls = el.querySelectorAll<HTMLElement>("[data-split]")

    const marqueeEl = marqueeRef.current

    if (isOpen) {
      const splits = Array.from(textEls).map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )

      const lines = splits.flatMap((s) => s.lines)
      gsap.set(lines, { yPercent: 110 })
      if (marqueeEl) gsap.set(marqueeEl, { yPercent: 100 })

      gsap.set(el, { pointerEvents: "auto" })

      const tl = gsap.timeline()
      tlRef.current = tl

      // Marquee e apertura pannello partono subito; le righe di testo dopo, così il marquee anticipa.
      if (marqueeEl) {
        tl.to(
          marqueeEl,
          {
            yPercent: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          0,
        )
      }
      tl.to(
        el,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "power3.inOut",
        },
        0,
      ).to(
        lines,
        {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
        },
        0.35,
      )

      return () => {
        splits.forEach((s) => s.revert())
      }
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, { pointerEvents: "none" })
          if (marqueeEl) gsap.set(marqueeEl, { yPercent: 100 })
        },
      })
      tlRef.current = tl

      tl.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1,
        ease: "power3.inOut",
      })
    }

    return () => {
      tlRef.current?.kill()
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      style={{ clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "none" }}
      className={cn(
        "bg-black text-white",
        "fixed inset-0 z-[100]  flex flex-col",
      )}
    >
      {/* Header interno */}
      <div className="flex justify-between items-center px-3 pt-6 md:px-6">
        <div className={cn("copyright md:block hidden")}>
          <span data-split className="text-[16px]">
            Copyright © quattroterzi 2026
          </span>
        </div>
        <div className="ml-auto items-end">
          <Button
            icon={<Icon type="close" size="xs" />}
            label="Close"
            onClick={onClose}
            size="l"
            variant="close"
          />
        </div>
      </div>

      {/* Contenuto */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-start",
          "px-3 pb-3 pt-14",
          "md:justify-end  md:pt-0 md:px-7 md:pb-12",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-start">
          <div
            className={cn("title mb-[30px] md:mb-0", "md:flex-1 md:min-w-0")}
          >
            <h2
              data-split
              className={cn("type-h3 uppercase", "w-[100%] md:w-[80%]  ")}
            >
              image creators & shadows lovers
            </h2>
          </div>
          <div
            className={cn(
              "contact-grid",
              "flex flex-col gap-[30px]",
              "md:grid md:grid-cols-2 md:gap-x-[48px] md:gap-y-[60px] md:flex-1 md:min-w-0",
            )}
          >
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                address
              </span>
              <span data-split>
                Via IV Novembre 2
                <br />
                33170 brugnera pn
              </span>
            </div>
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                social
              </span>
              <a
                href="https://www.linkedin.com/company/quattroterzi-studio-sas/about/"
                target="_blank"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>linkedin</span>
                <span className="link-underline-bar" />
              </a>
              <a
                target="_blank"
                href="https://www.instagram.com/quattroterzistudio/"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>instagram</span>
                <span className={cn("link-underline-bar")} />
              </a>
            </div>{" "}
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                contact
              </span>
              <a
                href="mailto:info@quattroterzi.com"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>info@quattroterzi.com</span>
                <span className={cn("link-underline-bar")} />
              </a>
              <a
                href="tel:+39 3515990023"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>++39 351 599 0023</span>
                <span className={cn("link-underline-bar")} />
              </a>
            </div>
            <div className="flex-col uppercase hidden md:flex">
              <span data-split className="type-caption text-secondary mb-2">
                legal
              </span>
              <a
                href="tel:+393333333333"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>privacy</span>
                <span className={cn("link-underline-bar")} />
              </a>
              <a
                href="tel:+393333333333"
                className={cn("link-underline w-fit")}
                onMouseEnter={(e) => {
                  e.currentTarget.dataset.line = "in"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.line = "out"
                }}
              >
                <span data-split>cookies</span>
                <span className={cn("link-underline-bar")} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div ref={marqueeRef} className="overflow-x-hidden">
        <Marquee />
      </div>
    </div>
  )
}
