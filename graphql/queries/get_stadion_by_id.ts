export const QUERY_GET_STADION_BY_ID = `
  query GetStadionById($stadionId: ID!) {
    stadion(stadionId: $stadionId) {
      id
      name
      status
      description
      mapUrl
      operatingHours {
        openHour
        closeHour
      }
      facilities {
        Facility {
          id
          name
          icon
        }
      }
      images {
        id
        imageUrl
      }
      fields {
        id
        name
        status
        description
        pricePerHour
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
  }
`
