import { print } from "graphql";
import { UPDATE_BOOK_STATUS } from "~/graphql/mutations/update_book_status";

export default defineEventHandler(async(event) => {
    const {bookingCode} = getRouterParams(event);
    const body = await readBody<{bookingStatus?: string}>(event)
    const token = getCookie(event, 'admin_token');
    const endpoint = process.env.GQL_HTTP_ENDPOINT
    if (!endpoint) {
        throw createError({ statusCode: 500, message: 'missing GQL endpoint' })
    }

    const bookingStatus = body?.bookingStatus
    if (!bookingStatus) {
        throw createError({ statusCode: 400, message: 'bookingStatus is required' })
    }

    const response = await $fetch<{
        data?: { updateBookingStatus?: any }
        errors?: Array<{ message?: string }>
    }>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: {
            query: UPDATE_BOOK_STATUS,
            variables: { bookingCode, status: bookingStatus },
        },
    })

    if (response.errors?.length) {
        throw createError({ statusCode: 400, message: response.errors[0]?.message || 'failed to update payment status' })
    }

    return response.data?.updateBookingStatus;
})