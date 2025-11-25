export const QUERY_GET_STADIONS = `
  query StadionsWithDetails {
    stadions {
      id
      name
      description
      mapUrl
      status
      operatingHours {
        openHour
        closeHour
      }
      facilities {
        Facility {
          id
          name
        }
      }
      images {
        id
        imageUrl
      }
      fields {
        id
        name
        pricePerHour
        status
        images {
          id
          imageUrl
        }
      }
    }
  }
`