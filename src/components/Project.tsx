import Image from "next/image"

import { urlFor } from "@/sanity/lib/image"
import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { getImageUrl } from "@/utils/media"
import { useBreakpoint } from "@/stores/breakpointStore"

type ProjectProps = NonNullable<PROJECT_QUERY_RESULT>

export default function Project({ title, media }: ProjectProps) {
  const { current: breakpoint } = useBreakpoint()

  return (
    <div className="flex flex-col gap-8">
      {media?.length ? (
        <div className="flex flex-col gap-6">
          {media.map((item, i) => {
            const key = item._key ?? i
            if (item._type === "image" && item.asset) {
              return (
                <figure key={key} className="flex flex-col gap-2">
                  <Image
                    src={getImageUrl({
                      image: item,
                      breakpoint,
                    })}
                    fill
                    sizes="100vw"
                    priority={i < 2}
                    alt={item.alt ?? title ?? ""}
                    className="rounded-lg w-full h-auto"
                  />
                </figure>
              )
            }
            if (item._type === "video") {
              const src = item.fileUrl || item.url
              if (!src) return null
              const alt = item.alt ?? title ?? "Project video"
              return (
                <figure key={key} className="flex flex-col gap-2">
                  <video
                    src={src}
                    controls
                    playsInline
                    className="rounded-lg w-full h-auto"
                    aria-label={alt}
                  />
                </figure>
              )
            }
            return null
          })}
        </div>
      ) : null}
    </div>
  )
}
