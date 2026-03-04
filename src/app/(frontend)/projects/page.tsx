import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import Projects from "@/components/Projects"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })

  return (
    <main className="relative">
      <Projects projects={projects} />
    </main>
  )
}
