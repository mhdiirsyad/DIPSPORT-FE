export const UPDATE_BOOK_STATUS = `
    mutation UpdateBookingStatus($bookingCode: String!, $status: BookingStatus!){
        updateStatusBooking(bookingCode: $bookingCode, status: $status){
            bookingCode,
            status
        }
    }
`