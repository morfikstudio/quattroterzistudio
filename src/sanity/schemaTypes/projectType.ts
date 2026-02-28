import { FolderIcon } from "@sanity/icons"
import { defineArrayMember, defineField, defineType } from "sanity"

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: FolderIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "media",
      type: "array",
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
                  const parent = context?.parent as { asset?: { _ref?: string } }
                  return !value && parent?.asset?._ref
                    ? "Alt text is required when an image is present"
                    : true
                }),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      firstMediaAsset: "media.0.asset",
    },
    prepare({ title, firstMediaAsset }) {
      return {
        title: title ?? "Untitled",
        media: firstMediaAsset,
      }
    },
  },
})
