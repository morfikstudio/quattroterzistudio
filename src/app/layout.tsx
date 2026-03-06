import type { Metadata } from "next"
import "./globals.css"

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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
