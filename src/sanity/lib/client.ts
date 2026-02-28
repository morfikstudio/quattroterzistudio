import { createClient, type QueryParams } from "next-sanity"

import { apiVersion, dataset, projectId } from "../env"

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: "/studio",
  },
})

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: QueryString
  params?: QueryParams
  revalidate?: number | false
}) {
  return client.fetch(query, params, {
    next: { revalidate },
  })
}
