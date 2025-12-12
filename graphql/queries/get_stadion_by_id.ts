import gql from "graphql-tag";

export const QUERY_GET_STADION_BY_ID = gql`
  query GetStadionById($stadionId: ID!) {
    stadion(stadionId: $stadionId) {
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
        description
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