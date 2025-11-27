import gql from "graphql-tag";

export const UPDATE_BOOK_STATUS = gql`
    mutation UpdateBookingStatus($bookingCode: String!, $status: BookingStatus!){
        updateStatusBooking(bookingCode: $bookingCode, status: $status){
            bookingCode,
            status
        }
    }
`