"use client"

import HoverListDesktop from "./HoverListDesktop"
import HoverListMobile from "./HoverListMobile"
import { HoverListProps } from "./types"
import { BREAKPOINT_THRESHOLDS, useBreakpoint } from "@/stores/breakpointStore"

export type { HoverListItem } from "./types"

export default function HoverList(props: HoverListProps) {
  const { viewportWidth } = useBreakpoint()
  const isDesktop =
    viewportWidth !== null && viewportWidth >= BREAKPOINT_THRESHOLDS.tabletMin

  if (viewportWidth === null) return null

  return isDesktop ? (
    <HoverListDesktop {...props} />
  ) : (
    <HoverListMobile {...props} />
  )
}
