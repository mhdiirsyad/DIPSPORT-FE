import { defineEventHandler, createError, getQuery } from "h3"
import { $fetch } from "ofetch"
import { QUERY_GET_FIELDS } from "~/graphql/queries/get_fields"

export default defineEventHandler(async (event) => {
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: "Missing GQL_HTTP_ENDPOINT" })

  const { stadionId } = getQuery(event)

  try {
    const resp = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        query: QUERY_GET_FIELDS,
        variables: stadionId ? { stadionId: String(stadionId) } : undefined,
      },
      credentials: "include",
    })
    if (resp?.errors?.length) throw new Error(resp.errors[0]?.message || "GraphQL error")
    return resp?.data?.fields ?? []
  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: err?.message || "Upstream error" })
  }
})
