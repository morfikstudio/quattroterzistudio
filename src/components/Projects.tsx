"use client"

import { useState } from "react"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"

import Button from "@/components/ui/Button"
import ProjectsList from "@/components/ProjectsList"
import ProjectsScroll from "@/components/ProjectsScroll"

type ProjectsProps = {
  projects: PROJECTS_QUERY_RESULT
}

export default function Projects({ projects }: ProjectsProps) {
  const [showArchive, setShowArchive] = useState<boolean>(false)

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ProjectsScroll projects={projects} />
      {showArchive ? <ProjectsList /> : null}

      <Button
        className="absolute bottom-20 left-10 z-10"
        onClick={() => setShowArchive(!showArchive)}
      >
        Archive
      </Button>
    </div>
  )
}
