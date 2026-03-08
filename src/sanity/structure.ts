import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list"
import type { StructureResolver } from "sanity/structure"

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) => {
  return S.list()
    .title("Content")
    .items([
      orderableDocumentListDeskItem({
        type: "project",
        title: "Projects",
        S,
        context,
      }),
    ])
}
