export const MUTATION_CREATE_BOOKING = `
  mutation CreateBooking(
    $name: String!, 
    $contact: String!, 
    $email: String!, 
    $institution: String, 
    $suratFile: Upload, 
    $isAcademic: Boolean,
    $details: [BookingDetailInput!]!
    $status: BookingStatus
    $paymentStatus: PaymentStatus
  ) {
    createBooking(
      name: $name, 
      contact: $contact, 
      email: $email, 
      institution: $institution,
      suratFile: $suratFile, 
      isAcademic: $isAcademic,
      details: $details,
      status: $status,
      paymentStatus: $paymentStatus
    ) {
      bookingCode
    }
  }
`