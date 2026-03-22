import { defineField, defineType } from "sanity"

import {
  SINGLE_MEDIA_VARIANTS,
  DOUBLE_MEDIA_VARIANTS,
  getMediaVariantTitle,
} from "@/constants/projectMediaVariants"

type SlotValue = {
  image?: { asset?: unknown }
  video?: { asset?: unknown }
  alt?: string
}

type DoubleImageSlotValue = {
  image?: { asset?: unknown }
  alt?: string
}

type SingleMediaBlockValue = SlotValue & {
  useVideo?: boolean
  mediaKind?: "image" | "video"
  variant?: string
}

const SINGLE_MEDIA_FIELDSET = "singleMediaStep"
const DOUBLE_MEDIA_FIELDSET = "doubleMediaStep"

function resolveSingleMediaKind(
  parent: SingleMediaBlockValue | undefined,
): "image" | "video" {
  if (parent === undefined) return "image"
  if (typeof parent.useVideo === "boolean") {
    return parent.useVideo ? "video" : "image"
  }
  if (parent.mediaKind === "video") return "video"
  if (parent.mediaKind === "image") return "image"
  if (parent.video?.asset && !parent.image?.asset) return "video"
  return "image"
}

function validateSingleMedia(
  value: SingleMediaBlockValue | undefined,
): true | string {
  const kind = resolveSingleMediaKind(value)
  if (kind === "image") {
    if (!value?.image?.asset) {
      return "Media: upload an image"
    }
    if (value?.video?.asset) {
      return "Media: remove the video or set content type to Video"
    }
    return true
  }
  if (!value?.video?.asset) {
    return "Media: upload a video"
  }
  if (value?.image?.asset) {
    return "Media: remove the image or set content type to Image"
  }
  return true
}

function validateDoubleImageSlot(
  slot: DoubleImageSlotValue | undefined,
): true | string {
  if (!slot?.image?.asset) {
    return "Image required"
  }
  return true
}

const doubleMediaImageSlotFields = () => [
  defineField({
    name: "image",
    title: "Image",
    type: "image",
    options: { hotspot: true },
  }),
  defineField({
    name: "alt",
    title: "Alternative text",
    type: "string",
    hidden: ({ parent }) => !parent?.image?.asset,
  }),
]

export const projectMediaSingle = defineType({
  name: "projectMediaSingle",
  title: "Single media",
  type: "object",
  description:
    "You chose Single media. Use the fields below to set layout and upload content.",
  fieldsets: [
    {
      name: SINGLE_MEDIA_FIELDSET,
      title: "Single media",
      options: { collapsible: false, columns: 1 },
    },
  ],
  fields: [
    defineField({
      name: "variant",
      title: "Layout variant",
      type: "string",
      fieldset: SINGLE_MEDIA_FIELDSET,
      initialValue: SINGLE_MEDIA_VARIANTS[0].value,
      options: {
        list: [...SINGLE_MEDIA_VARIANTS],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "useVideo",
      title: "Content type",
      type: "boolean",
      fieldset: SINGLE_MEDIA_FIELDSET,
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      fieldset: SINGLE_MEDIA_FIELDSET,
      options: { hotspot: true },
      hidden: ({ parent }) =>
        resolveSingleMediaKind(parent as SingleMediaBlockValue) === "video",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      fieldset: SINGLE_MEDIA_FIELDSET,
      options: { accept: "video/*" },
      hidden: ({ parent }) =>
        resolveSingleMediaKind(parent as SingleMediaBlockValue) === "image",
    }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      fieldset: SINGLE_MEDIA_FIELDSET,
      hidden: ({ parent }) => {
        const p = parent as SingleMediaBlockValue
        return resolveSingleMediaKind(p) !== "image" || !p?.image?.asset
      },
    }),
  ],
  preview: {
    select: {
      variant: "variant",
      useVideo: "useVideo",
      image: "image",
    },
    prepare({ variant, useVideo, image }) {
      const variantTitle = getMediaVariantTitle("projectMediaSingle", variant)
      const kindLabel = useVideo ? "Video" : "Image"
      return {
        title: variantTitle,
        subtitle: `Single media · ${kindLabel}`,
        media: image,
      }
    },
  },
  validation: (rule) =>
    rule.custom((value) => validateSingleMedia(value as SingleMediaBlockValue)),
})

export const projectMediaDouble = defineType({
  name: "projectMediaDouble",
  title: "Double media",
  type: "object",
  description:
    "You chose Double media. Use the fields below to set layout and upload two images.",
  fieldsets: [
    {
      name: DOUBLE_MEDIA_FIELDSET,
      title: "Double media",
      options: { collapsible: false, columns: 1 },
    },
  ],
  fields: [
    defineField({
      name: "variant",
      title: "Layout variant",
      type: "string",
      fieldset: DOUBLE_MEDIA_FIELDSET,
      initialValue: DOUBLE_MEDIA_VARIANTS[0].value,
      options: {
        list: [...DOUBLE_MEDIA_VARIANTS],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "media1",
      type: "object",
      fieldset: DOUBLE_MEDIA_FIELDSET,
      fields: doubleMediaImageSlotFields(),
      validation: (rule) =>
        rule.custom((v) => validateDoubleImageSlot(v as DoubleImageSlotValue)),
    }),
    defineField({
      name: "media2",
      type: "object",
      fieldset: DOUBLE_MEDIA_FIELDSET,
      fields: doubleMediaImageSlotFields(),
      validation: (rule) =>
        rule.custom((v) => validateDoubleImageSlot(v as DoubleImageSlotValue)),
    }),
  ],
  preview: {
    select: {
      variant: "variant",
      img1: "media1.image",
    },
    prepare({ variant, img1 }) {
      const variantTitle = getMediaVariantTitle("projectMediaDouble", variant)
      return {
        title: variantTitle,
        subtitle: "Double media",
        media: img1,
      }
    },
  },
})

export const projectMediaPayoff = defineType({
  name: "projectMediaPayoff",
  title: "Payoff",
  type: "object",
  description: "Short plain text (no formatting).",
  fields: [
    defineField({
      name: "payoff",
      title: "Payoff",
      type: "string",
      description: "A simple plain text (no formatting).",
      validation: (rule) =>
        rule.required().custom((value) => {
          const t = typeof value === "string" ? value.trim() : ""
          if (t.length < 10) return "Field must be at least 10 characters long"
          return true
        }),
    }),
  ],
  preview: {
    select: { payoff: "payoff" },
    prepare({ payoff }) {
      const t = payoff?.trim()
      return {
        title: "Payoff",
        subtitle: t ? (t.length > 80 ? `${t.slice(0, 80)}…` : t) : "—",
      }
    },
  },
})
