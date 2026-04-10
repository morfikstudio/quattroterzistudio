import Header from "@/components/Header"
import BreakpointProvider from "@/components/BreakpointProvider"
import LenisProvider from "@/components/LenisProvider"
import TextCursor from "@/components/TextCursor"
import TransitionLayout from "@/components/TransitionLayout"

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LenisProvider>
      <Header />
      <TransitionLayout>{children}</TransitionLayout>
      <TextCursor text="Click anywhere to enter" />
      <BreakpointProvider />
    </LenisProvider>
  )
}
