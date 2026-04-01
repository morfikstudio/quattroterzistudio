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
    xl: "md:p-9 p-7",
  }[size]

  const sharedClassName = cn(
    "group inline-flex items-center gap-4 cursor-pointer",
    className,
  )

  const content = (
    <>
      <span
        className={cn(
          "corner-border relative inline-flex items-center justify-center overflow-hidden",
          "group-hover:animate-[icon-scale_1s_ease-out]",
          paddingClass,
        )}
      >
        <span className="invisible inline-flex">{icon}</span>
        {/* Arrow 1 */}
        <span
          className={cn(
            "absolute inset-0 inline-flex items-center justify-center",
            "transition-transform duration-[900ms] ease-in-out group-hover:translate-x-full",
          )}
        >
          {icon}
        </span>
        {/* Arrow 2 */}
        <span
          className={cn(
            "absolute inset-0 inline-flex items-center justify-center",
            "transition-transform duration-[900ms] ease-in-out -translate-x-full group-hover:translate-x-0",
          )}
        >
          {icon}
        </span>
      </span>
      <span
        className={cn(
          "transition-transform duration-[900ms] ease-out group-hover:translate-x-1",
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
        @keyframes icon-scale {
          0%   { transform: scale(1); }
          15%  { transform: scale(0.8); }
          100% { transform: scale(1); }
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
