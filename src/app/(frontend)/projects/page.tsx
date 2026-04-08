import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import ProjectsScroll from "@/components/ProjectsScroll"
import SplashMarquee from "@/components/SplashMarquee"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })

  return (
    <main>
      <SplashMarquee
        title="Welcome to Quattroterzi Studio"
        ctaText="Click anywhere to enter"
      />
      <ProjectsScroll projects={projects} />
    </main>
  )
}
