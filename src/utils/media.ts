import { getSanityImageUrl } from "@/lib/sanity"

import type { BreakpointName } from "@/stores/breakpointStore"

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
} as const satisfies Record<string, Record<"landscape" | "portrait", string>>

export type ImageResizeId = keyof typeof imageResizeMap

function breakpointToImageOrientation(
  current: BreakpointName | null,
): "portrait" | "landscape" {
  return !current || current === "mobile" || current === "tablet"
    ? "portrait"
    : "landscape"
}

function parseResizeValue(value: string): {
  width: number
  height: number
  widthOnly: boolean
} {
  const parts = value.split("x").map(Number)
  const width = parts[0] ?? 0
  const height = parts[1] ?? 0
  return { width, height, widthOnly: height === 0 }
}

export function isWidthOnlyResize(
  resizeId: keyof typeof imageResizeMap,
): boolean {
  const entry = imageResizeMap[resizeId] ?? imageResizeMap.default
  const landscape = parseResizeValue(entry.landscape)
  const portrait = parseResizeValue(entry.portrait)
  return landscape.widthOnly && portrait.widthOnly
}

export function getImageDimensions({
  resizeId = "default",
  breakpoint = null,
  image,
}: {
  resizeId?: keyof typeof imageResizeMap
  breakpoint?: BreakpointName | null
  image?: {
    asset?: { metadata?: { dimensions?: { width: number; height: number } } }
    portrait?: {
      asset?: { metadata?: { dimensions?: { width: number; height: number } } }
    }
    landscape?: {
      asset?: { metadata?: { dimensions?: { width: number; height: number } } }
    }
  }
}): { width: number; height: number } {
  const resizeName = imageResizeMap[resizeId] || imageResizeMap.default
  const bpName = breakpointToImageOrientation(breakpoint)
  const { width, height, widthOnly } = parseResizeValue(resizeName[bpName])

  if (widthOnly && image) {
    const asset = image.asset ?? image[bpName]?.asset
    const dimensions = asset?.metadata?.dimensions
    if (dimensions && dimensions.width > 0) {
      const aspectHeight = Math.round(
        (width * dimensions.height) / dimensions.width,
      )
      return { width, height: aspectHeight }
    }
  }

  return {
    width,
    height: height || Math.round((width * 9) / 16),
  }
}

export function getImageUrl({
  image,
  resizeId = "default",
  breakpoint = null,
}: {
  image: any
  resizeId?: keyof typeof imageResizeMap
  breakpoint?: BreakpointName | null
}) {
  if (!image) return ""
  if (breakpoint === null) return ""

  const resizeName = imageResizeMap[resizeId] || imageResizeMap.default
  const bpName = breakpointToImageOrientation(breakpoint)
  const imageAsset = image.asset || image[bpName]?.asset
  const { width, height, widthOnly } = parseResizeValue(resizeName[bpName])

  return getSanityImageUrl(imageAsset, width, widthOnly ? 0 : height) ?? ""
}
