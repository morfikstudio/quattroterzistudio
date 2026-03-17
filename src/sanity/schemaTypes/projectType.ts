import { FolderIcon } from "@sanity/icons"
import { orderRankField } from "@sanity/orderable-document-list"
import { defineArrayMember, defineField, defineType } from "sanity"

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: FolderIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "details", title: "Details" },
    { name: "covers", title: "Covers" },
    { name: "media", title: "Media" },
  ],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "title",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      group: "content",
    }),
    defineField({
      name: "payoff",
      title: "Payoff",
      type: "string",
      description: "Una frase semplice senza formattazioni",
      group: "content",
    }),
    defineField({
      name: "year",
      type: "number",
      group: "details",
      validation: (rule) =>
        rule
          .required()
          .min(1900)
          .max(new Date().getFullYear())
          .error("Insert a valid year")
          .warning("Year is required"),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "sector",
      title: "Sector",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      of: [{ type: "string" }],
      description: "Add one credit at a time (you can add multiple)",
      group: "details",
    }),
    defineField({
      name: "coverList",
      title: "Cover List",
      type: "object",
      group: "covers",
      fields: [
        defineField({
          name: "portrait",
          title: "Portrait (9:16)",
          type: "image",
          description:
            "Use a 9:16 image (e.g. 1080x1920px). If the uploaded image has a different ratio, use the crop tool to adapt the selection.",
          options: {
            hotspot: {
              previews: [{ title: "9:16", aspectRatio: 9 / 16 }],
            },
          },
        }),
        defineField({
          name: "landscape",
          title: "Landscape (16:9)",
          type: "image",
          description:
            "Use a 16:9 image (e.g. 1920x1080px). If the uploaded image has a different ratio, use the crop tool to adapt the selection.",
          options: {
            hotspot: {
              previews: [{ title: "16:9", aspectRatio: 16 / 9 }],
            },
          },
        }),
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),
    defineField({
      name: "coverDetail",
      title: "Cover Detail",
      type: "object",
      group: "covers",
      fields: [
        defineField({
          name: "portrait",
          title: "Portrait",
          type: "image",
          description:
            "Use a 9:16 image (e.g. 1080x1920px). If the uploaded image has a different ratio, use the crop tool to adapt the selection.",
          options: {
            hotspot: {
              previews: [{ title: "9:16", aspectRatio: 9 / 16 }],
            },
          },
        }),
        defineField({
          name: "landscape",
          title: "Landscape",
          type: "image",
          description:
            "Use a 4:3 image (e.g. 1920x1440px). If the uploaded image has a different ratio, use the crop tool to adapt the selection.",
          options: {
            hotspot: {
              previews: [{ title: "4:3", aspectRatio: 4 / 3 }],
            },
          },
        }),
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),
    defineField({
      name: "media",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alternative text",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context?.parent as {
                    asset?: { _ref?: string }
                  }
                  return !value && parent?.asset?._ref
                    ? "Alt text is required when an image is present"
                    : true
                }),
            }),
          ],
        }),
        defineArrayMember({
          type: "object",
          name: "video",
          title: "Video",
          fields: [
            defineField({
              name: "file",
              type: "file",
              title: "Video file",
              options: { accept: "video/*" },
            }),
            defineField({
              name: "url",
              type: "url",
              title: "URL video",
              description:
                "External link (YouTube, Vimeo, or self-hosted video)",
            }),
            defineField({
              name: "alt",
              type: "string",
              title: "Alternative text",
            }),
          ],
          validation: (rule) =>
            rule.custom((value) => {
              const v = value as {
                file?: { asset?: { _ref?: string } }
                url?: string
              }
              const hasFile = !!v?.file?.asset?._ref
              const hasUrl = !!v?.url?.trim()
              return hasFile || hasUrl
                ? true
                : "Insert a video file or a URL (at least one is required)"
            }),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      coverList: "coverList",
    },
    prepare({ title, coverList }) {
      const media = coverList?.portrait?.asset || coverList?.landscape?.asset
      return {
        title: title ?? "Untitled",
        media,
      }
    },
  },
})
