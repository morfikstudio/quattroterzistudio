import type { SiteSeoConfig } from "@/lib/seo/types"
import { buildProjectsIndexMetadata } from "@/lib/seo/page-metadata"
import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import siteSeo from "@/data/site-seo.json"

import ProjectsScroll from "@/components/ProjectsScroll"

export const metadata = buildProjectsIndexMetadata(siteSeo as SiteSeoConfig)

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })

  return (
    <main>
      <ProjectsScroll projects={projects} />
    </main>
  )
}
