import type { Metadata } from "next"

import type { SiteSeoConfig } from "@/lib/seo/types"
import { buildHomeMetadata } from "@/lib/seo/page-metadata"

import siteSeo from "@/data/site-seo.json"

import SplashMarquee from "@/components/SplashMarquee"

const siteCfg = siteSeo as SiteSeoConfig

export const metadata: Metadata = {
  ...buildHomeMetadata(siteCfg),
  title: { absolute: siteCfg.home.title },
}

export default function Page() {
  return (
    <main>
      <SplashMarquee
        title="Welcome to Quattroterzi Studio"
        ctaText="Click anywhere to enter"
      />
    </main>
  )
}
