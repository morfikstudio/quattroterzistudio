import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"
import ProjectsList from "@/components/ProjectsList"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })
  return (
    <main className="h-screen overflow-hidden">
      <ProjectsList projects={projects} />
    </main>
  )
}
