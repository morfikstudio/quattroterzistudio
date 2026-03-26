"use client"

import { useMemo } from "react"
import * as NextImage from "next/image"

import {
  getImageDimensions,
  getImageUrl,
  isWidthOnlyResize,
} from "@/utils/media"
import type { ImageResizeId } from "@/utils/media"

import { useBreakpoint } from "@/stores/breakpointStore"

interface ImageProps {
  image: any
  resizeId?: ImageResizeId
  fill?: boolean
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  position?: string
  sizes?: string
  className?: string
  priority?: boolean
  onLoad?: (img: HTMLImageElement) => void
}

export default function Image({
  image,
  resizeId = "default",
  fill = false,
  fit = "contain",
  position = "center center",
  sizes = "",
  className = "",
  priority = false,
  onLoad,
}: ImageProps) {
  const { current: breakpoint } = useBreakpoint()
  const fluidHeight = !fill && isWidthOnlyResize(resizeId)
  const dimensions = !fill
    ? getImageDimensions({
        resizeId,
        breakpoint,
        ...(fluidHeight ? { image } : {}),
      })
    : null

  const url = useMemo(
    () =>
      getImageUrl({
        image,
        resizeId,
        breakpoint,
      }),
    [image, resizeId, breakpoint],
  )

  return url ? (
    <NextImage.default
      src={url}
      alt={image.alt ?? ""}
      fill={fill}
      {...(dimensions && {
        width: dimensions.width,
        height: dimensions.height,
      })}
      style={{ objectFit: fit, objectPosition: position }}
      sizes={sizes}
      className={
        fluidHeight ? `${className} max-w-full h-auto`.trim() : className
      }
      priority={priority}
      onLoadingComplete={
        onLoad
          ? (img: HTMLImageElement) => {
              onLoad(img)
            }
          : undefined
      }
    />
  ) : null
}
