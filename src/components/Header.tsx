"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { cn } from "@/utils/classNames"
import Contact from "@/components/Contact"

const navLinkClass = cn("h-nav-link", "relative inline-block")
const navUnderlineClass = cn(
  "h-nav-link-underline",
  "absolute left-0 -bottom-0.5 w-full h-px bg-current",
)

export default function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <style>{`
        .h-nav-link-underline {
          clip-path: inset(0 100% 0 0);
          transition: clip-path 0.45s cubic-bezier(0.6, 0, 0.2, 1);
        }
        .h-nav-link:hover .h-nav-link-underline {
          clip-path: inset(0 0% 0 0);
        }
      `}</style>

      <header className="fixed top-0 left-0 w-full z-50">
        <div className="flex justify-between items-center mx-auto p-3 md:p-4">
          <div className="logo">
            <Image src="/logo.svg" alt="Logo" width={50} height={50} />
          </div>
          <div className="flex gap-2 text-[16px]">
            <Link href="/about" className={navLinkClass}>
              About,
              <span className={navUnderlineClass} />
            </Link>
            <Link href="/projects" className={navLinkClass}>
              Works,
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
