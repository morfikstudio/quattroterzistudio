import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import ProjectsScroll from "@/components/ProjectsScroll"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })

  return (
    <main>
      <ProjectsScroll projects={projects} />
    </main>
  )
}
