export const QUERY_GET_FIELD_BY_ID = `
  query GetFieldById($fieldId: ID!) {
    field(fieldId: $fieldId) {
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
