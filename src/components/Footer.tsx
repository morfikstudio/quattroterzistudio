"use client"
import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { cn } from "@/utils/classNames"

export default function Footer() {
  const logoRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!logoRef.current) return

    gsap.registerPlugin(SplitText, ScrollTrigger)

    const ctx = gsap.context(() => {
      const textEls =
        logoRef.current?.querySelectorAll<HTMLElement>("[data-split]") ?? []
      if (!textEls.length) return

      const splits = Array.from(textEls).map(
        (el) => new SplitText(el, { type: "lines", mask: "lines" }),
      )
      const lines = splits.flatMap((s) => s.lines)

      gsap.set(lines, { yPercent: 110 })
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: logoRef.current,
          start: "top 85%",
        },
      })

      return () => {
        splits.forEach((s) => s.revert())
      }
    }, logoRef)

    return () => {
      ctx.revert()
    }
  }, [])

  useLayoutEffect(() => {
    if (!bottomRef.current) return

    gsap.registerPlugin(SplitText, ScrollTrigger)

    const ctx = gsap.context(() => {
      const textEls =
        bottomRef.current?.querySelectorAll<HTMLElement>("[data-split]") ?? []
      if (!textEls.length) return

      const allSplits = Array.from(textEls).map((el) => {
        const split = new SplitText(el, { type: "lines", mask: "lines" })
        gsap.set(split.lines, { yPercent: 110 })
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 1.25,
          ease: "power3.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
        })
        return split
      })

      return () => {
        allSplits.forEach((s) => s.revert())
      }
    }, bottomRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <footer className={cn("footer bg-black text-white h-svh")}>
      <div className="p-4 flex flex-col justify-between h-full">
        <div
          ref={logoRef}
          className={cn(
            "logo",
            "uppercase text-[12.5vw] md:text-[13vw] w-full",
            "flex flex-col items-end justify-end",
          )}
        >
          <span data-split className="leading-none font-medium">
            quattroterzi
          </span>
          <span data-split className="leading-none font-thin -mt-[1vw]">
            studio
          </span>
        </div>
        <div
          ref={bottomRef}
          className={cn("footer-bottom", "flex flex-col gap-16", "md:gap-20")}
        >
          <div
            className={cn(
              "contact",
              "flex flex-col gap-12",
              "md:flex-row md:justify-between md:items-center",
            )}
          >
            <div className={cn("text", "type-body-l uppercase")}>
              <span data-split>Ready to discuss your project?</span>
            </div>
            <div className={cn("button")}>
              <Button icon={<Icon type="close" size="xxs" />} label="Contact" />
            </div>
          </div>
          <div
            className={cn(
              "infos",
              "type-caption uppercase",
              "flex flex-col-reverse gap-2",
              "md:flex-row md:justify-between md:items-center",
            )}
          >
            <div className="copyright">
              <span>Copyright © quattroterzi 2026</span>
            </div>
            <div
              className={cn(
                "terms",
                "flex flex-col gap-2",
                "md:flex-row md:justify-between md:items-center md:gap-10",
              )}
            >
              <a href="https://www.google.com">Privacy</a>
              <a href="https://www.google.com">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
