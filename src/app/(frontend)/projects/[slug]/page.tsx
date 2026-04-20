import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { client, sanityFetch } from "@/sanity/lib/client"
import {
  PROJECT_METADATA_QUERY,
  PROJECT_QUERY,
  PROJECT_SLUGS_QUERY,
} from "@/sanity/lib/queries"
import { buildProjectDetailMetadata } from "@/lib/seo/project-detail-metadata"

import ProjectDetail from "@/components/ProjectDetail"
import FadeInOnLoad from "@/components/ProjectDetail/FadeInOnLoad"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch({
    query: PROJECT_METADATA_QUERY,
    params: { slug },
  })
  return buildProjectDetailMetadata(project, slug)
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(PROJECT_SLUGS_QUERY)
    return Array.isArray(slugs) ? slugs : []
  } catch {
    return []
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const project = await sanityFetch({
    query: PROJECT_QUERY,
    params: { slug },
  })

  if (!project) {
    notFound()
  }

  return (
    <main>
      <FadeInOnLoad>
        <ProjectDetail {...project} />
      </FadeInOnLoad>
    </main>
  )
}
