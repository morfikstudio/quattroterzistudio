"use client"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

import { cn } from "@/utils/classNames"

export default function Footer() {
  return (
    <footer className={cn("footer bg-black text-white")}>
      <div className="container">
        <p>Footer</p>
      </div>
    </footer>
  )
}
