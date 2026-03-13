import { defineQuery } from "next-sanity"

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

export const PROJECT_SLUGS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }`,
)

export const PROJECT_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    year,
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
