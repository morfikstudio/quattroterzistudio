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
          <Link href="/">
            <div className="logo group flex items-center mix-blend-difference">
              <div className="rect w-[44px] h-[33px] bg-transparent relative border-3 border-black">
                <div className="rect-inner absolute top-0 left-0 w-full h-full bg-black [clip-path:polygon(0_0,_100%_0%,_100%_100%,_0%_100%)] transition-[clip-path] duration-700 ease-out group-hover:[clip-path:polygon(100%_0,_100%_0%,_100%_100%,_100%_100%)]"></div>
              </div>
              <div className="text-container flex flex-col w-[120px] overflow-hidden pl-2">
                <span className="text-1 uppercase text-[14px] font-medium h-[16px] -translate-x-[120px] transition-transform duration-700 ease-out group-hover:translate-x-0">
                  quattroterzi
                </span>
                <span className="text-2 uppercase text-[14px] font-medium h-[16px] -translate-x-[120px] transition-transform duration-700 ease-out group-hover:translate-x-0">
                  studio
                </span>
              </div>
            </div>
          </Link>
          <div className="flex gap-2 text-[16px]">
            <Link
              href="/projects"
              className={navLinkClass}
              onMouseEnter={(e) => {
                e.currentTarget.dataset.line = "in"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.dataset.line = "out"
              }}
            >
              Works,
              <span className={navUnderlineClass} />
            </Link>
            <Link
              href="/about"
              className={navLinkClass}
              onMouseEnter={(e) => {
                e.currentTarget.dataset.line = "in"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.dataset.line = "out"
              }}
            >
              About,
              <span className={navUnderlineClass} />
            </Link>
            <button
              onClick={() => setIsContactOpen(true)}
              className={cn(navLinkClass, "cursor-pointer")}
              onMouseEnter={(e) => {
                e.currentTarget.dataset.line = "in"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.dataset.line = "out"
              }}
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
