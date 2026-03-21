"use client"

import { useEffect } from "react"
import { useBreakpointStore } from "@/stores/breakpointStore"

export default function BreakpointProvider() {
  useEffect(() => {
    useBreakpointStore.getState().init()
    return () => useBreakpointStore.getState().destroy()
  }, [])

  return null
}
