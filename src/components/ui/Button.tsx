"use client"

import Link from "next/link"
import { ReactNode, useCallback, useRef } from "react"
import gsap from "gsap"

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
  const scaleRef = useRef<HTMLSpanElement | null>(null)

  const bounce = useCallback(() => {
    const el = scaleRef.current
    if (!el) return
    // Kill any running tween so we start from the current scale
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { scale: (gsap.getProperty(el, "scale") as number) || 1 },
      {
        keyframes: [
          { scale: 0.8, duration: 0.09, ease: "power2.in" },
          { scale: 1, duration: 0.8, ease: "power3.out" },
        ],
        overwrite: true,
      },
    )
  }, [])

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
    onMouseEnter: bounce,
    onMouseLeave: bounce,
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
        ref={scaleRef}
        className="relative inline-flex items-center justify-center overflow-hidden"
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

  return href ? (
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
  )
}
