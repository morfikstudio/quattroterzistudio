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
  {
    title: "50 / 51",
    value: "50-51",
    layout1: "col-span-6",
    layout2: "col-span-6",
  },
  {
    title: "51 / 50",
    value: "51-50",
    layout1: "col-span-6",
    layout2: "col-span-6",
  },
  {
    title: "40 / 50",
    value: "40-50",
    layout1: "col-span-5",
    layout2: "col-span-6 col-start-7",
  },
  {
    title: "50 / 40",
    value: "50-40",
    layout1: "col-span-6",
    layout2: "col-span-5 col-start-8",
  },
  {
    title: "30 / 50",
    value: "30-50",
    layout1: "col-span-4 col-start-2",
    layout2: "col-span-6 col-start-7",
  },
  {
    title: "50 / 30",
    value: "50-30",
    layout1: "col-span-6",
    layout2: "col-span-4 col-start-8",
  },
  {
    title: "20 / 80",
    value: "20-80",
    layout1: "col-span-3",
    layout2: "col-span-8 col-start-5",
  },
  {
    title: "80 / 20",
    value: "80-20",
    layout1: "col-span-8",
    layout2: "col-span-3 col-start-10",
  },
] as const

export function getMediaVariantTitle(
  type: "projectMediaSingle" | "projectMediaDouble",
  variant: string | null | undefined,
): string {
  if (type === "projectMediaSingle") {
    return (
      SINGLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.title ?? ""
    )
  } else if (type === "projectMediaDouble") {
    return (
      DOUBLE_MEDIA_VARIANTS.find((item) => item.value === variant)?.title ?? ""
    )
  }

  return ""
}
