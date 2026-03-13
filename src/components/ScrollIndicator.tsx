"use client"

import { cn } from "@/utils/classNames"

export default function ScrollIndicator({ show }: { show: boolean }) {
  return (
    <>
      <style>{`
        @keyframes scrollDown {
          0%   { transform: translateY(-32px); }
          100% { transform: translateY(38px); }
        }
        .scroll-indicator-bar {
          animation: scrollDown 2s cubic-bezier(0.83, 0, 0.17, 1) infinite;
        }
      `}</style>
      <div
        className={cn(
          "relative w-[3px] h-[38px] overflow-hidden bg-white/20",
          "transition-opacity duration-500 ease-out",
          show ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="scroll-indicator-bar absolute top-0 left-0 w-full h-[32px] bg-white" />
      </div>
    </>
  )
}
