import Link from "next/link"
import { ReactNode } from "react"

import { cn } from "@/utils/classNames"

interface ButtonProps {
  icon: ReactNode
  label: string
  href?: string
  size?: "default" | "l" | "xl"
  variant?: "default" | "boxed"
  className?: string
  onClick?: () => void
}

export default function Button({
  icon,
  label,
  href,
  size = "default",
  variant = "default",
  className,
  onClick,
}: ButtonProps) {
  const sizeClass = {
    default: "type-button-m",
    l: "type-button-l",
    xl: "type-button-xl ",
  }[size]

  const paddingClass = {
    default: "",
    l: "px-4 py-2",
    xl: "md:px-7 md:py-5 px-6 py-4",
  }[size]

  const sharedClassName = cn(
    "group inline-flex items-center gap-4 cursor-pointer",
    className,
  )

  const content = (
    <>
      <span
        className={cn(
          "corner-border overflow-hidden inline-flex items-center justify-center",
        )}
      >
        <span
          className={cn(
            "inline-flex group-hover:animate-[icon-slide_0.65s_ease-in-out]",
            paddingClass,
          )}
        >
          {icon}
        </span>
      </span>
      <span
        className={cn(
          "transition-transform duration-300 ease-out group-hover:translate-x-1",
          sizeClass,
        )}
      >
        {label}
      </span>
    </>
  )

  return (
    <>
      <style>{`
        @keyframes icon-slide {
          0% {
            transform: translateX(0);
            animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
          }
          30% {
            transform: translateX(120%);
          }
          31% {
            transform: translateX(-120%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      {href ? (
        <Link href={href} className={sharedClassName}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={sharedClassName}>
          {content}
        </button>
      )}
    </>
  )
}
