import gql from "graphql-tag";

export const MUTATION_CREATE_BOOKING = gql`
  mutation CreateBooking($name: String!, $contact: String!, $email: String!, $institution: String, $suratUrl: String, $isAcademic: Boolean!) {
    createBooking(name: $name, contact: $contact, email: $email, institution: $institution, suratUrl: $suratUrl, isAcademic: $isAcademic) {
      bookingCode
    }
  }
`