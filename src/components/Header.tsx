import Link from "next/link"
import Image from "next/image"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="flex justify-between items-center mx-auto p-3 md:p-4">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        </div>
        <div className="flex gap-2 text-[16px]">
          <Link href="/about">About,</Link>
          <Link href="/projects">Works,</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </header>
  )
}
