import { notFound } from "next/navigation"
import Link from "next/link"

import { client, customSanityFetch } from "@/sanity/lib/client"
import {
  PROJECT_QUERY,
  PROJECT_SLUGS_QUERY,
} from "@/sanity/lib/queries"

import { Project } from "@/components/project"

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

  const project = await customSanityFetch({
    query: PROJECT_QUERY,
    params: { slug },
  })

  if (!project) {
    notFound()
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Project {...project} />
      <hr />
      <Link href="/projects" className="text-pink-600 hover:underline">
        &larr; Return to projects
      </Link>
    </main>
  )
}
