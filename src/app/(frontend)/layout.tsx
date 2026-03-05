import TextCursor from "@/components/TextCursor"

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
      <TextCursor />
    </>
  )
}
