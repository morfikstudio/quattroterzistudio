import { sanityFetch } from "@/sanity/lib/client"
import { ARCHIVE_PROJECTS_QUERY } from "@/sanity/lib/queries"
import ProjectsList from "@/components/ProjectsList"
import ProjectsListPlain from "@/components/ProjectsListPlain"

export default async function Page() {
  const projects = await sanityFetch({ query: ARCHIVE_PROJECTS_QUERY })
  return (
    <main className="h-screen overflow-hidden">
      <ProjectsListPlain projects={projects} />
    </main>
  )
}
