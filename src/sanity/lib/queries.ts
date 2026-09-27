import { defineQuery } from "next-sanity"

const IMAGE_META = `"meta": asset->metadata{ lqip, "width": dimensions.width }`

const RESPONSIVE_IMAGE = `{
  ...,
  portrait{ ..., ${IMAGE_META} },
  landscape{ ..., ${IMAGE_META} }
}`

const PROJECTS_LIST_PROJECTION = `
    _id,
    orderRank,
    title,
    slug,
    year,
    coverList${RESPONSIVE_IMAGE},
    coverDetail${RESPONSIVE_IMAGE}
`

/**
 * /projects
 */

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current) && isSelected == true]|order(orderRank asc)[0...100]{${PROJECTS_LIST_PROJECTION}
  }`,
)

/**
 * /archive — tutti i progetti (indipendentemente da isSelected)
 */

export const ARCHIVE_PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)]|order(orderRank asc)[0...100]{${PROJECTS_LIST_PROJECTION}
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

export const PROJECT_METADATA_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0]{
    title,
    description,
    slug,
    coverDetail,
    coverList
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
    coverDetail${RESPONSIVE_IMAGE},
    blocks[]{
      _key,
      _type,
      payoff,
      "variant": coalesce(variant, singleVariant, doubleVariant),
      useVideo,
      image{ ..., ${IMAGE_META} },
      alt,
      "videoAsset": video.asset->{ url, mimeType, originalFilename },
      media1{
        image{ ..., ${IMAGE_META} },
        alt
      },
      media2{
        image{ ..., ${IMAGE_META} },
        alt
      }
    },
    "nextProject": coalesce(
      *[_type == "project" && defined(slug.current) && orderRank > ^.orderRank]|order(orderRank asc)[0]{ "id": _id, slug, title, coverList${RESPONSIVE_IMAGE}, coverDetail${RESPONSIVE_IMAGE}, year },
      *[_type == "project" && defined(slug.current)]|order(orderRank asc)[0]{ "id": _id, slug, title, coverList${RESPONSIVE_IMAGE}, coverDetail${RESPONSIVE_IMAGE}, year }
    )
  }`,
)
