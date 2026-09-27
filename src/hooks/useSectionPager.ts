"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react"
import gsap from "gsap"

const CONFIG = {
  /** Max sections a single movement can travel away from where it started. */
  maxSteps: 3,
  duration: {
    base: 0.9,
    perStep: 0.25,
    max: 1.8,
    reduced: 0.01,
  },
  wheel: {
    idleMs: 180,
    minImpulseGapMs: 120,
    /** A delta below peak × decayRatio marks the gesture as decaying (momentum tail). */
    decayRatio: 0.7,
    /** While decaying, a delta above trough × riseFactor is a new swipe. */
    riseFactor: 2.5,
    riseMinDelta: 8,
    /** Once landed, a delta still at peak × sustainRatio means the user is still scrolling. */
    sustainRatio: 0.9,
    /** Summed |delta| within strongWindowMs of a gesture that adds 1 or 2 extra steps. */
    strongWindowMs: 250,
    strong: [900, 1800],
  },
  touch: {
    slopPx: 6,
    /** Drag distance, as a fraction of the stage height, that commits a step. */
    commitRatio: 0.12,
    /** Release velocity (sections/second) that counts as a flick. */
    flickVelocity: 0.6,
    /** Seconds of release velocity projected forward to pick the landing section. */
    projection: 0.3,
    rubberBand: 0.3,
    velocityWindowMs: 100,
    releaseBase: 0.5,
    releasePerStep: 0.2,
    clickSuppressMs: 400,
  },
} as const

type GoToOptions = {
  duration?: number
  onComplete?: () => void
}

type AnimateOptions = GoToOptions & { ease?: string }

type SectionPagerOptions = {
  count: number
  stageRef: RefObject<HTMLElement | null>
  enabled: boolean
  /** Called on every frame the position changes; `pos` is a float from 0 to count - 1. */
  onRender: (pos: number, height: number) => void
  onIndexChange: (index: number) => void
}

export type SectionPager = {
  goTo: (index: number, options?: GoToOptions) => void
  getIndex: () => number
  isMoving: () => boolean
  render: () => void
}

