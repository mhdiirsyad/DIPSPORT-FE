export const QUERY_GET_BOOKINGS = `
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