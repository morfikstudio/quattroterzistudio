import { create } from "zustand"

const MOBILE_MAX = 767
const TABLET_MIN = 768
const TABLET_MAX = 1023
const DESKTOP_MIN = 1024
const DESKTOP_LARGE_MIN = 1280
const TABLET_TOUCH_MAX = 1366

export const BREAKPOINT_THRESHOLDS = {
  mobileMax: MOBILE_MAX,
  tabletMin: TABLET_MIN,
  tabletMax: TABLET_MAX,
  tabletTouchMax: TABLET_TOUCH_MAX,
  desktopMin: DESKTOP_MIN,
  desktopLargeMin: DESKTOP_LARGE_MIN,
} as const

export type BreakpointName =
  | "mobile"
  | "mobileLandscape"
  | "tablet"
  | "tabletLandscape"
  | "desktop"
  | "desktopLarge"

function getCurrentBreakpoint(): BreakpointName {
  if (typeof window === "undefined") return "mobile"
  const width = window.innerWidth
  const mqPointerCoarse = window.matchMedia("(pointer: coarse)")
  const mqLandscape = window.matchMedia("(orientation: landscape)")
  const landscape = mqLandscape.matches

  // Touch devices (tablets): treat 768–TABLET_TOUCH_MAX as tablet/tabletLandscape
  if (
    mqPointerCoarse.matches &&
    width >= TABLET_MIN &&
    width <= TABLET_TOUCH_MAX
  ) {
    return landscape ? "tabletLandscape" : "tablet"
  }

  // Non-touch or outside tablet width: use width-based breakpoints
  const mq1280 = window.matchMedia(`(min-width: ${DESKTOP_LARGE_MIN}px)`)
  const mq1024 = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`)
  const mq768 = window.matchMedia(`(min-width: ${TABLET_MIN}px)`)

  if (mq1280.matches) return "desktopLarge"
  if (mq1024.matches) return "desktop"
  if (mq768.matches) return landscape ? "tabletLandscape" : "tablet"
  return landscape ? "mobileLandscape" : "mobile"
}

type BreakpointStore = {
  current: BreakpointName | null
  viewportWidth: number | null
  viewportHeight: number | null
  _initialized: boolean
  _listeners: (() => void)[]
  init: () => void
  destroy: () => void
}

export const useBreakpointStore = create<BreakpointStore>((set, get) => {
  function update() {
    if (typeof window === "undefined") return
    set({
      current: getCurrentBreakpoint(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    })
  }

  return {
    current: null,
    viewportWidth: null,
    viewportHeight: null,
    _initialized: false,
    _listeners: [],

    init() {
      if (typeof window === "undefined") return
      const { _initialized } = get()
      if (_initialized) return

      const cleanups: (() => void)[] = []

      const mq1280 = window.matchMedia(`(min-width: ${DESKTOP_LARGE_MIN}px)`)
      const mq1024 = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`)
      const mq768 = window.matchMedia(`(min-width: ${TABLET_MIN}px)`)
      const mqLandscape = window.matchMedia("(orientation: landscape)")
      const mqPointerCoarse = window.matchMedia("(pointer: coarse)")

      ;[mq1280, mq1024, mq768, mqLandscape, mqPointerCoarse].forEach((mql) => {
        mql.addEventListener("change", update)
        cleanups.push(() => mql.removeEventListener("change", update))
      })

      window.addEventListener("resize", update)
      cleanups.push(() => window.removeEventListener("resize", update))

      set({
        _initialized: true,
        _listeners: cleanups,
      })
      update()
    },

    destroy() {
      const { _listeners } = get()
      _listeners.forEach((cleanup) => cleanup())
      set({
        _initialized: false,
        _listeners: [],
        current: null,
        viewportWidth: null,
        viewportHeight: null,
      })
    },
  }
})

export function useBreakpoint() {
  const current = useBreakpointStore((state) => state.current)
  const viewportWidth = useBreakpointStore((state) => state.viewportWidth)
  const viewportHeight = useBreakpointStore((state) => state.viewportHeight)
  return { current, viewportWidth, viewportHeight }
}
