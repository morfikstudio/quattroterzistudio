import { create } from "zustand"

/**
 * Tracks the path the user was coming FROM before landing on a new route.
 * Must be set imperatively (in click handlers) BEFORE calling router.push,
 * so that components can read it synchronously during their first render.
 *
 * Rules for SplashMarquee visibility:
 *   null  → initial page load / direct navigation → skip splash
 *   "/"   → logo click                            → show splash
 *   other → internal navigation                   → skip splash
 */
type NavigationStore = {
  previousPath: string | null
  setPreviousPath: (path: string | null) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  previousPath: null,
  setPreviousPath: (path) => set({ previousPath: path }),
}))
