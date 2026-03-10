import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react"

export const SLIDES_PER_VIEW = 7

const FRICTION = 0.92
const WHEEL_MULT = 0.6

/** t ∈ [0, 1] — partenza veloce, decelerazione. */
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

interface Options {
  n: number
  /** Ref condiviso con useImageScale: questo hook scrive, l'altro legge */
  velocityRef: MutableRefObject<number>
  /** Chiamata ad ogni evento di scroll */
  onScrollStart?: () => void
}

export interface UseScrollListReturn {
  activeIndex: number
  itemHeight: number
  scrollToItem: (itemIndex: number) => void
  containerRef: RefObject<HTMLDivElement>
  listRef: RefObject<HTMLUListElement>
  mirrorRef: RefObject<HTMLUListElement>
  itemRefs: MutableRefObject<(HTMLAnchorElement | null)[]>
}

export function useScrollList({
  n,
  velocityRef,
  onScrollStart,
}: Options): UseScrollListReturn {
  const [activeIndex, setActiveIndex] = useState(0)
  const [itemHeight, setItemHeight] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const mirrorRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>(Array(n).fill(null))

  const translateRef = useRef(0)
  const rafRef = useRef<number>(0)

  // Pattern "event handler come ref": mantiene onScrollStart sempre aggiornato
  // senza aggiungerlo alle deps degli effect (evita re-subscribe inutili)
  const onScrollStartRef = useRef(onScrollStart)
  useEffect(() => {
    onScrollStartRef.current = onScrollStart
  })

  // ─── Position ────────────────────────────────────────────────────────────

  const getInitialTranslate = useCallback(
    (h: number) => {
      const ih = h / SLIDES_PER_VIEW
      return h / 2 - n * ih - ih / 2
    },
    [n],
  )

  const applyTransform = useCallback((translate: number) => {
    const t = `translate3d(0, ${translate}px, 0)`
    if (listRef.current) listRef.current.style.transform = t
    if (mirrorRef.current) mirrorRef.current.style.transform = t
    translateRef.current = translate
  }, [])

  const loopFix = useCallback(
    (translate: number, ih: number) => {
      const span = n * ih
      const initial = getInitialTranslate(
        containerRef.current?.clientHeight ?? 0,
      )
      if (translate > initial + span / 2) return translate - span
      if (translate < initial - span / 2) return translate + span
      return translate
    },
    [n, getInitialTranslate],
  )

  const updateActiveIndex = useCallback(
    (translate: number, ih: number, containerH: number) => {
      if (ih === 0) return
      const rawIndex = (containerH / 2 - translate) / ih - 0.5
      const realIndex = ((Math.round(rawIndex) % n) + n) % n
      setActiveIndex(realIndex)
    },
    [n],
  )

  // ─── Animations ───────────────────────────────────────────────────────────

  /** Interpola da translate corrente a target con easeOutQuart */
  const animateTo = useCallback(
    (target: number, ih: number, containerH: number, duration: number) => {
      const startTranslate = translateRef.current
      const startTime = performance.now()
      const step = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1)
        const next =
          startTranslate + (target - startTranslate) * easeOutQuart(t)
        applyTransform(next)
        updateActiveIndex(next, ih, containerH)
        if (t < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [applyTransform, updateActiveIndex],
  )

  /** Porta un item specifico al centro al click o tastiera */
  const scrollToItem = useCallback(
    (itemIndex: number) => {
      const el = containerRef.current
      if (!el) return
      velocityRef.current = 0
      cancelAnimationFrame(rafRef.current)
      const ih = el.clientHeight / SLIDES_PER_VIEW
      const rawTarget = el.clientHeight / 2 - (itemIndex + 0.5) * ih
      animateTo(loopFix(rawTarget, ih), ih, el.clientHeight, 700)
    },
    [loopFix, animateTo, velocityRef],
  )

  /** Aggancia l'item più vicino al centro con lo snap magnetico */
  const snapToNearest = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const ih = el.clientHeight / SLIDES_PER_VIEW
    const rawIndex = (el.clientHeight / 2 - translateRef.current) / ih - 0.5
    const rawTarget = el.clientHeight / 2 - (Math.round(rawIndex) + 0.5) * ih
    animateTo(loopFix(rawTarget, ih), ih, el.clientHeight, 500)
  }, [loopFix, animateTo])

  /** Momentum con FRICTION e snap magnetico */
  const animate = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    velocityRef.current *= FRICTION
    if (Math.abs(velocityRef.current) < 1.5) {
      velocityRef.current = 0
      snapToNearest()
      return
    }
    const ih = el.clientHeight / SLIDES_PER_VIEW
    const next = loopFix(translateRef.current + velocityRef.current, ih)
    applyTransform(next)
    updateActiveIndex(next, ih, el.clientHeight)
    rafRef.current = requestAnimationFrame(animate)
  }, [loopFix, applyTransform, updateActiveIndex, snapToNearest, velocityRef])

  // ─── useEffects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const init = () => {
      const h = el.clientHeight
      const ih = h / SLIDES_PER_VIEW
      setItemHeight(ih)
      const initial = getInitialTranslate(h)
      applyTransform(initial)
      updateActiveIndex(initial, ih, h)
    }
    init()
    window.addEventListener("resize", init)
    return () => window.removeEventListener("resize", init)
  }, [getInitialTranslate, applyTransform, updateActiveIndex])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      velocityRef.current -= e.deltaY * WHEEL_MULT
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animate)
      onScrollStartRef.current?.()
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [animate, velocityRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let lastY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY
      velocityRef.current = 0
      cancelAnimationFrame(rafRef.current)
      onScrollStartRef.current?.()
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const y = e.touches[0].clientY
      const delta = y - lastY
      lastY = y
      velocityRef.current = delta
      const ih = el.clientHeight / SLIDES_PER_VIEW
      const next = loopFix(translateRef.current + delta, ih)
      applyTransform(next)
      updateActiveIndex(next, ih, el.clientHeight)
    }
    const onTouchEnd = () => {
      rafRef.current = requestAnimationFrame(animate)
    }
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [animate, loopFix, applyTransform, updateActiveIndex, velocityRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
      e.preventDefault()
      const ih = el.clientHeight / SLIDES_PER_VIEW
      const rawIndex = (el.clientHeight / 2 - translateRef.current) / ih - 0.5
      const currentReal = ((Math.round(rawIndex) % n) + n) % n
      const direction = e.key === "ArrowDown" ? 1 : -1
      const nextReal = (((currentReal + direction) % n) + n) % n
      scrollToItem(n + nextReal)
      itemRefs.current[nextReal]?.focus({ preventScroll: true })
    }
    el.addEventListener("keydown", onKeyDown)
    return () => el.removeEventListener("keydown", onKeyDown)
  }, [scrollToItem, n])

  return {
    activeIndex,
    itemHeight,
    scrollToItem,
    containerRef,
    listRef,
    mirrorRef,
    itemRefs,
  }
}
