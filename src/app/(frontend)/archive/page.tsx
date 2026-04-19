import type { SiteSeoConfig } from "@/lib/seo/types"
import { buildArchiveMetadata } from "@/lib/seo/page-metadata"
import siteSeo from "@/data/site-seo.json"
import { sanityFetch } from "@/sanity/lib/client"
import { ARCHIVE_PROJECTS_QUERY } from "@/sanity/lib/queries"
import ProjectsListPlain from "@/components/ProjectsListPlain"

export const metadata = buildArchiveMetadata(siteSeo as SiteSeoConfig)

export default async function Page() {
  const projects = await sanityFetch({ query: ARCHIVE_PROJECTS_QUERY })
  return (
    <main className="h-screen overflow-hidden">
      <ProjectsListPlain projects={projects} />
    </main>
  )
}
