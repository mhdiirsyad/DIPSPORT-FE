// graphql/queries/get_fields.ts
export const QUERY_GET_FIELDS = `
  query GetFields($stadionId: ID) {
    fields(stadionId: $stadionId) {
      id
      stadionId
      name
      description
      pricePerHour
      status
      images { id imageUrl }
      Stadion { id name }
    }
  }
`
