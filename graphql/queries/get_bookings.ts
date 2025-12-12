import { gql } from 'graphql-tag'

export const QUERY_GET_BOOKINGS = gql`
  query Bookings($stadionId: ID, $date: DateTime, $startDate: DateTime, $endDate: DateTime) {
    bookings(stadionId: $stadionId, date: $date, startDate: $startDate, endDate: $endDate) {
      id
      bookingCode
      status
      paymentStatus
      details {
        fieldId
        bookingDate
        startHour
        subtotal
      }
    }
  }
`