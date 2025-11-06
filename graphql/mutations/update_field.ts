export const MUTATION_UPDATE_FIELD = `
  mutation UpdateField(
    $fieldId: ID!
    $stadionId: Int!
    $name: String!
    $description: String
    $pricePerHour: Int!
    $images: [FieldImageInput!]
  ) {
    updateField(
      fieldId: $fieldId
      stadionId: $stadionId
      name: $name
      description: $description
      pricePerHour: $pricePerHour
      images: $images
    ) {
      id
      stadionId
      name
      description
      pricePerHour
      images {
        id
        imageUrl
      }
    }
  }
`