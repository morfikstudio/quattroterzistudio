import imageUrlBuilder from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

import { client } from "@/sanity/lib/client"

const builder = imageUrlBuilder(client)

/**
 * Builds a Sanity image URL with width and optional height.
 * When height is omitted or 0, only width is set so the image keeps its aspect ratio.
 * Uses dpr(2) for sharpness on Retina displays.
 *
 * @param image - Sanity image object (e.g. property.contents?.mainImage)
 * @param width - Width in pixels
 * @param height - Height in pixels; if 0 or undefined, only width is used (fluid height)
 * @returns Image URL or undefined if image is invalid
 */
export function getSanityImageUrl(
  image: SanityImageSource | null | undefined,
  width: number,
  height?: number,
): string | undefined {
  if (!image) return undefined
  const img = builder.image(image).width(width)
  if (height != null && height > 0) {
    return img.height(height).fit("crop").dpr(2).url()
  }
  return img.dpr(2).url()
}
