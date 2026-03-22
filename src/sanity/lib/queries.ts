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
    coverList,
    coverDetail
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
    coverDetail,
    blocks[]{
      _key,
      _type,
      payoff,
      "variant": coalesce(variant, singleVariant, doubleVariant),
      useVideo,
      image,
      alt,
      "videoAsset": video.asset->{ url, mimeType, originalFilename },
      media1{
        image,
        alt
      },
      media2{
        image,
        alt
      }
    },
    "nextProject": coalesce(
      *[_type == "project" && defined(slug.current) && orderRank > ^.orderRank]|order(orderRank asc)[0]{ "id": _id, slug, title, coverList, coverDetail, year },
      *[_type == "project" && defined(slug.current)]|order(orderRank asc)[0]{ "id": _id, slug, title, coverList, coverDetail, year }
    )
  }`,
)
