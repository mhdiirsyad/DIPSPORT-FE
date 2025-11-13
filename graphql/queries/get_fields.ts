export const QUERY_GET_FIELDS = `
  query FieldsDashboard($stadionId: ID) {
    fields(stadionId: $stadionId) {
      id
      stadionId
      name
      description
      pricePerHour
      status
      Stadion {
        id
        name
      }
      images {
        id
        imageUrl
      }
      bookingDetails {
        id
        bookingDate
        startHour
        subtotal
      }
    }
  }
`
