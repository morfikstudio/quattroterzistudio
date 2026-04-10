"use client"

import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import ProjectsScroll from "./ProjectsScroll"

type Props = {
  projects: PROJECTS_QUERY_RESULT
}

export default function ProjectsView({ projects }: Props) {
  return <ProjectsScroll projects={projects} />
}
