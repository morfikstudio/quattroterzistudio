import Link from "next/link"

import { sanityFetch } from "@/sanity/lib/client"
import { PROJECTS_QUERY } from "@/sanity/lib/queries"

import Title from "@/components/ui/Title"
import ProjectCard from "@/components/ProjectCard"

export default async function Page() {
  const projects = await sanityFetch({ query: PROJECTS_QUERY })

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>Projects</Title>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project._id}>
            <ProjectCard {...project} />
          </li>
        ))}
      </ul>
      <hr />
      <Link href="/" className="text-pink-600 hover:underline">
        &larr; Return home
      </Link>
    </main>
  )
}
