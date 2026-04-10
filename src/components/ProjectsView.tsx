"use client"

import { useRef, useState, useCallback } from "react"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import ProjectsScroll, { type ProjectsScrollHandle } from "./ProjectsScroll"
import ProjectsList from "./ProjectsList"

type View = "scroll" | "list"

type Props = {
  projects: PROJECTS_QUERY_RESULT
}

export default function ProjectsView({ projects }: Props) {
  const [view, setView] = useState<View>("scroll")
  const scrollRef = useRef<ProjectsScrollHandle>(null)

  const handleSwitchToList = useCallback(() => {
    setView("list")
  }, [])

  /* Called by ProjectsList after its own word-exit animation completes */
  const handleSwitchToScroll = useCallback(() => {
    setView("scroll")
    requestAnimationFrame(() => scrollRef.current?.reveal())
  }, [])

  return (
    <>
      <ProjectsScroll
        ref={scrollRef}
        projects={projects}
        onArchiveClick={handleSwitchToList}
        isHidden={view === "list"}
      />
      {view === "list" && (
        <div className="fixed inset-0 z-40 bg-white">
          <ProjectsList onSelectionClick={handleSwitchToScroll} />
        </div>
      )}
    </>
  )
}
