import { notFound } from "next/navigation"
import Link from "next/link"

import { client, sanityFetch } from "@/sanity/lib/client"
import { WORK_QUERY, WORK_SLUGS_QUERY } from "@/sanity/lib/queries"

import Project from "@/components/Project"

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(WORK_SLUGS_QUERY)
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
    query: WORK_QUERY,
    params: { slug },
  })

  if (!project) {
    notFound()
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Project title={project.title ?? ""} media={project.media ?? []} />
      <hr />
      <Link href="/projects" className="text-pink-600 hover:underline">
        &larr; Return to projects
      </Link>
    </main>
  )
}
