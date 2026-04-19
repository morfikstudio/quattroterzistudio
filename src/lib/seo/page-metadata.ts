import type { Metadata } from "next"
import type { SiteSeoConfig, SiteSeoPage, SiteSeoSite } from "./types"
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

export function buildPageMetadata(
  site: SiteSeoSite,
  page: SiteSeoPage,
): Metadata {
  const origin = getSiteOrigin()

  const brand = site.name.trim()
  const titleSegment = page.title.trim() || brand
  const fullTitle =
    titleSegment === brand ? titleSegment : `${titleSegment} | ${brand}`
  const description =
    page.description.trim() || site.defaultDescription.trim() || undefined

  const ogImage = page.openGraph.image
  const ogImageUrl = absoluteUrl(origin, ogImage.url)
  const ogImageAlt = ogImage.alt.trim() || fullTitle

  const metadata: Metadata = {
    title: titleSegment,
    description,
    ...(page.keywords.length > 0 ? { keywords: page.keywords } : {}),
    alternates: {
      canonical: absoluteUrl(origin, page.canonicalPath || "/"),
    },
    openGraph: {
      type: page.openGraph.type,
      url: absoluteUrl(origin, page.canonicalPath || "/"),
      siteName: site.name,
      locale: site.locale,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
      ...(site.twitterSite.trim() ? { site: site.twitterSite.trim() } : {}),
      ...(site.twitterCreator.trim()
        ? { creator: site.twitterCreator.trim() }
        : {}),
    },
  }

  return metadata
}

/** SEO fields for the home route; omit `title` so the page can set `title.absolute` and avoid double-applying the root template. */
export function buildHomeMetadata(config: SiteSeoConfig): Metadata {
  const { title: _title, ...rest } = buildPageMetadata(config.site, config.home)
  return rest
}

export function buildAboutMetadata(config: SiteSeoConfig): Metadata {
  return buildPageMetadata(config.site, config.about)
}

export function buildProjectsIndexMetadata(config: SiteSeoConfig): Metadata {
  return buildPageMetadata(config.site, config.projects)
}

export function buildArchiveMetadata(config: SiteSeoConfig): Metadata {
  return buildPageMetadata(config.site, config.archive)
}
