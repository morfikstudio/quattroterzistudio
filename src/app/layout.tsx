import {
  IubendaProvider,
  IubendaCookieSolutionBannerConfigInterface,
  i18nDictionaries,
} from "@mep-agency/next-iubenda"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Geist_Mono } from "next/font/google"

import type { SiteSeoConfig } from "@/lib/seo/types"
import { getSiteOrigin } from "@/lib/seo/site-url"
import { cn } from "@/utils/classNames"

import siteSeo from "@/data/site-seo.json"

import "./globals.css"

const helvetica = localFont({
  src: [
    {
      path: "../../public/font/HelveticaNeue-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/font/HelveticaNeue-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/HelveticaNeue-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/HelveticaNeue-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/HelveticaNeue-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true"
const shouldIndex = process.env.NODE_ENV === "production" && allowIndexing

const siteCfg = siteSeo as SiteSeoConfig

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: siteCfg.home.title,
    template: `%s | ${siteCfg.site.name}`,
  },
  description: siteCfg.home.description,
  robots: {
    index: shouldIndex,
    follow: shouldIndex,
    nocache: !shouldIndex,
    googleBot: {
      index: shouldIndex,
      follow: shouldIndex,
      nocache: !shouldIndex,
    },
  },
}

const iubendaBannerConfig: IubendaCookieSolutionBannerConfigInterface = {
  siteId: 4502656, // Your site ID
  cookiePolicyId: 23047240, // Your cookie policy ID
  lang: "it",

  // See https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(helvetica.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="relative bg-white font-sans font-normal">
        {children}
      </body>
    </html>
  )
}
