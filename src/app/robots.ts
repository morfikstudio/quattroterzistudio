import type { MetadataRoute } from "next"

import { getSiteOrigin } from "@/lib/seo/site-url"

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true"
  const shouldIndex = process.env.NODE_ENV === "production" && allowIndexing

  if (!shouldIndex) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    }
  }

  const origin = getSiteOrigin()

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${origin}/sitemap.xml`,
  }
}
