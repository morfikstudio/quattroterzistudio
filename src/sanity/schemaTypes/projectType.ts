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
    { name: "blocks", title: "Blocks" },
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
      name: "isSelected",
      title: "In evidenza su /projects",
      type: "boolean",
      description:
        "Se attivo, il progetto compare nella pagina progetti. L’archivio elenca sempre tutti i progetti.",
      initialValue: false,
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
      name: "blocks",
      title: "Blocks",
      type: "array",
      group: "blocks",
      of: [
        defineArrayMember({ type: "projectMediaSingle" }),
        defineArrayMember({ type: "projectMediaDouble" }),
        defineArrayMember({ type: "projectMediaPayoff" }),
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
