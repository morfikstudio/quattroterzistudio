import { create } from "zustand"

type CursorStore = {
  cursorEnabled: boolean
  setCursor: (value: boolean) => void
}

export const useCursorStore = create<CursorStore>((set) => ({
  cursorEnabled: false,
  setCursor: (value) => set({ cursorEnabled: value }),
}))
