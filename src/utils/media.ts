import { getSanityImageUrl } from "@/lib/sanity"

import type { BreakpointName } from "@/stores/breakpointStore"

const imageResizeMap = {
  "cover-image": {
    landscape: "1920x1080",
    portrait: "720x1280",
  },
  "cover-thumb": {
    landscape: "600x400",
    portrait: "600x400",
  },
  default: {
    landscape: "1920x1080", // 16:9
    portrait: "720x1280", // 9:16
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

export function getImageDimensions({
  resizeId = "default",
  breakpoint = null,
}: {
  resizeId?: keyof typeof imageResizeMap
  breakpoint?: BreakpointName | null
}): { width: number; height: number } {
  const resizeName = imageResizeMap[resizeId] || imageResizeMap.default
  const bpName = breakpointToImageOrientation(breakpoint)
  const [width, height] = resizeName[bpName].split("x").map(Number)
  return { width, height }
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
  const sizes = resizeName[bpName].split("x").map(Number)
  const width = sizes[0]
  const height = sizes[1]

  return getSanityImageUrl(imageAsset, width, height) || ""
}
