import gql from "graphql-tag";

export const QUERY_GET_STADION_BY_ID = gql`
  query GetStadionById($stadionId: ID!) {
    stadion(stadionId: $stadionId) {
      id
      name
      description
      mapUrl
      operatingHours {
        openTime
        closeTime
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
        images {
          id
          imageUrl
        }
      }
    }
  }
`
