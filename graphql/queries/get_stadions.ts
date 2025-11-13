export const QUERY_GET_STADIONS = `
  query StadionsWithDetails {
    stadions {
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
