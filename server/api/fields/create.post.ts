import { defineEventHandler, readBody, getCookie } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_CREATE_FIELD } from '~/graphql/mutations/create_field'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  const token = getCookie(event, 'admin_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  try {
    const response = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: 'POST',
      body: {
        query: MUTATION_CREATE_FIELD,
        variables: {
          name: body.name,
          description: body.description,
          stadionId: Number(body.stadionId),
          pricePerHour: Number(body.pricePerHour),
          status: body.status,
          images: body.images,
        },
      },
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.errors) {
      const msg = response.errors[0].message
      throw createError({ statusCode: 400, statusMessage: msg })
    }
    return response.data.createField
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: err.message })
  }
})