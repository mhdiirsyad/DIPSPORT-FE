import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_CREATE_OPERATING_HOUR } from '~/graphql/mutations/create_operating_hour'

type CreateOperatingHourBody = {
  stadionId: number
  day: string
  open: string
  close: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateOperatingHourBody>(event)
  const endpoint = process.env.GQL_HTTP_ENDPOINT

  if (!endpoint) {
    throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })
  }

  const token = getCookie(event, 'admin_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  if (!body || !body.day || !body.open || !body.close) {
    throw createError({ statusCode: 400, statusMessage: 'Incomplete payload' })
  }

  const stadionId = Number(body.stadionId)
  if (!Number.isFinite(stadionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stadion id' })
  }

  try {
    const response = await $fetch<{
      data?: { createOperatingHour?: any }
      errors?: Array<{ message?: string }>
    }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: {
        query: MUTATION_CREATE_OPERATING_HOUR,
        variables: {
          stadionId,
          day: body.day,
          open: body.open,
          close: body.close,
        },
      },
    })

    if (response?.errors?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: response.errors[0]?.message || 'Failed to create operating hour',
      })
    }

    return response?.data?.createOperatingHour
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 502, statusMessage: 'Operating hour service unreachable' })
  }
})
