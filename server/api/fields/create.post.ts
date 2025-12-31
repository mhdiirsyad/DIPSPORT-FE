import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_CREATE_FIELD } from '~/graphql/mutations/create_field'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  const token = getCookie(event, 'admin_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  // DEBUG: Log body yang diterima dari frontend
  console.log('🔍 CREATE FIELD - Body received:', JSON.stringify(body, null, 2))

  try {
    const variables = {
      name: body.name,
      description: body.description,
      stadionId: Number(body.stadionId),
      // HARGA DISEMBUNYIKAN: Terima dari body (default 0 dari FE)
      // Tidak hardcode agar nanti bisa reactive kalau fitur diaktifkan
      pricePerHour: Number(body.pricePerHour || 0),
      status: body.status,
      images: body.images,
    }

    // DEBUG: Log variables yang akan dikirim ke GraphQL
    console.log('📤 CREATE FIELD - Variables sent to GraphQL:', JSON.stringify(variables, null, 2))

    const response = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: 'POST',
      body: {
        query: MUTATION_CREATE_FIELD,
        variables,
      },
      headers: { 'Authorization': `Bearer ${token}` },
      // Tambahkan ini agar bisa baca error response
      ignoreResponseError: true
    })

    // DEBUG: Log response dari GraphQL
    console.log('📥 CREATE FIELD - GraphQL response:', JSON.stringify(response, null, 2))

    if (response.errors) {
      const msg = response.errors[0].message
      // DEBUG: Log error detail
      console.error('❌ CREATE FIELD - GraphQL errors:', JSON.stringify(response.errors, null, 2))
      throw createError({ statusCode: 400, statusMessage: msg })
    }
    return response.data.createField
  } catch (err: any) {
    // DEBUG: Log error yang tertangkap dengan detail lengkap
    console.error('❌ CREATE FIELD - Catch error:', err)
    console.error('❌ CREATE FIELD - Error data:', err.data)
    console.error('❌ CREATE FIELD - Error response:', err.response)
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: err.message })
  }
})
