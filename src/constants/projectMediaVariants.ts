/**
 * Single source of truth for project media block layout variants (CMS + frontend).
 */

export const SINGLE_MEDIA_VARIANTS = [
  {
    title: "Full Width",
    value: "full-width",
    layout: "col-span-13",
  },
  /* Float Left */
  {
    title: "Float Left Large",
    value: "float-left-l",
    layout: "col-start-1 col-span-11 md:col-span-10",
  },
  {
    title: "Float Left Medium",
    value: "float-left-m",
    layout: "col-start-1 col-span-9 md:col-span-8",
  },
  {
    title: "Float Left Small",
    value: "float-left-s",
    layout: "col-start-1 col-span-7 md:col-span-6",
  },
  {
    title: "Float Left Extra Small",
    value: "float-left-xs",
    layout: "col-start-1 col-span-7 md:col-span-4",
  },
  /* Float Right */
  {
    title: "Float Right Large",
    value: "float-right",
    layout: "col-start-3 col-span-11",
  },
  {
    title: "Float Right Medium",
    value: "float-right-m",
    layout: "col-start-5 col-span-9",
  },
  {
    title: "Float Right Small",
    value: "float-right-s",
    layout: "col-start-7 col-span-7",
  },
  {
    title: "Float Right Extra Small",
    value: "float-right-xs",
    layout: "col-start-7 md:col-start-9 col-span-7 md:col-span-4",
  },
] as const

export const DOUBLE_MEDIA_VARIANTS = [
  {
    title: "50 / 51",
    value: "50-51",
    landscapeLayout1: "md:col-start-1 md:col-span-6",
    landscapeLayout2: "md:col-start-7 md:col-span-6",
    portraitLayout1: "col-start-4 col-span-10",
    portraitLayout2: "col-start-1 col-span-10",
  },
  {
    title: "51 / 50",
    value: "51-50",
    landscapeLayout1: "md:col-start-1 md:col-span-6",
    landscapeLayout2: "md:col-start-7 md:col-span-6",
    portraitLayout1: "col-start-1 col-span-10",
    portraitLayout2: "col-start-4 col-span-10",
  },
  {
    title: "40 / 50",
    value: "40-50",
    landscapeLayout1: "md:col-start-1 md:col-span-5",
    landscapeLayout2: "md:col-start-7 md:col-span-6",
    portraitLayout1: "col-start-4 col-span-10",
    portraitLayout2: "col-start-1 col-span-7",
  },
  {
    title: "50 / 40",
    value: "50-40",
    landscapeLayout1: "md:col-start-1 md:col-span-6",
    landscapeLayout2: "md:col-start-8 md:col-span-5",
    portraitLayout1: "col-start-1 col-span-10",
    portraitLayout2: "col-start-7 col-span-7",
  },
  {
    title: "30 / 50",
    value: "30-50",
    landscapeLayout1: "md:col-start-2 md:col-span-4",
    landscapeLayout2: "md:col-start-7 md:col-span-6",
    portraitLayout1: "col-start-4 col-span-10",
    portraitLayout2: "col-start-1 col-span-7",
  },
  {
    title: "50 / 30",
    value: "50-30",
    landscapeLayout1: "md:col-start-1 md:col-span-6",
    landscapeLayout2: "md:col-start-8 md:col-span-4",
    portraitLayout1: "col-start-1 col-span-10",
    portraitLayout2: "col-start-7 col-span-7",
  },

  {
    title: "80 / 20",
    value: "80-20",
    landscapeLayout1: "md:col-start-1 md:col-span-8",
    landscapeLayout2: "md:col-start-10 md:col-span-3",
    portraitLayout1: "col-start-1 col-span-10",
    portraitLayout2: "col-start-7 col-span-7",
  },
  {
    title: "20 / 80",
    value: "20-80",
    landscapeLayout1: "md:col-start-1 md:col-span-3",
    landscapeLayout2: "md:col-start-5 md:col-span-8",
    portraitLayout1: "col-start-1 col-span-10",
    portraitLayout2: "col-start-7 col-span-7",
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
