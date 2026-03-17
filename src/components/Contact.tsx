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

      tl.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1,
        ease: "power3.inOut",
      })
        .to(
          lines,
          {
            yPercent: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          marqueeEl,
          {
            yPercent: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.8",
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
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
    >
      {/* Header interno */}
      <div className="flex justify-between items-center p-3 md:p-7">
        <div className={cn("copyright")}>
          <span data-split className="text-[16px]">
            Copyright © quattroterzi 2026
          </span>
        </div>
        <Button
          icon={<Icon type="close" size="xxs" />}
          label="Close"
          onClick={onClose}
        />
      </div>

      {/* Contenuto */}
      <div className="flex-1 flex flex-col justify-end px-3 pb-3 md:px-7 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-start">
          <div className={cn("title", "md:flex-1 md:min-w-0")}>
            <h2 data-split className="w-[100%] md:w-[80%] type-h3 uppercase ">
              Images creLor fsvho iufsovhs fsvsc.
            </h2>
          </div>
          <div className="flex flex-col gap-[30px] md:grid md:grid-cols-2 md:gap-x-[48px] md:gap-y-[60px] md:flex-1 md:min-w-0">
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                address
              </span>
              <span data-split>
                Via 4 novembre
                <br />
                33170 brugnera pn
              </span>
            </div>
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                social
              </span>
              <a data-split href="tel:+393333333333">
                facebook
              </a>
              <a data-split href="tel:+393333333333">
                instagram
              </a>
            </div>{" "}
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                contact
              </span>
              <a data-split href="mailto:info@quattroterzi.com">
                info@quattroterzi.com
              </a>
              <a data-split href="tel:+393333333333">
                +39 333 333 33 33
              </a>
            </div>
            <div className="flex flex-col uppercase">
              <span data-split className="type-caption text-secondary mb-2">
                legal
              </span>
              <a data-split href="tel:+393333333333">
                +privacy
              </a>
              <a data-split href="tel:+393333333333">
                cookies
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div ref={marqueeRef} className="overflow-hidden">
        <Marquee />
      </div>
    </div>
  )
}
