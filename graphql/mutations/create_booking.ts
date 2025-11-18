export const MUTATION_CREATE_BOOKING = `
  mutation CreateBooking(
    $name: String!
    $contact: String!
    $email: String!
    $details: [BookingDetailInput!]!
    $institution: String
    $suratUrl: String
    $isAcademic: Boolean
  ) {
    createBooking(
      name: $name
      contact: $contact
      email: $email
      institution: $institution
      suratUrl: $suratUrl
      isAcademic: $isAcademic
      details: $details
    ) {
      bookingCode
      status
      totalPrice
      details {
        fieldId
        bookingDate
        startHour
        pricePerHour
      }
    }
  }
`