function clampIndex(value: number, count: number) {
  return Math.min(count - 1, Math.max(0, value))
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getDuration(distance: number, base: number, perStep: number) {
  if (prefersReducedMotion()) return CONFIG.duration.reduced
  const steps = Math.max(0, Math.ceil(distance) - 1)
  return Math.min(CONFIG.duration.max, base + perStep * steps)
}

/** Full-screen pager: wheel, touch and keys always land on a whole section, nothing scrolls. */
export function useSectionPager({
  count,
  stageRef,
  enabled,
  onRender,
  onIndexChange,
}: SectionPagerOptions): SectionPager {
  const stateRef = useRef({ pos: 0 })
  const heightRef = useRef(0)
  const indexRef = useRef(0)
  const targetRef = useRef(0)
  const anchorRef = useRef(0)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const draggingRef = useRef(false)
  const enabledRef = useRef(enabled)
  const countRef = useRef(count)
  const callbacksRef = useRef({ onRender, onIndexChange })

  useLayoutEffect(() => {
    enabledRef.current = enabled
    countRef.current = count
    callbacksRef.current = { onRender, onIndexChange }
  })

  const apply = useCallback((pos: number) => {
    const callbacks = callbacksRef.current
    callbacks.onRender(pos, heightRef.current)

    const index = clampIndex(Math.round(pos), countRef.current)
    if (index !== indexRef.current) {
      indexRef.current = index
      callbacks.onIndexChange(index)
    }
  }, [])

  const animateTo = useCallback(
    (target: number, { duration, ease, onComplete }: AnimateOptions = {}) => {
      const state = stateRef.current
      const wasMoving = tweenRef.current !== null

      tweenRef.current?.kill()
      tweenRef.current = null
      targetRef.current = target

      const distance = Math.abs(target - state.pos)
      if (distance < 0.001) {
        state.pos = target
        anchorRef.current = target
        apply(target)
        onComplete?.()
        return
      }

      tweenRef.current = gsap.to(state, {
        pos: target,
        duration:
          duration ??
          getDuration(distance, CONFIG.duration.base, CONFIG.duration.perStep),
        // Retargeting mid-flight with an inOut ease would stall before re-accelerating.
        ease: ease ?? (wasMoving ? "power3.out" : "power3.inOut"),
        onUpdate: () => apply(state.pos),
        onComplete: () => {
          tweenRef.current = null
          anchorRef.current = target
          onComplete?.()
        },
      })
    },
    [apply],
  )

  const step = useCallback(
    (delta: number) => {
      const total = countRef.current
      const moving = tweenRef.current !== null
      if (!moving) {
        anchorRef.current = clampIndex(Math.round(stateRef.current.pos), total)
      }

      const anchor = anchorRef.current
      const base = moving ? targetRef.current : anchor
      const next = clampIndex(
        Math.min(
          anchor + CONFIG.maxSteps,
          Math.max(anchor - CONFIG.maxSteps, base + delta),
        ),
        total,
      )

      if (next === base) return
      animateTo(next)
    },
    [animateTo],
  )

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const canNavigate = () => enabledRef.current && countRef.current > 1

    heightRef.current = stage.clientHeight
    const resizeObserver = new ResizeObserver(() => {
      heightRef.current = stage.clientHeight
      apply(stateRef.current.pos)
    })
    resizeObserver.observe(stage)

    /* Wheel: one gesture = one impulse, however many events its momentum emits. */
    const gesture = {
      dir: 0,
      lastTime: -Infinity,
      lastImpulse: -Infinity,
      start: 0,
      sum: 0,
      bonus: 0,
      peak: 0,
      trough: Infinity,
      decayed: false,
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!canNavigate() || draggingRef.current) return

      let delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0
      if (!delta) return
      if (e.deltaMode === 1) delta *= 16
      else if (e.deltaMode === 2) delta *= heightRef.current

      const { wheel } = CONFIG
      const now = performance.now()
      const dir = Math.sign(delta)
      const abs = Math.abs(delta)

      const isNewGesture =
        now - gesture.lastTime > wheel.idleMs ||
        dir !== gesture.dir ||
        (gesture.decayed &&
          abs > gesture.trough * wheel.riseFactor &&
          abs - gesture.trough > wheel.riseMinDelta)
      const isSustained =
        !isNewGesture &&
        tweenRef.current === null &&
        abs >= gesture.peak * wheel.sustainRatio

      gesture.lastTime = now

      if (isNewGesture) {
        gesture.dir = dir
        gesture.start = now
        gesture.sum = 0
        gesture.bonus = 0
        gesture.peak = 0
        gesture.trough = Infinity
        gesture.decayed = false
      }

      gesture.sum += abs
      if (abs > gesture.peak) {
        gesture.peak = abs
        gesture.decayed = false
        gesture.trough = Infinity
      } else if (abs < gesture.peak * wheel.decayRatio) {
        gesture.decayed = true
      }
      if (gesture.decayed) gesture.trough = Math.min(gesture.trough, abs)

      if (
        (isNewGesture || isSustained) &&
        now - gesture.lastImpulse >= wheel.minImpulseGapMs
      ) {
        gesture.lastImpulse = now
        step(dir)
      }

      if (now - gesture.start <= wheel.strongWindowMs) {
        const bonus = wheel.strong.filter((t) => gesture.sum > t).length
        if (bonus > gesture.bonus) {
          step(dir * (bonus - gesture.bonus))
          gesture.bonus = bonus
        }
      }
    }

    /* Touch: the section follows the finger, the release always lands on a section. */
    const touch = {
      active: false,
      startY: 0,
      startPos: 0,
      resumeTarget: null as number | null,
      samples: [] as { y: number; t: number }[],
    }
    let suppressClickUntil = 0

    const onTouchStart = (e: TouchEvent) => {
      touch.active = canNavigate() && e.touches.length === 1
      if (!touch.active) return

      const { clientY } = e.touches[0]
      touch.startY = clientY
      touch.samples = [{ y: clientY, t: performance.now() }]
      touch.resumeTarget = tweenRef.current ? targetRef.current : null

      tweenRef.current?.kill()
      tweenRef.current = null
      touch.startPos = stateRef.current.pos
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!touch.active) return

      const { clientY } = e.touches[0]
      const dy = clientY - touch.startY

      if (!draggingRef.current) {
        if (Math.abs(dy) < CONFIG.touch.slopPx) return
        draggingRef.current = true
      }
      if (e.cancelable) e.preventDefault()

      const now = performance.now()
      touch.samples.push({ y: clientY, t: now })
      while (
        touch.samples.length > 2 &&
        now - touch.samples[0].t > CONFIG.touch.velocityWindowMs
      ) {
        touch.samples.shift()
      }

      const max = countRef.current - 1
      let pos = touch.startPos - dy / (heightRef.current || 1)
      if (pos < 0) pos *= CONFIG.touch.rubberBand
      else if (pos > max) pos = max + (pos - max) * CONFIG.touch.rubberBand

      stateRef.current.pos = pos
      apply(pos)
    }

    const onTouchEnd = () => {
      if (!touch.active) return
      touch.active = false

      if (!draggingRef.current) {
        if (touch.resumeTarget !== null) animateTo(touch.resumeTarget)
        return
      }

      draggingRef.current = false
      suppressClickUntil = performance.now() + CONFIG.touch.clickSuppressMs

      const { touch: cfg } = CONFIG
      const total = countRef.current
      const pos = stateRef.current.pos
      const first = touch.samples[0]
      const last = touch.samples[touch.samples.length - 1]
      const dt = last.t - first.t
      const released = performance.now() - last.t <= cfg.velocityWindowMs
      // Sections per second, positive = towards the next section.
      const velocity =
        released && dt > 0
          ? -((last.y - first.y) / (heightRef.current || 1)) / (dt / 1000)
          : 0

      const base = clampIndex(Math.round(touch.startPos), total)
      const travelled = pos - touch.startPos
      const isFlick = Math.abs(velocity) >= cfg.flickVelocity
      let target = touch.resumeTarget ?? base

      if (isFlick || Math.abs(travelled) >= cfg.commitRatio) {
        const dir = isFlick ? Math.sign(velocity) : Math.sign(travelled)
        const projected = pos + velocity * cfg.projection
        target =
          dir > 0
            ? Math.max(Math.ceil(projected), Math.floor(touch.startPos) + 1)
            : Math.min(Math.floor(projected), Math.ceil(touch.startPos) - 1)
        target = Math.min(
          base + CONFIG.maxSteps,
          Math.max(base - CONFIG.maxSteps, target),
        )
      }

      target = clampIndex(target, total)
      animateTo(target, {
        duration: getDuration(
          Math.abs(target - pos),
          cfg.releaseBase,
          cfg.releasePerStep,
        ),
        ease: "power3.out",
      })
    }

    const onClickCapture = (e: MouseEvent) => {
      if (performance.now() >= suppressClickUntil) return
      e.preventDefault()
      e.stopPropagation()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!canNavigate() || e.defaultPrevented) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target instanceof Element ? e.target : null
      if (target?.closest("input, textarea, select, [contenteditable]")) return

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          step(1)
          break
        case "ArrowUp":
        case "PageUp":
          step(-1)
          break
        case " ":
          if (target?.closest("a, button, [role='button']")) return
          step(e.shiftKey ? -1 : 1)
          break
        case "Home":
          animateTo(0)
          break
        case "End":
          animateTo(countRef.current - 1)
          break
        default:
          return
      }
      e.preventDefault()
    }

    stage.addEventListener("wheel", onWheel, { passive: false })
    stage.addEventListener("touchstart", onTouchStart, { passive: true })
    stage.addEventListener("touchmove", onTouchMove, { passive: false })
    stage.addEventListener("touchend", onTouchEnd)
    stage.addEventListener("touchcancel", onTouchEnd)
    stage.addEventListener("click", onClickCapture, true)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      resizeObserver.disconnect()
      stage.removeEventListener("wheel", onWheel)
      stage.removeEventListener("touchstart", onTouchStart)
      stage.removeEventListener("touchmove", onTouchMove)
      stage.removeEventListener("touchend", onTouchEnd)
      stage.removeEventListener("touchcancel", onTouchEnd)
      stage.removeEventListener("click", onClickCapture, true)
      window.removeEventListener("keydown", onKeyDown)

      tweenRef.current?.kill()
      tweenRef.current = null
      draggingRef.current = false
    }
  }, [stageRef, apply, step, animateTo])

  const goTo = useCallback(
    (index: number, options?: GoToOptions) =>
      animateTo(clampIndex(index, countRef.current), options),
    [animateTo],
  )

  return useMemo(
    () => ({
      goTo,
      getIndex: () => indexRef.current,
      isMoving: () => tweenRef.current !== null || draggingRef.current,
      render: () => apply(stateRef.current.pos),
    }),
    [goTo, apply],
  )
}
