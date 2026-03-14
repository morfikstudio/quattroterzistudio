import { defineLocations, PresentationPluginOptions } from "sanity/presentation"

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    project: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: `/works/${doc?.slug}`,
          },
          { title: "Projects index", href: `/projects` },
          { title: "Archive", href: `/archive` },
        ],
      }),
    }),
  },
}
