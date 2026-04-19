import type { MetadataRoute } from "next"

import { client } from "@/sanity/lib/client"
import { PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries"
import { getSiteOrigin } from "@/lib/seo/site-url"

export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${origin}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/archive`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${origin}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  let slugRows: { slug: string }[] = []

  try {
    const slugs = await client.fetch(PROJECT_SLUGS_QUERY)
    slugRows = Array.isArray(slugs) ? slugs : []
  } catch {
    slugRows = []
  }

  const projectEntries: MetadataRoute.Sitemap = slugRows
    .filter((row) => typeof row.slug === "string" && row.slug.length > 0)
    .map((row) => ({
      url: `${origin}/projects/${row.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

  return [...staticEntries, ...projectEntries]
}
