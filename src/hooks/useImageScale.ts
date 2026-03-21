import { useCallback, useRef, type MutableRefObject } from "react"

const MAX_VEL = 35
const MIN_SCALE = 0.92
const LERP = 0.2

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
    const t = `scale(${scale})`
    if (mobileImgRef.current) mobileImgRef.current.style.transform = t
    if (desktopImgRef.current) desktopImgRef.current.style.transform = t
    imageScaleRef.current = scale
  }, [])

  const startScaleLoop = useCallback(() => {
    cancelAnimationFrame(scaleRafRef.current)
    const tick = () => {
      // Decadimento naturale: se handleSetTranslate non aggiorna più la velocity
      // (scroll fermo), decade verso 0 così il loop può terminare
      velocityRef.current *= 0.7
      const vel = Math.abs(velocityRef.current)
      const target = Math.max(MIN_SCALE, 1 - (vel / MAX_VEL) * (1 - MIN_SCALE))
      const next =
        imageScaleRef.current + (target - imageScaleRef.current) * LERP
      applyImageScale(next)
      if (Math.abs(next - 1) > 0.001 || vel > 0.5) {
        scaleRafRef.current = requestAnimationFrame(tick)
      } else {
        applyImageScale(1)
      }
    }
    scaleRafRef.current = requestAnimationFrame(tick)
  }, [applyImageScale, velocityRef])

  return { mobileImgRef, desktopImgRef, startScaleLoop }
}
