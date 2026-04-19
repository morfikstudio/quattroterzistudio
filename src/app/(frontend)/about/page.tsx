import type { SiteSeoConfig } from "@/lib/seo/types"
import { buildAboutMetadata } from "@/lib/seo/page-metadata"

import siteSeo from "@/data/site-seo.json"

import About from "@/components/About"
import Footer from "@/components/Footer"

export const metadata = buildAboutMetadata(siteSeo as SiteSeoConfig)

export default function Page() {
  return (
    <main>
      <About />
      <Footer />
    </main>
  )
}
