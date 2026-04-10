import { cookies } from "next/headers"

import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import ProjectsView from "@/components/ProjectsView"
import SplashMarquee from "@/components/SplashMarquee"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })
  const cookieStore = await cookies()
  const forceShow = cookieStore.has("show_splash")

  return (
    <main>
      <SplashMarquee
        title="Welcome to Quattroterzi Studio"
        ctaText="Click anywhere to enter"
        forceShow={forceShow}
      />
      <ProjectsView projects={projects} />
    </main>
  )
}
