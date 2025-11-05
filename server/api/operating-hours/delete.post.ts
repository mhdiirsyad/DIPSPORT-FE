import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_DELETE_OPERATING_HOUR } from '~/graphql/mutations/delete_operating_hour'

type DeleteOperatingHourBody = {
  id: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<DeleteOperatingHourBody>(event)
  const endpoint = process.env.GQL_HTTP_ENDPOINT

  if (!endpoint) {
    throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })
  }

  const token = getCookie(event, 'admin_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const id = Number(body.id)
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid identifier' })
  }

  try {
    const response = await $fetch<{
      data?: { deleteOperatingHour?: any }
      errors?: Array<{ message?: string }>
    }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: {
        query: MUTATION_DELETE_OPERATING_HOUR,
        variables: { id },
      },
    })

    if (response?.errors?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: response.errors[0]?.message || 'Failed to delete operating hour',
      })
    }

    return response?.data?.deleteOperatingHour
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 502, statusMessage: 'Operating hour service unreachable' })
  }
})
