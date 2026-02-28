import Link from "next/link"
import Image from "next/image"

import { urlFor } from "@/sanity/lib/image"

type ProjectCardProps = {
  _id: string
  title?: string | null
  slug?: { current?: string | null } | null
  media?: Array<{ _key?: string; asset?: { _ref?: string }; alt?: string }> | null
}

export function ProjectCard({ title, slug, media }: ProjectCardProps) {
  const href = slug?.current ? `/projects/${slug.current}` : "#"
  const firstImage = media?.[0]

  return (
    <Link className="group block" href={href}>
      <article className="flex flex-col gap-2">
        {firstImage?.asset ? (
          <div className="overflow-hidden rounded-lg">
            <Image
              src={urlFor(firstImage).width(600).height(340).url()}
              width={600}
              height={340}
              alt={firstImage.alt || title || "Project"}
              className="transition-transform group-hover:scale-105"
            />
          </div>
        ) : null}
        <h2 className="text-xl font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">
          {title ?? "Untitled"}
        </h2>
      </article>
    </Link>
  )
}
