export type SiteSeoOgImage = {
  url: string
  width: number
  height: number
  alt: string
}

export type SiteSeoSite = {
  name: string
  defaultDescription: string
  locale: string
  twitterSite: string
  twitterCreator: string
}

export type SiteSeoPage = {
  title: string
  description: string
  keywords: string[]
  canonicalPath: string
  openGraph: {
    type: "website"
    image: SiteSeoOgImage
  }
}

export type SiteSeoConfig = {
  site: SiteSeoSite
  home: SiteSeoPage
  about: SiteSeoPage
  projects: SiteSeoPage
  archive: SiteSeoPage
}
