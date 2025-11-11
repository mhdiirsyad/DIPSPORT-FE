export const QUERY_GET_STADIONS = `
  query GetStadions {
    stadions {
      id
      name
      mapUrl
      images {
        imageUrl
      }
    }
  }
`