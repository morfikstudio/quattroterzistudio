import type { SanityImageObject } from "@sanity/image-url/lib/types/types"

import { buildSanityImageUrl } from "@/lib/sanity"

import {
  BREAKPOINT_THRESHOLDS,
  type BreakpointName,
} from "@/stores/breakpointStore"

/** A Sanity image as projected by the queries, with `meta` from `asset->metadata`. */
type SanityImage = Partial<SanityImageObject> & {
  meta?: { lqip?: string | null; width?: number | null } | null
}

/** A plain image (`asset`) or one image per orientation, as `coverList` / `coverDetail`. */
export type ResponsiveImage = SanityImage & {
  portrait?: SanityImage | null
  landscape?: SanityImage | null
  alt?: string | null
}

type Orientation = "portrait" | "landscape"

const imageResizeMap = {
  default: {
    landscape: "1920x1080", // 16:9
    portrait: "720x1280", // 9:16
  },
  "cover-thumb": {
    landscape: "1920x1440", // 4:3
    portrait: "720x540", // 4:3
  },
  "cover-detail": {
    landscape: "1920x1440", // 4:3
    portrait: "720x1280", // 9:16
  },
  "media-block-single": {
    landscape: "1500x1000", // 3:2
    portrait: "900x600", // 3:2
  },
  "media-block-double": {
    landscape: "1080x1620", // 2:3
    portrait: "720x1080", // 2:3
  },
} as const satisfies Record<string, Record<Orientation, `${number}x${number}`>>

export type ImageResizeId = keyof typeof imageResizeMap

export type ImageSource = {
  image: SanityImageObject
  width: number
  height: number
  ratio: number
  maxWidth?: number
  lqip?: string
}

const { desktopMin, tabletTouchMax } = BREAKPOINT_THRESHOLDS

// Mirrors breakpointToImageOrientation; keep in sync with `image-landscape` in styles/theme.css
export const LANDSCAPE_MEDIA = [
  `(min-width: ${tabletTouchMax + 1}px)`,
  `(min-width: ${desktopMin}px) and (pointer: fine)`,
  `(min-width: ${desktopMin}px) and (pointer: none)`,
].join(", ")

/** Rendered width of the 4:3 project thumbs (/projects, /archive, next project teaser). */
export const THUMB_SIZES = [
  "(orientation: landscape) and (max-height: 600px) 64vh",
  "(min-width: 1024px) 35vw",
  "(min-width: 768px) 50vw",
  "70vw",
].join(", ")

export const HERO_SIZES = "100vw"

// Off-DOM on purpose: swapping the visible thumb's source flashes blank while the new one decodes
export function preloadHeroImage(thumb: HTMLImageElement) {
  const source = Array.from(
    thumb.parentElement?.querySelectorAll("source") ?? [],
  ).find((s) => window.matchMedia(s.media).matches)

  const preload = new window.Image()
  preload.sizes = HERO_SIZES
  preload.srcset = source?.srcset ?? thumb.srcset
  preload.decode().catch(() => {})
}

function breakpointToImageOrientation(
  current: BreakpointName | null,
): Orientation {
  return !current || current === "mobile" || current === "tablet"
    ? "portrait"
    : "landscape"
}

function pickImage(
  image: ResponsiveImage,
  orientation: Orientation,
): SanityImage | null | undefined {
  if (image.asset) return image
  const other = orientation === "portrait" ? "landscape" : "portrait"
  return image[orientation]?.asset ? image[orientation] : image[other]
}

function toSource(
  image: ResponsiveImage,
  resizeId: ImageResizeId,
  orientation: Orientation,
): ImageSource | null {
  const picked = pickImage(image, orientation)
  if (!picked?.asset) return null

  const [width, height] = imageResizeMap[resizeId][orientation]
    .split("x")
    .map(Number)

  return {
    image: { asset: picked.asset, crop: picked.crop, hotspot: picked.hotspot },
    width,
    height,
    ratio: width / height,
    maxWidth: picked.meta?.width ?? undefined,
    lqip: picked.meta?.lqip ?? undefined,
  }
}

/** Per-orientation crop, intrinsic size and metadata for an image; null when it has no asset. */
export function getImageSources(
  image: ResponsiveImage | null | undefined,
  resizeId: ImageResizeId = "default",
): Record<Orientation, ImageSource | null> | null {
  if (!image) return null

  const portrait = toSource(image, resizeId, "portrait")
  const landscape = toSource(image, resizeId, "landscape")

  return portrait || landscape ? { portrait, landscape } : null
}

/** URL for CSS backgrounds, which cannot use srcset: pick the orientation from the breakpoint. */
export function getImageUrl({
  image,
  resizeId = "default",
  breakpoint = null,
}: {
  image: ResponsiveImage | null | undefined
  resizeId?: ImageResizeId
  breakpoint?: BreakpointName | null
}) {
  if (breakpoint === null) return ""

  const source = getImageSources(image, resizeId)?.[
    breakpointToImageOrientation(breakpoint)
  ]
  if (!source) return ""

  return (
    buildSanityImageUrl(source.image, {
      // No srcset on backgrounds, so always request 2x for high-density screens
      width: source.width * 2,
      ratio: source.ratio,
      maxWidth: source.maxWidth,
    }) ?? ""
  )
}
