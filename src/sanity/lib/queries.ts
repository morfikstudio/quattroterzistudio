import { defineQuery } from "next-sanity"

/**
 * /projects
 */

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)]|order(orderRank asc)[0...50]{
    _id,
    orderRank,
    title,
    slug,
    year,
    coverImage,
    coverThumb
  }`,
)

/**
 * /works/[slug]
 */

export const WORK_SLUGS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }`,
)

export const WORK_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    description,
    year,
    client,
    sector,
    credits,
    coverImage,
    media[] {
      _type,
      _key,
      asset,
      alt,
      file,
      url,
      "fileUrl": file.asset->url
    }
  }`,
)
