import Link from "next/link"
import { ReactNode } from "react"

import { cn } from "@/utils/classNames"

interface ButtonProps {
  icon: ReactNode
  label: string
  href?: string
  className?: string
  onClick?: () => void
}

export default function Button({
  icon,
  label,
  href,
  className,
  onClick,
}: ButtonProps) {
  const sharedClassName = cn(
    "group inline-flex items-center gap-2 cursor-pointer",
    className,
  )

  const content = (
    <>
      <span className="overflow-hidden inline-flex items-center justify-center">
        <span className="inline-flex group-hover:animate-[icon-slide_0.5s_ease-in-out]">
          {icon}
        </span>
      </span>
      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
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
            opacity: 1;
          }
          30% {
            transform: translateX(120%);
            opacity: 0;
          }
          31% {
            transform: translateX(-120%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
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
