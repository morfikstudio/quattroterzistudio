"use client"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"

import Image from "@/components/ui/Image"

type ProjectProps = {
  title: string
  media: NonNullable<PROJECT_QUERY_RESULT>["media"]
}

const aspectClass = "relative w-full aspect-video"

export default function Project({ title, media }: ProjectProps) {
  if (!media?.length) return null

  return media.map((item, i) => {
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
  })
}
