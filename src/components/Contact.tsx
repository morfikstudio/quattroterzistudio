"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

import { cn } from "@/utils/classNames"
import Button from "@/components/ui/Button"
import Icon, { Icons } from "./ui/Icon"

interface ContactProps {
  isOpen: boolean
  onClose: () => void
}

export default function Contact({ isOpen, onClose }: ContactProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<GSAPTween | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    tweenRef.current?.kill()

    if (isOpen) {
      gsap.set(el, { pointerEvents: "auto" })
      tweenRef.current = gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        ease: "power3.inOut",
      })
    } else {
      tweenRef.current = gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(el, { pointerEvents: "none" })
        },
      })
    }

    return () => {
      tweenRef.current?.kill()
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      style={{ clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "none" }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
    >
      {/* Header interno */}
      <div className="flex justify-between items-center p-3 md:p-7">
        <div className={cn("copyright")}>
          <span className="text-[16px]">Copyright © quattroterzi 2026</span>
        </div>
        <Button
          icon={<Icon type="close" size="xxs" />}
          label="Close"
          onClick={onClose}
        />
      </div>

      {/* Contenuto */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400">contact content</p>
      </div>
    </div>
  )
}
