// Jembatan untuk query 'stadions' (semua)
import { print } from 'graphql'
import { defineEventHandler, createError } from 'h3'
import { $fetch } from 'ofetch'
import { QUERY_GET_STADIONS } from '~/graphql/queries/get_stadions'

export default defineEventHandler(async (event) => {
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })
  // console.log('GRAPHQL REQUEST:', print(QUERY_GET_STADIONS))

  try {
    const response = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: { 
        query: print(QUERY_GET_STADIONS)
      },
    })
    
    if (response.errors) throw new Error(response.errors[0].message)
    return response.data.stadions
  } catch (err: any) {
    console.log('GRAPHQL REQUEST(catch):', print(QUERY_GET_STADIONS))

    throw createError({ statusCode: 502, statusMessage: err.message })
  }
})
