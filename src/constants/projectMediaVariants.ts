/**
 * Single source of truth for project media block layout variants (CMS + frontend).
 */

export const SINGLE_MEDIA_VARIANTS = [
  {
    title: "Full Width",
    value: "full-width",
    layout: "col-span-12",
  },
  /* Float Left */
  {
    title: "Float Left Large",
    value: "float-left-l",
    layout: "col-span-10",
  },
  {
    title: "Float Left Medium",
    value: "float-left-m",
    layout: "col-span-8",
  },
  {
    title: "Float Left Small",
    value: "float-left-s",
    layout: "col-span-6",
  },
  {
    title: "Float Left Extra Small",
    value: "float-left-xs",
    layout: "col-span-4",
  },
  /* Float Right */
  {
    title: "Float Right",
    value: "float-right",
    layout: "col-span-10 col-start-3",
  },
  {
    title: "Float Right Medium",
    value: "float-right-m",
    layout: "col-span-8 col-start-5",
  },
  {
    title: "Float Right Small",
    value: "float-right-s",
    layout: "col-span-6 col-start-7",
  },
  {
    title: "Float Right Extra Small",
    value: "float-right-xs",
    layout: "col-span-4 col-start-9",
  },
] as const

export const DOUBLE_MEDIA_VARIANTS = [
  { title: "Variant 1", value: "v1" },
  { title: "Variant 2", value: "v2" },
] as const

export function getMediaLayoutByVariant(
  type: "projectMediaSingle" | "projectMediaDouble",
  variant: string | null | undefined,
): string {
  if (type === "projectMediaSingle") {
    return (
      SINGLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.layout ??
      "col-span-12 w-full min-w-0"
    )
  }

  return ""
}

export function getMediaVariantTitle(
  type: "projectMediaSingle" | "projectMediaDouble",
  variant: string | null | undefined,
): string {
  if (type === "projectMediaSingle") {
    return (
      SINGLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.title ?? ""
    )
  }

  if (type === "projectMediaDouble") {
    return (
      DOUBLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.title ?? ""
    )
  }

  return ""
}
