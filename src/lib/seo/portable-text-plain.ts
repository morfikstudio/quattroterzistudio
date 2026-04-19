import type { PROJECT_METADATA_QUERY_RESULT } from "@/sanity/types"

type DescriptionBlocks = NonNullable<
  NonNullable<PROJECT_METADATA_QUERY_RESULT>["description"]
>

export function portableBlocksToPlainText(
  blocks: DescriptionBlocks | null | undefined,
  maxLength = 160,
): string | undefined {
  if (!blocks?.length) {
    return undefined
  }

  const parts: string[] = []
  for (const block of blocks) {
    if (block._type !== "block") {
      continue
    }
    for (const child of block.children ?? []) {
      if (child.text) {
        parts.push(child.text)
      }
    }
  }

  let text = parts.join(" ").replace(/\s+/g, " ").trim()
  if (!text) {
    return undefined
  }

  if (text.length > maxLength) {
    text = `${text.slice(0, maxLength - 1).trimEnd()}…`
  }

  return text
}
