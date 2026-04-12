import Header from "@/components/Header"
import BreakpointProvider from "@/components/BreakpointProvider"
import LenisProvider from "@/components/LenisProvider"
import TextCursor from "@/components/TextCursor"
import CurtainTransition from "@/components/CurtainTransition"
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
      <CurtainTransition />
      <TextCursor text="Click anywhere to enter" />
      <BreakpointProvider />
    </LenisProvider>
  )
}
