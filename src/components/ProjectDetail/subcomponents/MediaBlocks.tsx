"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import SplitText from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import {
  SINGLE_MEDIA_VARIANTS,
  DOUBLE_MEDIA_VARIANTS,
} from "@/constants/projectMediaVariants"
import { cn } from "@/utils/classNames"

import { useLenis, useAnimationKey } from "@/components/LenisProvider"
import Image from "@/components/ui/Image"

gsap.registerPlugin(SplitText, ScrollTrigger)

type MediaBlocksProps = {
  blocks: NonNullable<PROJECT_QUERY_RESULT>["blocks"]
}

/*
 * Returns the media layout for a given variant.
 * @param type - The type of media block.
 * @param variant - The variant of the media block (e.g. "float-left-l", "50-50", etc.)
 */
function getMediaLayoutByVariant(
  type: "projectMediaSingle" | "projectMediaDouble",
  variant: string | null | undefined,
): any {
  switch (type) {
    case "projectMediaSingle":
      return (
        SINGLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.layout ??
        "col-span-12 w-full min-w-0"
      )
    case "projectMediaDouble":
      return {
        layout1:
          DOUBLE_MEDIA_VARIANTS.find((item) => item.value === variant)
            ?.layout1 ?? DOUBLE_MEDIA_VARIANTS[0].layout1,
        layout2:
          DOUBLE_MEDIA_VARIANTS.find((item) => item.value === variant)
            ?.layout2 ?? DOUBLE_MEDIA_VARIANTS[0].layout2,
      }
    default:
      return ""
  }
}

