"use client"
import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLenis } from "@/components/LenisProvider"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { useBreakpoint } from "@/stores/breakpointStore"
import { cn } from "@/utils/classNames"

export default function Footer() {
  const logoRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const { current: breakpoint } = useBreakpoint()
  const buttonSize =
    breakpoint === "mobile" || breakpoint === "mobileLandscape" ? "l" : "xl"

  useLayoutEffect(() => {
    if (!lenis || !logoRef.current) return

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
          invalidateOnRefresh: true,
        },
      })

      return () => {
        splits.forEach((s) => s.revert())
      }
    }, logoRef)

    return () => {
      ctx.revert()
    }
  }, [lenis])

  useLayoutEffect(() => {
    if (!lenis || !bottomRef.current) return

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
            invalidateOnRefresh: true,
          },
        })
        return split
      })

      const readyTriggerEl =
        bottomRef.current?.querySelector<HTMLElement>("[data-ready-trigger]") ??
        null
      const buttonEl =
        bottomRef.current?.querySelector<HTMLElement>("[data-button-reveal]") ??
        null
      if (buttonEl) {
        gsap.set(buttonEl, { yPercent: 110 })
        gsap.to(buttonEl, {
          yPercent: 0,

          duration: 1.25,
          ease: "power3.out",
          scrollTrigger: {
            trigger: readyTriggerEl ?? buttonEl,
            start: "top 90%",
            invalidateOnRefresh: true,
          },
        })
      }

      return () => {
        allSplits.forEach((s) => s.revert())
      }
    }, bottomRef)

    return () => {
      ctx.revert()
    }
  }, [lenis])

  return (
    <footer className={cn("footer bg-black text-white h-svh")}>
      <div className="md:px-6 md:py-8 p-4 flex flex-col justify-between h-full">
        <div
          ref={logoRef}
          className={cn(
            "uppercase text-[12.5vw] md:text-[13vw] w-full tracking-[-0.015em] overflow-hidden",
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
              "md:flex-row md:items-center md:gap-8",
            )}
          >
            <div className={cn("type-body-l uppercase md:flex-1")}>
              <span data-split data-ready-trigger>
                Tell us what you see.
              </span>
            </div>
            <div
              className={cn(
                "button max-h-[80px] md:flex-1 md:flex md:justify-start ",
              )}
              data-button-reveal
            >
              <Button
                icon={
                  <Icon
                    type="arrowRight"
                    size={buttonSize === "l" ? "l" : "xxl"}
                  />
                }
                label="Contact us"
                size="xl"
              />
            </div>
          </div>
          <div
            className={cn(
              "infos",
              "type-caption uppercase",
              "flex flex-col-reverse gap-2",
              "md:flex-row md:items-center md:gap-8",
            )}
          >
            <div className="copyright md:flex-1">
              <span>Copyright © quattroterzi 2026</span>
            </div>
            <div
              className={cn(
                "terms",
                "flex flex-col gap-2",
                "md:flex-1 md:flex-row md:justify-start md:items-center md:gap-10",
              )}
            >
              <a href="https://www.google.com">Privacy</a>
              <a href="https://www.google.com">Cookies</a>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => lenis?.scrollTo(0, { duration: 1.5 })}
        className={cn(
          "btt",
          "md:hidden block absolute bottom-4.5 right-4",
          "flex items-center gap-2 cursor-pointer",
        )}
      >
        <Icon type="arrowUp" size="xs" />
        <span className="font-medium uppercase text-[12px] leading-none">
          Back to top
        </span>
      </button>
    </footer>
  )
}
