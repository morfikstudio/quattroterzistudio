import BreakpointProvider from "@/components/BreakpointProvider"
import TextCursor from "@/components/TextCursor"

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
      <TextCursor text="Click anywhere to enter" />
      <BreakpointProvider />
    </>
  )
}
