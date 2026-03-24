import { type SchemaTypeDefinition } from "sanity"

import {
  projectMediaDouble,
  projectMediaPayoff,
  projectMediaSingle,
} from "./projectMediaTypes"
import { projectType } from "./projectType"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    projectType,
    projectMediaSingle,
    projectMediaDouble,
    projectMediaPayoff,
  ],
}
