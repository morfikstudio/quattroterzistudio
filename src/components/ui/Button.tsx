"use client"

import Link from "next/link"
import { ReactNode, useState } from "react"

import { cn } from "@/utils/classNames"

interface ButtonProps {
  icon: ReactNode
  label: string
  href?: string
  size?: "default" | "l" | "xl"
  variant?: "default" | "close" | "arrow-reverse"
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
  const [scaleAnim, setScaleAnim] = useState<"a" | "b" | null>(null)

  const handleMouseEnter = () =>
    setScaleAnim((prev) => (prev === "a" ? "b" : "a"))
  const handleMouseLeave = () =>
    setScaleAnim((prev) => (prev === "a" ? "b" : "a"))

  const sizeClass = {
    default: "type-button-m",
    l: "type-button-l",
    xl: "type-button-xl translate-y-[6px]",
  }[size]

  const paddingClass = {
    default: "",
    l: "md:px-[12px] md:py-[8px] px-[10px] py-[6px]",
    xl: "md:px-[32px] md:py-[18px] px-[16px] py-[10px]",
  }[size]

  const cornerStyle = {
    default: {},
    l: { "--corner-size": "10px" },
    xl: { "--corner-size": "14px", "--corner-line": "3px" },
  }[size] as React.CSSProperties

  const sharedClassName = cn(
    "group inline-flex items-center gap-4 cursor-pointer",
    className,
  )

  const hoverHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }

  const arrowOneClass = {
    default:
      "transition-transform duration-[700ms] ease-in-out group-hover:translate-x-full",
    close: "",
    "arrow-reverse":
      "transition-transform duration-[700ms] ease-in-out group-hover:-translate-x-full",
  }[variant]

  const arrowTwoClass = {
    default: "-translate-x-full group-hover:translate-x-0",
    close: "hidden",
    "arrow-reverse": "translate-x-full group-hover:translate-x-0",
  }[variant]

  const content = (
    <>
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          scaleAnim === "a" && "animate-[icon-scale-a_900ms_ease-in-out]",
          scaleAnim === "b" && "animate-[icon-scale-b_900ms_ease-in-out]",
        )}
      >
        <span
          style={cornerStyle}
          className={cn(
            "corner-border inline-flex items-center justify-center",
            paddingClass,
          )}
        >
          <span
            className="inline-flex opacity-0 pointer-events-none"
            aria-hidden
          >
            {icon}
          </span>
        </span>
        {/* Arrow 1 */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 inline-flex items-center justify-center",
            arrowOneClass,
          )}
        >
          {icon}
        </span>
        {/* Arrow 2 */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 inline-flex items-center justify-center",
            "transition-transform duration-[700ms] ease-in-out",
            arrowTwoClass,
          )}
        >
          {icon}
        </span>
      </span>
      <span
        className={cn(
          "transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1.5",
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
        @keyframes icon-scale-a {
          0%   { transform: scale(1); }
          10%  { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
        @keyframes icon-scale-b {
          0%   { transform: scale(1); }
          10%  { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
      `}</style>
      {href ? (
        <Link href={href} className={sharedClassName} {...hoverHandlers}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={sharedClassName}
          {...hoverHandlers}
        >
          {content}
        </button>
      )}
    </>
  )
}
