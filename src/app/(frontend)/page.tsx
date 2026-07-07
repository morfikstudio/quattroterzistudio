import type { Metadata } from "next"

import type { SiteSeoConfig } from "@/lib/seo/types"
import { buildHomeJsonLd } from "@/lib/seo/json-ld-home"
import { buildHomeMetadata } from "@/lib/seo/page-metadata"

import siteSeo from "@/data/site-seo.json"

import { JsonLd } from "@/components/seo/JsonLd"

const siteCfg = siteSeo as SiteSeoConfig

export const metadata: Metadata = {
  ...buildHomeMetadata(siteCfg),
  title: { absolute: siteCfg.home.title },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd(siteCfg)} />
      {/* SplashMarquee is rendered once in the frontend layout (persistent
          across routes); the "/" route only needs its JSON-LD here. */}
      <main />
    </>
  )
}
