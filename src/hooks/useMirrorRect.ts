import { useEffect, useRef, useState } from "react"

type ImageRect = { top: number; left: number; width: number; height: number }

export interface UseMirrorRectReturn {
  imageRef: React.MutableRefObject<HTMLDivElement | null>
  imageRect: ImageRect | null
}

export function useMirrorRect(): UseMirrorRectReturn {
  const imageRef = useRef<HTMLDivElement | null>(null)
  const [imageRect, setImageRect] = useState<ImageRect | null>(null)

  useEffect(() => {
    const el = imageRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setImageRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  return { imageRef, imageRect }
}
