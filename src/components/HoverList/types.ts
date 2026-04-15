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
    title: "Identity",
    description:
      "How something is recogniSed at first sight. The visual language that defines it before anything is said or written.",
  },
  {
    title: "Environments",
    description:
      "Spaces where a vision takes shape. The rooms, the light, the atmosphere that make an idea feel real and specific.",
  },
  {
    title: "Details",
    description:
      "The choices that hold everything else together. A finish, a texture, a proportion: the things you notice second but remember first.",
  },
  {
    title: "Imagery",
    description:
      "Where it all becomes visible. The final form that carries everything forward and makes it last.",
  },
]
