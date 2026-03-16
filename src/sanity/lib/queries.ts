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
 * /projects/[slug]
 */

export const PROJECT_SLUGS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }`,
)

export const PROJECT_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0]{
    _id,
    orderRank,
    title,
    slug,
    description,
    year,
    client,
    sector,
    credits,
    coverDetail {
      portrait {
        _type,
        "asset": asset-> {
          _id,
          _type,
          url,
          metadata { dimensions }
        },
        hotspot,
        crop
      },
      landscape {
        _type,
        "asset": asset-> {
          _id,
          _type,
          url,
          metadata { dimensions }
        },
        hotspot,
        crop
      },
      alt
    },
    "nextProject": coalesce(
      *[_type == "project" && defined(slug.current) && orderRank > ^.orderRank]|order(orderRank asc)[0]{ "id": _id, slug, title, coverImage, coverThumb, year },
      *[_type == "project" && defined(slug.current)]|order(orderRank asc)[0]{ "id": _id, slug, title, coverImage, coverThumb, year }
    )
  }`,
)
