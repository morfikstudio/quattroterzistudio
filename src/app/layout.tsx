import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Quattro Terzi Studio",
  description: "Quattro Terzi Studio — portfolio e progetti",
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
