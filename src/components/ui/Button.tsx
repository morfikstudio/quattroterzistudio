import { ButtonHTMLAttributes, PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-neutral-800 text-neutral-100 border-neutral-600 hover:bg-neutral-700 hover:border-neutral-500",
  ghost:
    "bg-transparent text-neutral-800 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400",
} as const

const base =
  "cursor-pointer px-4 py-2 rounded-md text-sm font-medium border transition-colors"

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants
  }
>

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
