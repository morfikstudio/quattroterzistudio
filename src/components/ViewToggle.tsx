"use client"

import React, { useRef, useState } from "react"

import { cn } from "@/utils/classNames"

export type ViewToggleValue = "selected" | "archive"

type Props = {
  /** Active segment on the current page. */
  active: ViewToggleValue
  /** "light": black-on-white chip (/archive). "dark": white ink over photos (/projects). */
  variant?: "light" | "dark"
  /** Fired after the indicator slides to the clicked segment; parent handles routing. */
  onSelect: (target: ViewToggleValue) => void
}

const SLIDE_MS = 500
const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

// Squares use currentColor so they follow the segment's text color.
function SingleIcon() {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="flex w-[4px] h-[4px] bg-current" />
    </div>
  )
}

function DoubleIcon() {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="flex w-[4px] h-[4px] bg-current" />
      <span className="flex w-[4px] h-[4px] bg-current" />
    </div>
  )
}

export default function ViewToggle({
  active,
  variant = "light",
  onSelect,
}: Props) {
  // Indicator position. Starts on `active` so it's in place on the
  // destination page; on click it slides first, then navigation fires.
  const [displayed, setDisplayed] = useState<ViewToggleValue>(active)
  const lockRef = useRef(false)

  const handleClick = (target: ViewToggleValue) => {
    if (target === active || lockRef.current) return
    lockRef.current = true
    setDisplayed(target)
    window.setTimeout(() => onSelect(target), SLIDE_MS)
  }

  const isDark = variant === "dark"

  // Light: mix-blend-difference inverts text where the indicator passes.
  // Dark sits over photos (blend unreliable), so colour each segment directly.
  const segmentTextColor = (seg: ViewToggleValue) => {
    if (!isDark) return "text-white"
    return displayed === seg ? "text-black" : "text-white"
  }

  const segmentBase = cn(
    "group relative h-full w-1/2 appearance-none border-0 bg-transparent p-0 px-4",
    "flex items-center justify-center overflow-hidden",
    isDark && "transition-colors ease-out",
  )

  return (
    <div
      className={cn(
        "isolate relative flex h-[40px] w-[260px] overflow-hidden border",
        isDark ? "border-white bg-transparent" : "border-black bg-white",
      )}
    >
      {/* Sliding indicator */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-0 left-0 z-0 h-full w-1/2",
          isDark ? "bg-white" : "bg-black",
        )}
        style={{
          transform:
            displayed === "archive" ? "translateX(100%)" : "translateX(0)",
          transition: `transform ${SLIDE_MS}ms ${SLIDE_EASE}`,
        }}
      />

      {/* Content layer */}
      <div
        className={cn(
          "relative z-10 flex w-full",
          !isDark && "mix-blend-difference",
        )}
      >
        <button
          type="button"
          onClick={() => handleClick("selected")}
          aria-pressed={active === "selected"}
          style={isDark ? { transitionDuration: `${SLIDE_MS}ms` } : undefined}
          className={cn(
            segmentBase,
            segmentTextColor("selected"),
            active === "selected" ? "cursor-default" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 left-2 -translate-y-1/2",
              "group-hover:-translate-x-1 group-hover:opacity-0 transition-all duration-200 ease-in-out",
            )}
          >
            <SingleIcon />
          </span>
          <span
            className={cn(
              "absolute top-1/2 left-1/2 -translate-y-1/2",
              "-translate-x-[calc(50%-8px)] group-hover:-translate-x-[calc(50%+5.5px)] transition-transform duration-400 ease-out",
            )}
          >
            <span className="type-button-m uppercase">selected</span>
          </span>
          <span
            className={cn(
              "absolute top-1/2 right-2 -translate-y-1/2 translate-x-1 opacity-0",
              "group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-in-out",
            )}
          >
            <SingleIcon />
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleClick("archive")}
          aria-pressed={active === "archive"}
          style={isDark ? { transitionDuration: `${SLIDE_MS}ms` } : undefined}
          className={cn(
            segmentBase,
            segmentTextColor("archive"),
            active === "archive" ? "cursor-default" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "inline-flex items-center gap-[10px]",
            )}
          >
            <span
              className={cn(
                "translate-x-0 group-hover:-translate-x-1 group-hover:opacity-0",
                "transition-all duration-200 ease-in-out",
              )}
            >
              <DoubleIcon />
            </span>
            <span
              className={cn(
                "translate-x-0 group-hover:-translate-x-[19px]",
                "transition-transform duration-400 ease-out",
              )}
            >
              <span className="type-button-m uppercase">archive</span>
            </span>
          </span>
          <span
            className={cn(
              "absolute top-1/2 right-2 -translate-y-1/2 translate-x-1 opacity-0",
              "group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-in-out",
            )}
          >
            <DoubleIcon />
          </span>
        </button>
      </div>
    </div>
  )
}
