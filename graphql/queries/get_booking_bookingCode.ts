import gql from "graphql-tag";

export const QUERY_GET_BOOKING = gql`
  query Booking($bookingCode: String!) {
    booking(bookingCode: $bookingCode) {
      bookingCode,
      name,
      contact,
      email,
      institution,
      suratUrl,
      isAcademic,
      totalPrice,
      status,
      paymentStatus,
      createdAt,
      details {
        bookingDate,
        startHour,
        subtotal,
        Field {
          name
        }
      }
    }
  }
`