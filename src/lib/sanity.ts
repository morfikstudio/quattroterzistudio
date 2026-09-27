import imageUrlBuilder from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

import { client } from "@/sanity/lib/client"

const builder = imageUrlBuilder(client)

/** Sanity CDN URL; pass the whole image object so hotspot and crop apply. */
export function buildSanityImageUrl(
  image: SanityImageSource | null | undefined,
  {
    width,
    ratio,
    quality = 75,
    maxWidth,
  }: { width: number; ratio?: number; quality?: number; maxWidth?: number },
): string | undefined {
  if (!image) return undefined

  // Capped to the original width: fit=crop upscales past it
  const w = Math.round(maxWidth ? Math.min(width, maxWidth) : width)
  const img = builder.image(image).width(w).auto("format").quality(quality)

  return ratio
    ? img
        .height(Math.round(w / ratio))
        .fit("crop")
        .url()
    : img.url()
}
