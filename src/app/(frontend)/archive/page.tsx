import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"
import type { PROJECTS_QUERY_RESULT } from "@/sanity/types"
import ProjectsList from "@/components/ProjectsList"

function padToMinLength(
  projects: PROJECTS_QUERY_RESULT,
  min: number,
): PROJECTS_QUERY_RESULT {
  if (projects.length === 0) return projects
  const result = [...projects]
  while (result.length < min) {
    result.push(...projects)
  }
  return result.slice(0, Math.max(result.length, min)) as PROJECTS_QUERY_RESULT
}

export default async function Page() {
  const raw = await sanityFetch({ query: PROJECTS_QUERY })
  const projects = padToMinLength(raw, 10)

  return (
    <main className="h-screen overflow-hidden">
      <ProjectsList projects={projects} />
    </main>
  )
}
