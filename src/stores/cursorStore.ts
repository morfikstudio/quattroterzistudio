import { create } from "zustand"

type CursorStore = {
  cursorEnabled: boolean
  setCursor: (value: boolean) => void
}

let enableCount = 0

export const useCursorStore = create<CursorStore>((set) => ({
  cursorEnabled: false,
  setCursor: (value) => {
    enableCount += value ? 1 : -1
    enableCount = Math.max(0, enableCount)
    set({ cursorEnabled: enableCount > 0 })
  },
}))
