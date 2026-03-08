import imageUrlBuilder from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

import { client } from "@/sanity/lib/client"

const builder = imageUrlBuilder(client)

/**
 * Builds a Sanity image URL with fixed dimensions and crop.
 * Uses dpr(2) for sharpness on Retina displays.
 *
 * @param image - Sanity image object (e.g. property.contents?.mainImage)
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns Image URL or undefined if image is invalid
 */
export function getSanityImageUrl(
  image: SanityImageSource | null | undefined,
  width: number,
  height: number,
): string | undefined {
  if (!image) return undefined
  return builder
    .image(image)
    .width(width)
    .height(height)
    .fit("crop")
    .dpr(2)
    .url()
}
