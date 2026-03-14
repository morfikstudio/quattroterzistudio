"use client"

import { PortableText } from "next-sanity"

import type { WORK_QUERY_RESULT } from "@/sanity/types"
import { components as portableTextComponents } from "@/sanity/portableTextComponents"

import Image from "@/components/ui/Image"

type ProjectProps = {
  title: string
  description: NonNullable<WORK_QUERY_RESULT>["description"]
  media: NonNullable<WORK_QUERY_RESULT>["media"]
  year: NonNullable<WORK_QUERY_RESULT>["year"]
  client: NonNullable<WORK_QUERY_RESULT>["client"]
  sector: NonNullable<WORK_QUERY_RESULT>["sector"]
  credits: NonNullable<WORK_QUERY_RESULT>["credits"]
}

const aspectClass = "relative w-full aspect-video"

export default function Project({
  title,
  description,
  media,
  year,
  client,
  sector,
  credits,
}: ProjectProps) {
  return (
    <div className="mt-8">
      {title ? <h1 className="text-2xl font-bold">{title}</h1> : null}

      {description?.length ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-8 prose-strong:text-inherit text-black">
          <PortableText
            value={description}
            components={portableTextComponents}
          />
        </div>
      ) : null}

      {year ? <p className="text-sm text-gray-500">{year}</p> : null}
      {client ? <p className="text-sm text-gray-500">{client}</p> : null}
      {sector ? <p className="text-sm text-gray-500">{sector}</p> : null}
      {credits?.length ? (
        <p className="text-sm text-gray-500">{credits.join(", ")}</p>
      ) : null}

      {!media?.length
        ? null
        : media.map((item, i) => {
            const key = item._key ?? i
            if (item._type === "image" && item.asset) {
              return (
                <div key={key} className={aspectClass}>
                  <Image
                    image={item}
                    resizeId="default"
                    fill
                    fit="cover"
                    priority={i < 2}
                  />
                </div>
              )
            }
            if (item._type === "video") {
              const src = item.fileUrl || item.url
              if (!src) return null
              return (
                <div key={key} className={aspectClass}>
                  <video
                    src={src}
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label={item.alt ?? title ?? "Project video"}
                    controls
                    playsInline
                    muted
                    autoPlay
                    loop
                  />
                </div>
              )
            }
            return null
          })}
    </div>
  )
}
