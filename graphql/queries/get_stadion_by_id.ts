export const QUERY_GET_STADION_BY_ID = `
  query GetStadionById($stadionId: ID!) {
    stadion(stadionId: $stadionId) {
      id
      name
      description
      mapUrl
    }
  }
`