export default function MediaBlocks({ blocks }: MediaBlocksProps) {
  const lenis = useLenis()
  const animationKey = useAnimationKey()
  const wrapRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!lenis || !wrapRef.current) return

    function getBlockElements(selector: string) {
      return wrapRef.current
        ? Array.from(
            wrapRef.current.querySelectorAll<HTMLElement>(selector) ?? [],
          )
        : []
    }

    const payoffsAnimations = () => {
      const payoffs = getBlockElements("[data-block-payoff]")
      if (payoffs.length === 0) return

      payoffs.forEach((payoff: HTMLElement) => {
        const payoffLines = Array.from([payoff])
          .filter(Boolean)
          .map((el) => new SplitText(el, { type: "lines", mask: "lines" }))
          .flatMap((s) => s.lines)

        gsap.killTweensOf(payoffLines)
        gsap.set(payoffLines, { yPercent: 110 })

        gsap.to(payoffLines, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: payoff,
            start: "top 75%",
            invalidateOnRefresh: true,
          },
        })

        /*
         * After re-running SplitText,
         * a second ScrollTrigger.refresh() is needed to ensure trigger positions
         * are recalculated with the stable, post-SplitText layout.
         */
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    }

    const mediaSingleAnimations = () => {
      const mediaSindles = getBlockElements("[data-block-media-single]")
      if (mediaSindles.length === 0) return

      mediaSindles.forEach((mediaSingle: HTMLElement) => {
        if (!mediaSingle) return

        const mediaInner = mediaSingle.firstChild as HTMLDivElement
        if (!mediaInner) return
        const mediaImg = mediaInner.firstChild as HTMLDivElement
        if (!mediaImg) return

        gsap.killTweensOf([mediaInner, mediaImg])
        gsap.set(mediaInner, {
          opacity: 0,
          y: 48,
          clipPath: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
        })
        gsap.set(mediaImg, {
          scale: 1.5,
          transformOrigin: "center center",
        })

        gsap
          .timeline({
            scrollTrigger: {
              trigger: mediaSingle,
              start: "top 75%",
              invalidateOnRefresh: true,
            },
          })
          .to(
            mediaInner,
            {
              opacity: 1,
              y: 0,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              ease: "power3.out",
            },
            0,
          )
          .to(
            mediaImg,
            {
              scale: 1,
              duration: 1.5,
              ease: "power3.out",
            },
            0,
          )
      })
    }

    const mediaDoubleMarginsSetup = () => {
      const mediaDoubles = getBlockElements("[data-block-media-double]")
      if (mediaDoubles.length === 0) return

      mediaDoubles.forEach((mediaDouble) => {
        if (!mediaDouble) return

        const [media1, media2] = Array.from(mediaDouble.children || [])
        if (!media1 || !media2) return

        const img1 = media1.firstChild as HTMLImageElement
        const img2 = media2.firstChild as HTMLImageElement
        if (!img1 || !img2) return

        const variant = mediaDouble.getAttribute(
          "data-block-media-double-variant",
        )
        if (!variant) return

        switch (true) {
          case variant === "50-51" ||
            variant === "40-50" ||
            variant === "30-50":
            gsap.set(media1, { marginTop: img2.clientHeight * 0.5 })
            break
          case variant === "51-50" ||
            variant === "50-40" ||
            variant === "50-30":
            gsap.set(media2, { marginTop: img1.clientHeight * 0.5 })
            break
          default:
            break
        }
      })
    }

    const mediaDoubleAnimations = () => {
      const mediaDoubles = getBlockElements("[data-block-media-double]")
      if (mediaDoubles.length === 0) return

      mediaDoubles.forEach((mediaDouble: HTMLElement) => {
        if (!mediaDouble) return

        const [media1, media2] = Array.from(mediaDouble.children || [])
        if (!media1 || !media2) return

        const img1 = media1.firstChild as HTMLImageElement
        const img2 = media2.firstChild as HTMLImageElement
        if (!img1 || !img2) return

        const animationElements = [
          { mediaInner: media1, mediaImg: img1 },
          { mediaInner: media2, mediaImg: img2 },
        ]

        animationElements.forEach(({ mediaInner, mediaImg }) => {
          const y = 48

          gsap.killTweensOf([mediaInner, mediaImg])
          gsap.set(mediaInner, {
            opacity: 0,
            y,
            clipPath: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
          })
          gsap.set(mediaImg, {
            scale: 1.5,
            transformOrigin: "center center",
          })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: mediaInner,
                start: `top-=${y}px 75%`,
                invalidateOnRefresh: true,
              },
            })
            .to(
              mediaInner,
              {
                opacity: 1,
                y: 0,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1,
                ease: "power3.out",
              },
              0,
            )
            .to(
              mediaImg,
              {
                scale: 1,
                duration: 1.5,
                ease: "power3.out",
              },
              0,
            )
        })
      })
    }

    let raf: number | null = null
    const onResize = () => {
      if (raf !== null) return
      raf = window.requestAnimationFrame(() => {
        raf = null
        ctx.add(() => mediaDoubleMarginsSetup())
        ScrollTrigger.refresh()
      })
    }

    const ctx = gsap.context(() => {
      /* PAYOFF TRANSITIONS */
      payoffsAnimations()
      /* MEDIA SINGLE TRANSITIONS */
      mediaSingleAnimations()
      /* MEDIA DOUBLE MARGINS SETUP & TRANSITIONS */
      mediaDoubleMarginsSetup()
      mediaDoubleAnimations()
      /* RESIZE */
      window.addEventListener("resize", onResize)
    }, wrapRef)

    return () => {
      ctx.revert()
      window.removeEventListener("resize", onResize)
      if (raf !== null) {
        window.cancelAnimationFrame(raf)
      }
    }
  }, [lenis, animationKey])

  return (
    <div ref={wrapRef} className="flex flex-col gap-[48px] md:gap-[160px]">
      {blocks?.map((block) => {
        switch (block._type) {
          case "projectMediaPayoff":
            return (
              <div
                key={block._key}
                className="type-display-l uppercase leading-none text-black"
                data-block-payoff
              >
                {block.payoff}
              </div>
            )
          case "projectMediaSingle":
            return (
              <div
                key={block._key}
                className="grid w-full grid-cols-12 gap-[24px]"
                data-block-media-single
              >
                <div
                  className={cn(
                    "w-full min-w-0 overflow-hidden",
                    getMediaLayoutByVariant(block._type, block.variant),
                  )}
                >
                  <Image
                    image={block.image}
                    resizeId="media-block-single"
                    className="w-full"
                  />
                </div>
              </div>
            )
          case "projectMediaDouble": {
            const { layout1, layout2 } = getMediaLayoutByVariant(
              block._type,
              block.variant,
            )

            return (
              <div
                key={block._key}
                className="grid w-full grid-cols-12 gap-[24px]"
                data-block-media-double
                data-block-media-double-variant={block.variant}
              >
                {block.media1 && (
                  <div
                    className={cn("w-full min-w-0 overflow-hidden", layout1)}
                  >
                    <Image
                      image={{
                        ...block.media1.image,
                        alt: block.media1.alt ?? "",
                      }}
                      resizeId="media-block-double"
                      className="w-full"
                    />
                  </div>
                )}

                {block.media2 && (
                  <div
                    className={cn("w-full min-w-0 overflow-hidden", layout2)}
                  >
                    <Image
                      image={{
                        ...block.media2.image,
                        alt: block.media2.alt ?? "",
                      }}
                      resizeId="media-block-double"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
