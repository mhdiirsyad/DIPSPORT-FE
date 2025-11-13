import {gql} from 'graphql-tag'
export const QUERY_GET_BOOKINGS = gql`
  query Bookings($stadionId : ID, $date: DateTime) {
    bookings(stadionId: $stadionId, date: $date) {
      bookingCode
      details {
        bookingDate
        fieldId
        startHour
      }
    }
  }
`