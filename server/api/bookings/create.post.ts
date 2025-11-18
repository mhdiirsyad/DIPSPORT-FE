import { print } from "graphql"
import { MUTATION_CREATE_BOOKING } from "~/graphql/mutations/create_booking"

interface BookingInput {
  name: string
  contact: string
  email: string
  institution: string
  suratUrl: string  
  isAcademic: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BookingInput>(event)
  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint) throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  try{
    const response = await $fetch<{ data?: any; errors?: any[] }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        query: print(MUTATION_CREATE_BOOKING),
        variables: {
          name: body.name,
          contact: body.contact,
          email: body.email,
          isAcademic: body.isAcademic,
          suratUrl: body.suratUrl,
          institution: body.institution
        },
      },
    })

    if (response.errors) {
      const msg = response.errors[0].message
      throw createError({ statusCode: 400, statusMessage: msg })
    }
    return response.data
  } catch (err: unknown) {
    const error = err as Error
    if (error) throw err
    throw createError({statusCode: 500, message: 'Failed to create Booking'})
  }
})