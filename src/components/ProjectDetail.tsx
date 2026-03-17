"use client"

import { PortableText } from "next-sanity"
import { components as portableTextComponents } from "@/sanity/portableTextComponents"
import type { PROJECT_QUERY_RESULT } from "@/sanity/types"

import { cn } from "@/utils/classNames"

import Image from "@/components/ui/Image"
import ScrollIndicator from "@/components/ui/ScrollIndicator"
import NextProjectTeaser from "@/components/NextProjectTeaser"

type ProjectProps = {
  coverDetail: NonNullable<PROJECT_QUERY_RESULT>["coverDetail"] | null
  title: NonNullable<PROJECT_QUERY_RESULT>["title"] | null
  year: NonNullable<PROJECT_QUERY_RESULT>["year"] | null
  client: NonNullable<PROJECT_QUERY_RESULT>["client"] | null
  sector: NonNullable<PROJECT_QUERY_RESULT>["sector"] | null
  credits: NonNullable<PROJECT_QUERY_RESULT>["credits"] | null
  description: NonNullable<PROJECT_QUERY_RESULT>["description"] | null
  payoff: NonNullable<PROJECT_QUERY_RESULT>["payoff"] | null
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
  payoff,
  nextProject,
}: ProjectProps) {
  return (
    <>
      {/* HERO */}
      <section>
        <div className="relative text-white">
          {/* COVER IMAGE */}
          <div className="relative">
            <Image
              image={coverDetail}
              resizeId="cover-detail"
              className="w-full"
              priority
            />

            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
              <ScrollIndicator />
            </div>
          </div>

          {/* TITLE */}
          <div className="absolute inset-0 pointer-events-none pb-16">
            <div
              className={cn(
                "sticky overflow-hidden pointer-events-auto",
                "top-[50vh] -translate-y-1/2 ml-[14px] md:ml-[calc(50%)]",
              )}
            >
              <h1 className="leading-[1.2] text-5xl md:text-7xl">
                {(title ?? "").split("").map((char, i) => (
                  <span key={i} className="inline-block">
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
            </div>

            <div
              className={cn(
                "absolute overflow-hidden pointer-events-auto",
                "top-[50vh] -translate-y-1/2 right-[14px] md:right-[24px]",
              )}
            >
              <span className="flex leading-[1.2] text-sm overflow-hidden">
                <span>{year}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENTS */}
      <section>
        <div
          className={cn(
            "relative text-black max-w-[1280px] mx-auto",
            "px-[12px] md:px-[24px] py-[48px] md:py-[104px]",
            "flex flex-col md:flex-row gap-[48px] md:gap-[24px]",
          )}
        >
          {/* DETAILS */}
          <div className="flex flex-wrap gap-[24px] md:flex-1/2">
            <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
              <span>Client</span>
              <div>{client}</div>
            </div>

            <div className="flex flex-col basis-[calc(50%-12px)] md:basis-full shrink-0 gap-[6px]">
              <span>Sector</span>
              <div>{sector}</div>
            </div>

            {credits && credits.length > 0 && (
              <div className="basis-[calc(50%-12px)] md:basis-full shrink-0">
                <span>Credits</span>
                <div>
                  {credits.map((credit) => (
                    <div key={credit}>{credit}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-[6px] md:flex-1/2">
            <span>Description</span>

            {description?.length ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-strong:text-inherit text-black">
                <PortableText
                  value={description}
                  components={portableTextComponents}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section>
        {payoff && (
          <div
            className={cn(
              "px-[12px] md:px-[24px] py-[48px]",
              "uppercase font-medium text-4xl md:text-8xl text-black",
            )}
          >
            {payoff}
          </div>
        )}
      </section>

      {/* NEXT PROJECT */}
      <section>
        <NextProjectTeaser nextProject={nextProject} />
      </section>
    </>
  )
}
