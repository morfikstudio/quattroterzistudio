import { useCallback, useRef, type MutableRefObject } from "react"

const MAX_VEL = 40
const MIN_SCALE = 0.82
const LERP = 0.04
const VEL_DEAD_ZONE = 8
const VEL_DECAY = 0.82

interface Options {
  velocityRef: MutableRefObject<number>
}

export interface UseImageScaleReturn {
  mobileImgRef: MutableRefObject<HTMLDivElement | null>
  desktopImgRef: MutableRefObject<HTMLDivElement | null>
  startScaleLoop: () => void
  resetScale: () => void
}

export function useImageScale({ velocityRef }: Options): UseImageScaleReturn {
  const mobileImgRef = useRef<HTMLDivElement | null>(null)
  const desktopImgRef = useRef<HTMLDivElement | null>(null)
  const imageScaleRef = useRef(1)
  const scaleRafRef = useRef<number>(0)
  const loopRunningRef = useRef(false)

  const applyImageScale = useCallback((scale: number) => {
    // scale3d + translateZ forces a GPU compositing layer, preventing
    // subpixel rendering artifacts at the edges of the scaled element
    const t = `scale3d(${scale}, ${scale}, 1) translateZ(0)`
    if (mobileImgRef.current) mobileImgRef.current.style.transform = t
    if (desktopImgRef.current) desktopImgRef.current.style.transform = t
    imageScaleRef.current = scale
  }, [])

  const startScaleLoop = useCallback(() => {
    // If the loop is already running, just let it pick up the updated velocity.
    // Restarting it would cancel mid-frame and cause a visible jerk.
    if (loopRunningRef.current) return

    loopRunningRef.current = true
    const tick = () => {
      velocityRef.current *= VEL_DECAY
      const vel = Math.abs(velocityRef.current)

      // Dead zone: velocities below threshold map to scale 1 (no visible effect)
      const effectiveVel = Math.max(0, vel - VEL_DEAD_ZONE)
      const target =
        effectiveVel === 0
          ? 1
          : Math.max(MIN_SCALE, 1 - (effectiveVel / MAX_VEL) * (1 - MIN_SCALE))

      const next =
        imageScaleRef.current + (target - imageScaleRef.current) * LERP
      applyImageScale(next)
      if (Math.abs(next - 1) > 0.0005 || vel > 0.5) {
        scaleRafRef.current = requestAnimationFrame(tick)
      } else {
        applyImageScale(1)
        loopRunningRef.current = false
      }
    }
    scaleRafRef.current = requestAnimationFrame(tick)
  }, [applyImageScale, velocityRef])

  // Called on mouseenter: cancels the scroll-driven loop and quickly returns
  // scale to 1 so the newly shown image always appears at full size.
  const resetScale = useCallback(() => {
    cancelAnimationFrame(scaleRafRef.current)
    velocityRef.current = 0
    loopRunningRef.current = true
    const quickReturn = () => {
      const next = imageScaleRef.current + (1 - imageScaleRef.current) * 0.35
      applyImageScale(next)
      if (Math.abs(next - 1) > 0.001) {
        scaleRafRef.current = requestAnimationFrame(quickReturn)
      } else {
        applyImageScale(1)
        loopRunningRef.current = false
      }
    }
    scaleRafRef.current = requestAnimationFrame(quickReturn)
  }, [applyImageScale, velocityRef])

  return { mobileImgRef, desktopImgRef, startScaleLoop, resetScale }
}
