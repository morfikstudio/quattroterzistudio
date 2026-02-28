import Image from "next/image"

import { urlFor } from "@/sanity/lib/image"
import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { Title } from "@/components/title"

type ProjectProps = NonNullable<PROJECT_QUERY_RESULT>

export function Project({ title, media }: ProjectProps) {
  return (
    <article className="flex flex-col gap-8">
      <header>
        <Title>{title ?? "Untitled"}</Title>
      </header>
      {media?.length ? (
        <div className="flex flex-col gap-6">
          {media.map((item, i) =>
            item.asset ? (
              <figure key={item._key ?? i} className="flex flex-col gap-2">
                <Image
                  src={urlFor(item).width(1200).url()}
                  width={1200}
                  height={800}
                  alt={item.alt ?? title ?? "Project image"}
                  className="rounded-lg w-full h-auto"
                />
              </figure>
            ) : null,
          )}
        </div>
      ) : null}
    </article>
  )
}
