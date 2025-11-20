import gql from "graphql-tag";

export const QUERY_GET_STADIONS = gql`
  query StadionsWithDetails {
    stadions {
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
