export interface HoverListItem {
  title: string
  description: string
}

export interface HoverListProps {
  items?: HoverListItem[]
  label?: string
  className?: string
}

export const defaultItems: HoverListItem[] = [
  {
    title: "3D Visualization",
    description:
      "Lorem ipsum gfyegfacilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
  },
  {
    title: "Art Direction",
    description:
      "Lorem ipsum gfyegfacilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
  },
  {
    title: "CGI Lorem",
    description:
      "Lorem ipsum gfyegfacilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
  },
  {
    title: "3D Visualization",
    description:
      "Lorem ipsum gfyegfacilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
  },
]
