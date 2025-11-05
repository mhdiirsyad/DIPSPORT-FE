import { defineEventHandler, readBody, getCookie } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_UPDATE_FIELD } from '~/graphql/mutations/update_field'

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
        query: MUTATION_UPDATE_FIELD,
        variables: {
          fieldId: Number(body.fieldId),
          stadionId: Number(body.stadionId),
          name: body.name,
          description: body.description,
          pricePerHour: Number(body.pricePerHour)
        },
      },
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.errors) {
      const msg = response.errors[0].message
      throw createError({ statusCode: 400, statusMessage: msg })
    }
    return response.data.updateField
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: err.message })
  }
})