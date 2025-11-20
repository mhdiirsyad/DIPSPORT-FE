import gql from "graphql-tag";

export const MUTATION_CREATE_BOOKING = gql`
  mutation CreateBooking(
    $name: String!, 
    $contact: String!, 
    $email: String!, 
    $institution: String, 
    $suratFile: Upload, 
    $isAcademic: Boolean,
    $details: [BookingDetailInput!]!
  ) {
    createBooking(
      name: $name, 
      contact: $contact, 
      email: $email, 
      institution: $institution,
      suratFile: $suratFile, 
      isAcademic: $isAcademic,
      details: $details,
    ) {
      bookingCode
    }
  }
`