"use client"

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import gsap from "gsap"
import Image from "@/components/ui/Image"
import { useImageScale } from "@/hooks/useImageScale"
import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"
import { useNavigationStore } from "@/stores/navigationStore"
import { useBreakpoint } from "@/stores/breakpointStore"
import { dispatchCurtainNavigate } from "@/components/CurtainTransition"
import ViewToggle from "@/components/ViewToggle"

const SLIDES_PER_VIEW = 7

// Cache for the resolved "land here" index, cleared after mounts settle.
let pendingTargetCache: { slug: string; index: number } | null = null
// List copies for infinite-loop simulation: the viewport stays in the middle
// copy; nearing an edge we teleport scrollTop by one list-length.
const COPIES = 9

function SelectionCTA({ onNavigate }: { onNavigate: () => void }) {
  const Icons = () => (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="flex w-[4px] h-[4px] bg-black max-md:bg-white" />
    </div>
  )
  return (
    <button
      onClick={onNavigate}
      className="appearance-none bg-transparent p-0 border-0"
    >
      <div
        className={cn(
          "group relative h-[40px] w-[125px]",
          "border border-black max-md:bg-black flex items-center justify-center px-4",
        )}
      >
        <div
          className={cn(
            "relative h-full w-full",
            "flex items-center justify-center overflow-hidden",
          )}
        >
          <div
            className={cn(
              "absolute top-1/2 left-0",
              "-translate-y-1/2 group-hover:-translate-x-1 group-hover:opacity-0 transition-all duration-200 ease-in-out",
            )}
          >
            <Icons />
          </div>
          <div
            className={cn(
              "absolute top-1/2 left-1/2",
              "-translate-x-[calc(50%-8px)] -translate-y-1/2 group-hover:-translate-x-[calc(50%+5.5px)] transition-transform duration-400 ease-out",
            )}
          >
            <span className="type-button-m uppercase text-black max-md:text-white">
              selection
            </span>
          </div>
          <div
            className={cn(
              "absolute top-1/2 right-0",
              "-translate-y-1/2 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-in-out",
            )}
          >
            <Icons />
          </div>
        </div>
      </div>
    </button>
  )
}

type Props = { projects?: PROJECTS_QUERY_RESULT; onSelectionClick?: () => void }

