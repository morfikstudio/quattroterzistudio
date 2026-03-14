import BreakpointProvider from "@/components/BreakpointProvider"
import LenisProvider from "@/components/LenisProvider"
import TextCursor from "@/components/TextCursor"

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LenisProvider>
      {children}
      <TextCursor text="Click anywhere to enter" />
      <BreakpointProvider />
    </LenisProvider>
  )
}
