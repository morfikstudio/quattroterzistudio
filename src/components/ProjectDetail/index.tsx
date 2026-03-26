"use client"

import { useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { PROJECT_QUERY_RESULT } from "@/sanity/types"
import { cn } from "@/utils/classNames"

import Hero from "./subcomponents/Hero"
import Contents from "./subcomponents/Contents"
import MediaBlocks from "./subcomponents/MediaBlocks"
import NextProjectTeaser from "./subcomponents/NextProjectTeaser"

gsap.registerPlugin(ScrollTrigger)

type ProjectProps = {
  coverDetail: NonNullable<PROJECT_QUERY_RESULT>["coverDetail"] | null
  title: NonNullable<PROJECT_QUERY_RESULT>["title"] | null
  year: NonNullable<PROJECT_QUERY_RESULT>["year"] | null
  client: NonNullable<PROJECT_QUERY_RESULT>["client"] | null
  sector: NonNullable<PROJECT_QUERY_RESULT>["sector"] | null
  credits: NonNullable<PROJECT_QUERY_RESULT>["credits"] | null
  description: NonNullable<PROJECT_QUERY_RESULT>["description"] | null
  blocks: NonNullable<PROJECT_QUERY_RESULT>["blocks"] | null
  nextProject: NonNullable<PROJECT_QUERY_RESULT>["nextProject"]
}

export default function ProjectDetail({
  coverDetail,
  title,
  year,
  client,
  sector,
  credits,
  description,
  blocks,
  nextProject,
}: ProjectProps) {
  const [coverReady, setCoverReady] = useState(false)

  return (
    <div
      className={cn(
        "relative",
        "transition-opacity duration-500 ease-out",
        !coverReady && "opacity-0 pointer-events-none",
      )}
    >
      <section>
        <Hero
          cover={coverDetail}
          title={title}
          year={year}
          onCoverLoad={() => setCoverReady(true)}
        />
      </section>

      <section
        className={cn(
          "relative px-[12px] md:px-[24px] pt-[48px] md:pt-[104px]",
          "max-w-[1280px] mx-auto",
        )}
      >
        <Contents
          client={client}
          sector={sector}
          credits={credits}
          description={description}
        />
      </section>

      {blocks && blocks.length > 0 && (
        <section
          className={cn(
            "relative px-[12px] md:px-[24px] pt-[80px] md:pt-[120px]",
          )}
        >
          <MediaBlocks blocks={blocks} />
        </section>
      )}

      {nextProject && (
        <section className={cn("pt-[80px] md:pt-[120px]")}>
          <NextProjectTeaser nextProject={nextProject} />
        </section>
      )}
    </div>
  )
}
