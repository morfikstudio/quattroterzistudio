import type { Metadata } from "next"

import type { PROJECT_METADATA_QUERY_RESULT } from "@/sanity/types"
import { urlFor } from "@/sanity/lib/image"
import siteSeo from "@/data/site-seo.json"

import type { SiteSeoConfig } from "./types"
import { getSiteOrigin } from "./site-url"
import { portableBlocksToPlainText } from "./portable-text-plain"

type ProjectDoc = NonNullable<PROJECT_METADATA_QUERY_RESULT>

type CoverFields = Pick<ProjectDoc, "coverDetail" | "coverList">

type ImageField =
  | NonNullable<NonNullable<ProjectDoc["coverDetail"]>["landscape"]>
  | NonNullable<NonNullable<ProjectDoc["coverDetail"]>["portrait"]>
  | undefined

function getCoverImageForOg(covers: CoverFields): ImageField {
  const d = covers.coverDetail
  const list = covers.coverList
  if (d?.landscape?.asset) {
    return d.landscape
  }
  if (d?.portrait?.asset) {
    return d.portrait
  }
  if (list?.landscape?.asset) {
    return list.landscape
  }
  if (list?.portrait?.asset) {
    return list.portrait
  }
  return undefined
}

function getCoverAlt(covers: CoverFields, fallbackTitle: string): string {
  return (
    covers.coverDetail?.alt?.trim() ||
    covers.coverList?.alt?.trim() ||
    fallbackTitle
  )
}

function projectOgImageUrlAndAlt(
  covers: CoverFields,
  fallbackTitle: string,
): { url: string; alt: string } | undefined {
  const source = getCoverImageForOg(covers)
  if (!source?.asset) {
    return undefined
  }

  const url = urlFor(source)
    .width(1200)
    .height(630)
    .fit("crop")
    .auto("format")
    .url()
  const alt = getCoverAlt(covers, fallbackTitle)
  return { url, alt }
}

function defaultOgFromSite(
  config: SiteSeoConfig,
  origin: string,
): {
  url: string
  alt: string
} {
  const path = config.home.openGraph.image.url.trim()
  const url = path.startsWith("http")
    ? path
    : `${origin}${path.startsWith("/") ? path : `/${path}`}`
  const alt = config.home.openGraph.image.alt.trim() || config.site.name
  return { url, alt }
}

export function buildProjectDetailMetadata(
  project: PROJECT_METADATA_QUERY_RESULT,
  slug: string,
): Metadata {
  const config = siteSeo as SiteSeoConfig
  const origin = getSiteOrigin()
  const site = config.site

  if (!project) {
    return {}
  }

  const brand = site.name.trim()
  const baseTitle = project.title?.trim() || "Project"
  const fullTitle = baseTitle === brand ? baseTitle : `${baseTitle} | ${brand}`
  const description =
    portableBlocksToPlainText(project.description) ||
    site.defaultDescription.trim() ||
    undefined

  const canonicalPath = `/projects/${slug}`
  const canonical = `${origin}${canonicalPath}`

  const og =
    projectOgImageUrlAndAlt(project, baseTitle) ??
    defaultOgFromSite(config, origin)

  return {
    title: baseTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: site.name,
      locale: site.locale,
      title: fullTitle,
      description,
      images: [{ url: og.url, alt: og.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [og.url],
      ...(site.twitterSite.trim() ? { site: site.twitterSite.trim() } : {}),
      ...(site.twitterCreator.trim()
        ? { creator: site.twitterCreator.trim() }
        : {}),
    },
  }
}
