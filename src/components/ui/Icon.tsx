import { cn } from "@/utils/classNames"

type SvgProps = {
  sizePx: number | string
}

type IconSizeType = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "full"

export type IconType = {
  type: keyof typeof Icons
  size?: IconSizeType
  className?: string
}

export const Icons = {
  arrow: ({ sizePx }: SvgProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizePx}
      height={sizePx}
      viewBox="0 0 25 18"
      fill="none"
    >
      <path
        d="M20.8392 8.14659L14.547 1.85445L15.9612 0.440232L23.9604 8.43938C24.1479 8.62691 24.2532 8.88127 24.2532 9.14648C24.2532 9.41169 24.1479 9.66606 23.9604 9.85359L15.9599 17.8527L14.5457 16.4385L20.8378 10.1464H0.62587V8.14659H20.8392Z"
        fill="currentColor"
      />
    </svg>
  ),
  close: ({ sizePx }: SvgProps) => (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.46875 0.707947L0.715576 9.46112"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9.46094 9.46027L0.707764 0.707094"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
}

/**
 * @param {IconType} size: full = '100%', xl = 32, l = 24, m = 20, s = 16, xs = 12, xxs = 10
 */
export default function Icon({ type, size = "m", className }: IconType) {
  const sizeToPixels: Record<IconSizeType, number | string> = {
    xxs: 8,
    xs: 12,
    s: 16,
    m: 20,
    l: 24,
    xl: 32,
    full: "100%",
  }

  const sizePx = sizeToPixels[size]

  if (!Icons[type]) return null

  return (
    <span className={cn("inline-flex", className)} data-icon-type={type}>
      {Icons[type]({ sizePx })}
    </span>
  )
}
