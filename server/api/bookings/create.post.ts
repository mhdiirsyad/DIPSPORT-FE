import { defineEventHandler, readBody, createError } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_CREATE_BOOKING } from '~/graphql/mutations/create_booking'

interface BookingDetailPayload {
  fieldId: number
  bookingDate: string
  startHour: number
  pricePerHour?: number
}

interface BookingPayload {
  name: string
  contact: string
  email: string
  institution?: string
  suratUrl?: string
  isAcademic?: boolean
  details: BookingDetailPayload[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BookingPayload>(event)
  if (!body?.name || !body?.contact || !body?.email || !Array.isArray(body.details) || body.details.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Incomplete booking payload' })
  }

  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  try {
    const response = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: 'POST',
      body: {
        query: MUTATION_CREATE_BOOKING,
        variables: {
          name: body.name,
          contact: body.contact,
          email: body.email,
          institution: body.institution,
          suratUrl: body.suratUrl,
          isAcademic: body.isAcademic,
          details: body.details,
        },
      },
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.errors?.length) {
      throw createError({ statusCode: 400, statusMessage: response.errors[0]?.message || 'Failed to create booking' })
    }

    return response.data?.createBooking
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 502, statusMessage: error?.message || 'Booking service unreachable' })
  }
})
