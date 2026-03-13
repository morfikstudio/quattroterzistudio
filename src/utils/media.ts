import { getSanityImageUrl } from "@/lib/sanity"

import type { BreakpointName } from "@/stores/breakpointStore"

const imageResizeMap: Record<string, Record<string, string>> = {
  coverImage: {
    landscape: "1920x1080",
    portrait: "720x1280",
  },
  coverThumb: {
    landscape: "600x400",
    portrait: "600x400",
  },
  default: {
    landscape: "1920x1080", // 16:9
    portrait: "720x1280", // 9:16
  },
}

function breakpointToImageOrientation(
  current: BreakpointName | null,
): "portrait" | "landscape" {
  return current === "mobile" || current === "tablet" ? "portrait" : "landscape"
}

export function getImageUrl({
  image,
  type = "default",
  breakpoint = null,
}: {
  image: any
  type?: keyof typeof imageResizeMap
  breakpoint?: BreakpointName | null
}) {
  if (!image) return ""

  const resizeName = imageResizeMap[type] || imageResizeMap.default
  const bpName = breakpointToImageOrientation(breakpoint)
  const imageAsset = image.asset || image[bpName]?.asset
  const sizes = resizeName[bpName].split("x").map(Number)
  const width = sizes[0]
  const height = sizes[1]

  return getSanityImageUrl(imageAsset, width, height) || ""
}
