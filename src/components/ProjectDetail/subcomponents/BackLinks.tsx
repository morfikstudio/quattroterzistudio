"use client"

import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import { dispatchCurtainNavigate } from "@/components/CurtainTransition"
import { useNavigationStore } from "@/stores/navigationStore"

export default function BackLinks() {
  const setPreviousPath = useNavigationStore((s) => s.setPreviousPath)

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="uppercase font-medium text-[12px] md:text-[16px]">
          Next project
        </span>
      </div>
      <div>
        <Button
          label="Return to works"
          icon={<Icon type="arrowLeft" size="s" />}
          variant="arrow-reverse"
          size="l"
          onClick={() => {
            setPreviousPath(window.location.pathname)
            dispatchCurtainNavigate("/projects")
          }}
        />
      </div>
    </div>
  )
}
