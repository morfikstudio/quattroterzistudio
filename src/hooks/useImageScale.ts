import { useCallback, useRef, type MutableRefObject } from "react"

const MAX_VEL = 40
const MIN_SCALE = 0.94 // subtler compression
const LERP = 0.08 // slower lerp = no snap feeling
const VEL_DEAD_ZONE = 2 // fine-tune dead zone (coarse filter is in handleSetTranslate)
const VEL_DECAY = 0.82 // slower decay = smoother return to scale 1

interface Options {
  velocityRef: MutableRefObject<number>
}

export interface UseImageScaleReturn {
  mobileImgRef: MutableRefObject<HTMLDivElement | null>
  desktopImgRef: MutableRefObject<HTMLDivElement | null>
  startScaleLoop: () => void
}

export function useImageScale({ velocityRef }: Options): UseImageScaleReturn {
  const mobileImgRef = useRef<HTMLDivElement | null>(null)
  const desktopImgRef = useRef<HTMLDivElement | null>(null)
  const imageScaleRef = useRef(1)
  const scaleRafRef = useRef<number>(0)

  const applyImageScale = useCallback((scale: number) => {
    // scale3d + translateZ forces a GPU compositing layer, preventing
    // subpixel rendering artifacts at the edges of the scaled element
    const t = `scale3d(${scale}, ${scale}, 1) translateZ(0)`
    if (mobileImgRef.current) mobileImgRef.current.style.transform = t
    if (desktopImgRef.current) desktopImgRef.current.style.transform = t
    imageScaleRef.current = scale
  }, [])

  const startScaleLoop = useCallback(() => {
    cancelAnimationFrame(scaleRafRef.current)
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
      }
    }
    scaleRafRef.current = requestAnimationFrame(tick)
  }, [applyImageScale, velocityRef])

  return { mobileImgRef, desktopImgRef, startScaleLoop }
}
