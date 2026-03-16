"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { cn } from "@/utils/classNames"
import Contact from "@/components/Contact"

const navLinkClass = cn("link-underline")
const navUnderlineClass = cn("link-underline-bar")

export default function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50">
        <div className="flex justify-between items-center mx-auto p-3 md:p-4">
          <div className="logo">
            <Image src="/logo.svg" alt="Logo" width={50} height={50} />
          </div>
          <div className="flex gap-2 text-[16px]">
            <Link href="/projects" className={navLinkClass}>
              Works,
              <span className={navUnderlineClass} />
            </Link>
            <Link href="/about" className={navLinkClass}>
              About,
              <span className={navUnderlineClass} />
            </Link>
            <button
              onClick={() => setIsContactOpen(true)}
              className={cn(navLinkClass, "cursor-pointer")}
            >
              Contact
              <span className={navUnderlineClass} />
            </button>
          </div>
        </div>
      </header>

      <Contact isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  )
}
