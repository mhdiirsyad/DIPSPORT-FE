import { defineEventHandler, readBody, createError, getCookie } from 'h3'
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
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  const contentType = (event.node.req.headers['content-type'] || '') as string

  if (contentType.includes('multipart/form-data')) {
    const token = getCookie(event, 'admin_token')
    const headers: Record<string, string> = {
      // satisfy Apollo CSRF protection
      'apollo-require-preflight': 'true',
      'content-type': contentType,
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await (fetch as any)(endpoint, { method: 'POST', headers, body: event.node.req, duplex: 'half' })
      const json = await res.json()
      if (json.errors?.length) {
        throw createError({ statusCode: 400, statusMessage: json.errors[0]?.message || 'Failed to create booking' })
      }
      return json.data?.createBooking
    } catch (err: any) {
      if (err?.statusCode) throw err
      throw createError({ statusCode: 502, statusMessage: err?.message || 'Booking service unreachable' })
    }
  }

  const body = await readBody<BookingPayload>(event)
  if (!body?.name || !body?.contact || !body?.email || !Array.isArray(body.details) || body.details.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Incomplete booking payload' })
  }

  try {
    const token = getCookie(event, 'admin_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

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
          status: "APPROVED",
          paymentStatus: "PAID",
        },
      },
      headers,
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
