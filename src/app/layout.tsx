import type { Metadata } from "next"
import localFont from "next/font/local"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import { cn } from "@/utils/classNames"

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

export const metadata: Metadata = {
  title: "Quattro Terzi Studio",
  description: "Quattro Terzi Studio — portfolio e progetti",
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
        <Header />
        {children}
      </body>
    </html>
  )
}