export default function ProjectsListPlain({
  projects,
  onSelectionClick,
}: Props) {
  const items = projects ?? []

  // Extended list of COPIES copies; each entry keeps its real index so
  // active/hover/navigation stay consistent across duplicates.
  const extendedItems = useMemo(() => {
    const result: {
      item: PROJECTS_QUERY_RESULT[number]
      key: string
      realIndex: number
    }[] = []
    for (let c = 0; c < COPIES; c++) {
      items.forEach((item, i) => {
        result.push({ item, key: `${item._id}-c${c}`, realIndex: i })
      })
    }
    return result
  }, [items])

  const router = useRouter()
  const setPreviousPath = useNavigationStore((s) => s.setPreviousPath)
  const { current: breakpoint } = useBreakpoint()
  const isDesktop = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth / window.innerHeight >= 1.35 &&
      breakpoint?.startsWith("desktop"),
    [breakpoint],
  )
  const [clipState, setClipState] = useState<"enter" | "exiting">("enter")
  const isExitingRef = useRef(false)
  const listContainerRef = useRef<HTMLDivElement | null>(null)
  const wordSpansRef = useRef<HTMLElement[]>([])
  const squareSpansRef = useRef<HTMLElement[]>([])
  const yearSpanRef = useRef<HTMLSpanElement | null>(null)
  // Mobile enter: unlock underline only once the word is almost in.
  const [pageEnterDone, setPageEnterDone] = useState(false)
  // Mobile exit: force active underline "out" before words leave.
  const [underlineExiting, setUnderlineExiting] = useState(false)
  const mobileWrapRef = useRef<HTMLAnchorElement | null>(null)
  const desktopWrapRef = useRef<HTMLAnchorElement | null>(null)
  const counterSpanRef = useRef<HTMLSpanElement | null>(null)
  const selectionCtaWrapRef = useRef<HTMLDivElement | null>(null)

  const allAnimTargets = useCallback(
    () => [
      ...wordSpansRef.current,
      ...squareSpansRef.current,
      ...(yearSpanRef.current ? [yearSpanRef.current] : []),
      ...(counterSpanRef.current ? [counterSpanRef.current] : []),
    ],
    [],
  )

  const exitWithCallback = useCallback(
    (onComplete: () => void) => {
      if (isExitingRef.current) return
      isExitingRef.current = true
      setClipState("exiting")
      if (selectionCtaWrapRef.current) {
        gsap.to(selectionCtaWrapRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.7,
          ease: "power3.in",
          overwrite: true,
        })
      }
      const startWords = () =>
        gsap.to(allAnimTargets(), {
          y: "-110%",
          duration: 0.7,
          ease: "power3.in",
          overwrite: true,
          onComplete,
        })
      if (isMobileRef.current) {
        setUnderlineExiting(true)
        setTimeout(startWords, 400)
      } else {
        startWords()
      }
    },
    [allAnimTargets],
  )

  const navigate = useCallback(
    (url: string) => {
      // Set previousPath before push so SplashMarquee reads it on first render.
      setPreviousPath(window.location.pathname)
      exitWithCallback(() => router.push(url))
    },
    [router, exitWithCallback, setPreviousPath],
  )

  const navigateWithTransition = useCallback(
    (url: string) => {
      if (isExitingRef.current) return
      isExitingRef.current = true

      setPreviousPath(window.location.pathname)

      // Non-desktop: navigate directly, no image expansion.
      if (!isDesktop) {
        dispatchCurtainNavigate(url)
        return
      }

      const wrapEl = desktopWrapRef.current
      const imgEl = desktopImgRef.current

      if (!wrapEl) {
        router.push(url)
        return
      }

      // Reset hover scale on the inner image layer.
      if (imgEl) {
        const scaleChild = imgEl.firstElementChild as HTMLElement | null
        if (scaleChild) {
          scaleChild.style.transition = "none"
          gsap.set(scaleChild, { scale: 1, overwrite: true })
        }
      }

      // Hide year — the Hero re-shows it with letters-in.
      const yearContainer = yearSpanRef.current?.parentElement
      if (yearContainer) gsap.set(yearContainer, { autoAlpha: 0 })

      const rect = wrapEl.getBoundingClientRect()

      // Cancel CSS keyframe so it doesn't fight inline styles.
      wrapEl.style.animation = "none"

      gsap.set(wrapEl, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        transform: "none",
        clipPath: "none",
        zIndex: 100,
      })

      // Expand image, then navigate (letters-in runs on the project Hero).
      gsap.to(wrapEl, {
        top: 0,
        left: 0,
        width: "100%",
        duration: 1.5,
        ease: "power3.out",
        onComplete: () => router.push(url),
      })
    },
    [router, setPreviousPath, isDesktop],
  )

  // Unlock mobile underline once the word is almost fully visible.
  useEffect(() => {
    const t = setTimeout(() => setPageEnterDone(true), 1300)
    return () => clearTimeout(t)
  }, [])

  // Entry animation for the toggle (bottom-left).
  useEffect(() => {
    const el = selectionCtaWrapRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.3 },
    )
  }, [])

  useEffect(() => {
    const handlePopstate = () => {
      if (isExitingRef.current) return
      isExitingRef.current = true
      setClipState("exiting")
    }
    window.addEventListener("popstate", handlePopstate)
    return () => window.removeEventListener("popstate", handlePopstate)
  }, [])

  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  const interactedItemsRef = useRef<Set<number>>(new Set())
  const prevActiveRef = useRef(0)
  const isMobileRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  const velocityRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollCheckRef = useRef<number>(0)
  const hoverIndexRef = useRef<number | null>(null)

  // Native-scroll bookkeeping.
  const ulRef = useRef<HTMLUListElement | null>(null)
  const sectionRootRef = useRef<HTMLDivElement | null>(null)
  const itemHeightRef = useRef(0)
  const totalHeightRef = useRef(0)
  const lastScrollTopRef = useRef(0)
  // Pending teleport direction (+1/-1/0); deferred until momentum settles so
  // setting scrollTop mid-flick on iOS doesn't kill native inertia.
  const pendingTeleportRef = useRef(0)

  // mobileImgRef left unwired on purpose: no velocity scale on touch.
  const { desktopImgRef, startScaleLoop } = useImageScale({
    velocityRef,
    minScale: 0.78,
  })

  useEffect(() => {
    return () => cancelAnimationFrame(scrollCheckRef.current)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = (matches: boolean) => {
      isMobileRef.current = matches
      setIsMobile(matches)
    }
    update(mq.matches)
    mq.addEventListener("change", (e) => update(e.matches))
    return () => mq.removeEventListener("change", (e) => update(e.matches))
  }, [])

  // Center the middle-copy target before paint (useLayoutEffect) so there's
  // no flash of index 0 when arriving with a pending active slug.
  useLayoutEffect(() => {
    const ul = ulRef.current
    if (!ul || items.length === 0) return

    const recalc = () => {
      const containerHeight = ul.clientHeight
      const itemHeight = containerHeight / SLIDES_PER_VIEW
      itemHeightRef.current = itemHeight
      totalHeightRef.current = items.length * itemHeight
    }

    recalc()

    // Land on the pending active slug if present, else index 0 of middle copy.
    const { pendingActiveSlug } = useNavigationStore.getState()
    let targetIndex = 0
    if (pendingActiveSlug) {
      const found = items.findIndex(
        (it) => it.slug?.current === pendingActiveSlug,
      )
      targetIndex = found >= 0 ? found : 0
      pendingTargetCache = { slug: pendingActiveSlug, index: targetIndex }
    } else if (pendingTargetCache) {
      targetIndex = pendingTargetCache.index
    }

    const halfView = Math.floor(SLIDES_PER_VIEW / 2)
    const middleCopyIndex = Math.floor(COPIES / 2)
    const initialScrollTop =
      (middleCopyIndex * items.length + targetIndex - halfView) *
      itemHeightRef.current
    ul.scrollTop = initialScrollTop
    lastScrollTopRef.current = initialScrollTop

    if (targetIndex !== 0) {
      prevActiveRef.current = targetIndex
      setActiveIndex(targetIndex)
    }

    const onResize = () => {
      const oldItemHeight = itemHeightRef.current
      recalc()
      // Keep the same item centered across resize.
      if (oldItemHeight > 0) {
        const ratio = itemHeightRef.current / oldItemHeight
        const next = ul.scrollTop * ratio
        ul.scrollTop = next
        lastScrollTopRef.current = next
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [items.length])

  // Clear pending slug + cache once mounts have settled.
  useEffect(() => {
    const id = setTimeout(() => {
      useNavigationStore.getState().setPendingActiveSlug(null)
      pendingTargetCache = null
    }, 100)
    return () => clearTimeout(id)
  }, [])

  // Wheel forwarder: the desktop image anchor has no scrollable ancestor, so
  // forward its wheel events to the ul to scroll anywhere in the section.
  useEffect(() => {
    const root = sectionRootRef.current
    const ul = ulRef.current
    if (!root || !ul) return

    const onWheel = (e: WheelEvent) => {
      // Inside the ul the browser already scrolls natively — don't double up.
      if (ul.contains(e.target as Node)) return

      let deltaPx = e.deltaY
      // Normalize delta units to pixels.
      if (e.deltaMode === 1) deltaPx *= 16
      else if (e.deltaMode === 2) deltaPx *= ul.clientHeight

      if (deltaPx === 0) return
      e.preventDefault()
      ul.scrollBy({ top: deltaPx })
    }

    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [])

  const pendingActiveRef = useRef<number | null>(null)
  const rafUpdateRef = useRef(0)

  const handleScroll = useCallback(() => {
    const ul = ulRef.current
    if (!ul || itemHeightRef.current === 0) return

    let scrollTop = ul.scrollTop
    const containerHeight = ul.clientHeight
    const itemHeight = itemHeightRef.current
    const totalHeight = totalHeightRef.current

    // Loop reset. Desktop: teleport immediately (no inertia to preserve).
    // Mobile: defer until momentum settles to avoid killing native inertia,
    // but force an "emergency" teleport within half a copy of the edge so a
    // fast flicker never slams into the wall.
    if (totalHeight > 0) {
      const lastCopy = COPIES - 1
      const needsForward = scrollTop < totalHeight
      const needsBackward = scrollTop > totalHeight * lastCopy
      if (needsForward || needsBackward) {
        const dir = needsForward ? 1 : -1
        if (isMobileRef.current) {
          const emergency =
            scrollTop < totalHeight * 0.5 ||
            scrollTop > totalHeight * (lastCopy + 0.5)
          if (emergency) {
            scrollTop = scrollTop + dir * totalHeight
            ul.scrollTop = scrollTop
            lastScrollTopRef.current = scrollTop
            pendingTeleportRef.current = 0
          } else {
            pendingTeleportRef.current = dir
          }
        } else {
          scrollTop = scrollTop + dir * totalHeight
          ul.scrollTop = scrollTop
          lastScrollTopRef.current = scrollTop
        }
      }
    }

    // Active = item whose center is closest to viewport center.
    const centerY = scrollTop + containerHeight / 2
    const extendedIndex = Math.floor(centerY / itemHeight)
    const realIndex =
      ((extendedIndex % items.length) + items.length) % items.length

    // Velocity feeds the image scale loop; amplified on desktop so slow wheel
    // ticks still cross useImageScale's dead zone.
    const delta = scrollTop - lastScrollTopRef.current
    if (delta !== 0) {
      const desktopBoost = isMobileRef.current ? 1 : 1.8
      velocityRef.current = -delta * desktopBoost
      startScaleLoop()
    }
    lastScrollTopRef.current = scrollTop

    // Coalesce React state updates into one rAF tick to avoid re-rendering the
    // whole extended list on every scroll event.
    pendingActiveRef.current = realIndex
    if (!rafUpdateRef.current) {
      rafUpdateRef.current = requestAnimationFrame(() => {
        rafUpdateRef.current = 0
        const next = pendingActiveRef.current
        if (next !== null && next !== prevActiveRef.current) {
          interactedItemsRef.current.add(prevActiveRef.current)
          prevActiveRef.current = next
          setActiveIndex(next)
        }
        if (hoverIndexRef.current !== null) {
          hoverIndexRef.current = null
          setHoverIndex(null)
        }
        if (!isScrollingRef.current) {
          isScrollingRef.current = true
          setIsScrolling(true)
        }
      })
    }

    cancelAnimationFrame(scrollCheckRef.current)
    const check = () => {
      if (Math.abs(velocityRef.current) > 0.5) {
        scrollCheckRef.current = requestAnimationFrame(check)
      } else {
        isScrollingRef.current = false
        setIsScrolling(false)
        const cur = ulRef.current
        if (pendingTeleportRef.current !== 0 && cur) {
          const next =
            cur.scrollTop + pendingTeleportRef.current * totalHeightRef.current
          cur.scrollTop = next
          lastScrollTopRef.current = next
          pendingTeleportRef.current = 0
        }
      }
    }
    scrollCheckRef.current = requestAnimationFrame(check)
  }, [items.length, startScaleLoop])

  // Entry animation for word spans.
  useEffect(() => {
    if (!listContainerRef.current || items.length === 0) return
    const t = setTimeout(() => {
      if (!listContainerRef.current) return
      const spans = Array.from(
        listContainerRef.current.querySelectorAll<HTMLElement>(
          ".pl-word-inner",
        ),
      )
      const squares = Array.from(
        listContainerRef.current.querySelectorAll<HTMLElement>(
          ".pl-square-inner",
        ),
      )
      if (!spans.length) return
      wordSpansRef.current = spans
      squareSpansRef.current = squares
      gsap.fromTo(
        [
          ...spans,
          ...squares,
          ...(yearSpanRef.current ? [yearSpanRef.current] : []),
          ...(counterSpanRef.current ? [counterSpanRef.current] : []),
        ],
        { y: "110%" },
        { y: "0%", duration: 1.2, ease: "power3.out", delay: 0.1 },
      )
    }, 0)
    return () => clearTimeout(t)
  }, [items.length])

  const getItemHref = (
    item: PROJECTS_QUERY_RESULT[number] | undefined,
  ): string => (item?.slug?.current ? `/projects/${item.slug.current}` : "#")

  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex
  const isHovering = !isScrolling && hoverIndex !== null

  const displayedItem = items[displayIndex]
  const imageHref = getItemHref(displayedItem)

  const activeItem = items[activeIndex]
  const activeYear = activeItem?.year ?? ""

  const getLabel = (item: PROJECTS_QUERY_RESULT[number] | undefined) =>
    item?.title ?? ""

  return (
    <>
      <style>{`
        @keyframes pl-clip-enter {
          from { clip-path: inset(100% 0 0 0); }
          to   { clip-path: inset(0% 0 0 0); }
        }
        @keyframes pl-clip-exit {
          from { clip-path: inset(0% 0 0 0); }
          to   { clip-path: inset(100% 0 0 0); }
        }
        .pl-img-clip[data-clip="enter"] {
          clip-path: inset(100% 0 0 0);
          animation: pl-clip-enter 1.35s cubic-bezier(0.22, 1, 0.36, 1) .25s forwards;
        }
        .pl-img-clip[data-clip="exiting"] {
          animation: pl-clip-exit 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .pl-img-slide {
          display: none;
          position: absolute;
          inset: 0;
        }
        .pl-img-slide[data-active="true"] {
          display: block;
        }

        .pl-item-link {
          font-size: clamp(40px, 5.5vw, 70px);
          opacity: 0.5;
          transition:
            color 1s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pl-item-link[data-active="true"] {
          color: #000;
          opacity: 1;
        }

        .pl-list[data-hovering="true"] .pl-item-link:not([data-active="true"]) {
          opacity: 0.2;
        }

        @media (max-width: 767px) {
          .pl-item-link[data-active="true"] {
            color: #fff;
            mix-blend-mode: difference;
            opacity: 1;
          }
        }

        .pl-underline {
          clip-path: inset(0 100% 0 0);
        }
        @keyframes pl-line-in {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes pl-line-out {
          from { clip-path: inset(0 0% 0 0); }
          to   { clip-path: inset(0 0% 0 100%); }
        }
        .pl-item-link[data-line="in"] .pl-underline {
          animation: pl-line-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .pl-item-link[data-line="out"] .pl-underline {
          animation: pl-line-out 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .pl-year-span {
          transform: translateY(110%);
          display: block;
        }

        .pl-fade-top {
          background: linear-gradient(to bottom, #fff 20%, transparent 100%);
        }
        .pl-fade-bottom {
          background: linear-gradient(to top, #fff 20%, transparent 100%);
        }

        @media (max-width: 767px) {
          .pl-swiper-blend { mix-blend-mode: difference; }
        }

        .pl-word-inner {
          transform: translateY(110%);
          display: inline-block;
        }

        .pl-square-inner {
          transform: translateY(110%);
          display: block;
        }

        .pl-ul {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: auto;
          overscroll-behavior: contain;
        }
        .pl-ul::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div ref={selectionCtaWrapRef} className="fixed bottom-6 left-6 z-30">
        <div className="md:hidden">
          <SelectionCTA
            onNavigate={
              onSelectionClick
                ? () => exitWithCallback(onSelectionClick)
                : () => navigate("/projects")
            }
          />
        </div>
        <div className="hidden md:block">
          <ViewToggle
            active="archive"
            onSelect={(target) => {
              if (target !== "selected") return
              if (onSelectionClick) exitWithCallback(onSelectionClick)
              else navigate("/projects")
            }}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30 pointer-events-none overflow-hidden">
        <span ref={counterSpanRef} className="pl-year-span type-caption">
          {String(displayIndex + 1).padStart(2, "0")}-
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <div
        ref={sectionRootRef}
        // Opt the subtree out of Lenis' smooth-scroll hijack so the ul's
        // native overflow-y-auto can scroll.
        data-lenis-prevent
        className="relative h-svh md:h-screen md:grid md:grid-cols-2"
      >
        <a
          href={imageHref}
          onClick={(e) => {
            if (imageHref === "#") {
              e.preventDefault()
              return
            }
            e.preventDefault()
            navigateWithTransition(imageHref)
          }}
          aria-label={`Open project: ${getLabel(displayedItem)}`}
          className="absolute top-1/2 -translate-y-1/2 right-[14px] md:right-[24px] z-30 max-md:pointer-events-auto md:pointer-events-none overflow-hidden cursor-pointer md:cursor-default no-underline text-inherit"
        >
          <span ref={yearSpanRef} className="pl-year-span type-caption">
            <span className="md:hidden">View</span>
            <span className="hidden md:inline">{activeYear}</span>
          </span>
        </a>

        {/* Mobile image */}
        <div className="md:hidden absolute inset-0">
          <a
            ref={mobileWrapRef}
            href={imageHref}
            className={cn(
              "pl-img-clip grou absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[70vw] max-md:landscape:w-[50vw]",
              "block cursor-pointer no-underline text-inherit focus-visible:outline-none",
            )}
            data-clip={clipState}
            aria-label={`Open project: ${getLabel(displayedItem)}`}
            onClick={(e) => {
              if (imageHref === "#") {
                e.preventDefault()
                return
              }
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              navigateWithTransition(imageHref)
            }}
          >
            <div className="relative aspect-4/3 overflow-hidden w-full">
              <div
                className={cn(
                  "absolute inset-0 origin-center",
                  "transition-transform duration-500 ease-out",
                  "group-hover:scale-110",
                )}
              >
                {items.map((p, i) => (
                  <div
                    key={`${p._id}-${i}`}
                    className="pl-img-slide"
                    data-active={displayIndex === i ? "true" : "false"}
                  >
                    <Image
                      image={p.coverDetail}
                      resizeId="cover-detail"
                      fill
                      fit="cover"
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>
          </a>
        </div>

        {/* Desktop: above the list to receive hover; only the image box has pointer-events */}
        <div className="hidden md:block relative h-screen z-20 pointer-events-none">
          <a
            ref={desktopWrapRef}
            href={imageHref}
            className={cn(
              "pl-img-clip group pointer-events-auto absolute top-1/2 left-[7vw] -translate-y-1/2 w-[50vw] lg:w-[35vw]",
              "block cursor-pointer no-underline text-inherit focus-visible:outline-none",
            )}
            data-clip={clipState}
            aria-label={`Open project: ${getLabel(displayedItem)}`}
            onClick={(e) => {
              if (imageHref === "#") {
                e.preventDefault()
                return
              }
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              navigateWithTransition(imageHref)
            }}
          >
            <div
              ref={desktopImgRef}
              className="relative aspect-4/3 overflow-hidden w-full"
            >
              <div
                className={cn(
                  "absolute inset-0 origin-center",
                  "transition-transform duration-500 ease-out",
                  "group-hover:scale-110",
                )}
              >
                {items.map((p, i) => (
                  <div
                    key={`${p._id}-${i}`}
                    className="pl-img-slide"
                    data-active={displayIndex === i ? "true" : "false"}
                  >
                    <Image
                      image={p.coverDetail}
                      resizeId="cover-detail"
                      fill
                      fit="cover"
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>
          </a>
        </div>

        {/* Lista */}
        <div
          className="relative h-svh md:h-screen md:absolute md:inset-0 md:z-10"
          role="region"
          aria-label="Lista progetti"
        >
          <div
            ref={listContainerRef}
            className={cn("pl-swiper-blend pl-list h-full", "group")}
            data-hovering={isHovering ? "true" : "false"}
          >
            <ul
              ref={ulRef}
              onScroll={handleScroll}
              className={cn(
                "pl-ul h-full w-full overflow-y-auto overflow-x-hidden list-none m-0 p-0",
              )}
              style={{
                scrollSnapType: isMobile ? "y mandatory" : undefined,
              }}
            >
              {extendedItems.map(({ item: p, key, realIndex }) => {
                const i = realIndex
                return (
                  <li
                    key={key}
                    className="flex items-center px-6 md:pl-[calc(50%+2.5rem)] md:pr-10"
                    style={{
                      height: `calc(100% / ${SLIDES_PER_VIEW})`,
                      scrollSnapAlign: isMobile ? "center" : undefined,
                    }}
                  >
                    <a
                      href="#"
                      className={cn(
                        "pl-item-link",
                        "type-h1 text-secondary no-underline focus-visible:outline-none",
                        "inline-flex items-center cursor-pointer",
                        // Desktop: fill the whole row so the hover/click hit
                        // area reaches the midpoint between adjacent items
                        // (rows are equal-height and the text is centered).
                        "md:h-full md:w-full",
                      )}
                      data-active={
                        hoverIndex === i || activeIndex === i ? "true" : "false"
                      }
                      data-line={
                        isMobile
                          ? // Mobile: underline tied to the settled active item
                            // only — items passed while scrolling must not flash "out".
                            !isScrolling &&
                            pageEnterDone &&
                            !underlineExiting &&
                            activeIndex === i
                            ? "in"
                            : underlineExiting && activeIndex === i
                              ? "out"
                              : undefined
                          : /* Desktop: hover-driven, unchanged. */
                            !isScrolling && hoverIndex === i
                            ? "in"
                            : interactedItemsRef.current.has(i)
                              ? "out"
                              : undefined
                      }
                      onMouseEnter={() => {
                        interactedItemsRef.current.add(i)
                        setHoverIndex(i)
                      }}
                      onMouseLeave={() => {
                        if (!isExitingRef.current) setHoverIndex(null)
                      }}
                      onFocus={() => setHoverIndex(i)}
                      onBlur={() => setHoverIndex(null)}
                      onClick={(e) => {
                        e.preventDefault()
                        const href = getItemHref(p)
                        if (href === "#") return
                        navigateWithTransition(href)
                      }}
                      aria-label={getLabel(p)}
                    >
                      {/* Inner wrapper sized to the text: keeps the underline
                          under the letters while the anchor fills the full row. */}
                      <span className="relative inline-flex items-center leading-tight">
                        {/* QUADRATINO — decommentare per riabilitare
                      <span className="overflow-hidden block w-[10px] h-[10px] flex-shrink-0 mr-4 -translate-y-[5px]">
                        <span className="pl-square-inner block w-[10px] h-[10px] bg-current" />
                      </span>
                      */}
                        {getLabel(p)
                          .split(" ")
                          .map((word, j, arr) => (
                            <span
                              key={j}
                              className="overflow-hidden inline-block align-bottom"
                            >
                              <span className="pl-word-inner">
                                {word}
                                {j < arr.length - 1 ? "\u00A0" : ""}
                              </span>
                            </span>
                          ))}
                        <span
                          className={cn(
                            "pl-underline",
                            "absolute left-0 w-full h-0.5 bg-current bottom-[0.1em]",
                          )}
                        />
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Fade top/bottom */}
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-top",
              "md:hidden absolute left-0 right-0 top-0 h-[30%] pointer-events-none z-[2]",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pl-fade-bottom",
              "md:hidden absolute left-0 right-0 bottom-0 h-[30%] pointer-events-none z-[2]",
            )}
          />
        </div>
      </div>
    </>
  )
}
