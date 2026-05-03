import type { SiteSeoConfig } from "./types"
import { getSiteOrigin } from "./site-url"

function absoluteUrl(origin: string, pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim()
  if (!trimmed) {
    return origin
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${origin}${path}`
}

function schemaInLanguage(locale: string): string {
  const t = locale.trim().replace("_", "-")
  return t || "en-US"
}

/**
 * Organization + WebSite JSON-LD for the home page (rich results / clarity for crawlers).
 */
export function buildHomeJsonLd(
  config: SiteSeoConfig,
): Record<string, unknown> {
  const origin = getSiteOrigin()
  const orgId = `${origin}/#organization`
  const websiteId = `${origin}/#website`

  const brand = config.site.name.trim()
  const description =
    config.home.description.trim() ||
    config.site.defaultDescription.trim() ||
    undefined

  const logoUrl = absoluteUrl(origin, config.home.openGraph.image.url)

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: brand,
        url: origin,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: config.home.openGraph.image.width,
          height: config.home.openGraph.image.height,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: origin,
        name: brand,
        ...(description ? { description } : {}),
        inLanguage: schemaInLanguage(config.site.locale),
        publisher: { "@id": orgId },
      },
    ],
  }
}
