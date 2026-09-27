"use client"

import { useCallback, type CSSProperties } from "react"
import { getImageProps } from "next/image"

import { buildSanityImageUrl } from "@/lib/sanity"
import { cn } from "@/utils/classNames"
import {
  getImageSources,
  LANDSCAPE_MEDIA,
  type ImageResizeId,
  type ImageSource,
  type ResponsiveImage,
} from "@/utils/media"

interface ImageProps {
  image: ResponsiveImage | null | undefined
  /** Rendered width per viewport (e.g. `THUMB_SIZES`): picks the srcset candidate to download. */
  sizes: string
  resizeId?: ImageResizeId
  fill?: boolean
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  position?: string
  className?: string
  priority?: boolean
  /** Image URL shown until this one loads, in place of the LQIP. */
  placeholder?: string
  onLoad?: (img: HTMLImageElement) => void
}

function getSourceProps(
  source: ImageSource,
  {
    alt,
    sizes,
    fill,
    priority,
    style,
  }: {
    alt: string
    sizes: string
    fill: boolean
    priority: boolean
    style: CSSProperties
  },
) {
  const { image, ratio, maxWidth } = source

  return getImageProps({
    // Never rendered: Next builds src and srcSet from the loader
    src: buildSanityImageUrl(image, { width: source.width }) ?? "",
    loader: ({ width, quality }) =>
      buildSanityImageUrl(image, { width, ratio, quality, maxWidth }) ?? "",
    alt,
    sizes,
    style,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : undefined,
    ...(fill ? { fill: true } : { width: source.width, height: source.height }),
  }).props
}

/** Sanity CDN image; the landscape `<source>` picks the desktop asset without JS breakpoints. */
export default function Image({
  image,
  sizes,
  resizeId = "default",
  fill = false,
  fit = "contain",
  position = "center center",
  className = "",
  priority = false,
  placeholder,
  onLoad,
}: ImageProps) {
  const handleLoad = useCallback(
    (img: HTMLImageElement) => {
      if (img.dataset.loaded) return
      img.dataset.loaded = "true"
      onLoad?.(img)
    },
    [onLoad],
  )

  // Images loaded before hydration never fire React's onLoad.
  const imgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) handleLoad(img)
    },
    [handleLoad],
  )

  const sources = getImageSources(image, resizeId)
  if (!sources) return null

  const fallback = (sources.portrait ?? sources.landscape) as ImageSource
  const landscape = sources.landscape ?? fallback
  const options = {
    alt: image?.alt ?? "",
    sizes,
    fill,
    priority,
    style: { objectFit: fit, objectPosition: position },
  }

  const imgProps = getSourceProps(fallback, options)
  const landscapeProps = getSourceProps(landscape, options)
  const hasLandscapeSource = landscapeProps.srcSet !== imgProps.srcSet

  const lqipPortrait = placeholder ?? fallback.lqip
  const lqipLandscape = placeholder ?? landscape.lqip ?? lqipPortrait
  const lqipStyle = lqipPortrait
    ? ({
        "--lqip-portrait": `url("${lqipPortrait}")`,
        "--lqip-landscape": `url("${lqipLandscape}")`,
      } as CSSProperties)
    : null

  return (
    <picture key={imgProps.src} style={{ display: "contents" }}>
      {hasLandscapeSource && (
        <source
          media={LANDSCAPE_MEDIA}
          srcSet={landscapeProps.srcSet}
          sizes={landscapeProps.sizes}
          width={landscapeProps.width}
          height={landscapeProps.height}
        />
      )}
      <img
        {...imgProps}
        alt={imgProps.alt}
        ref={imgRef}
        style={{ ...imgProps.style, ...lqipStyle }}
        className={cn(
          className,
          lqipStyle &&
            "bg-(image:--lqip-portrait) image-landscape:bg-(image:--lqip-landscape) bg-cover bg-center data-loaded:bg-none",
        )}
        onLoad={(e) => handleLoad(e.currentTarget)}
      />
    </picture>
  )
}
