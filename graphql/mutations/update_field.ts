export const MUTATION_UPDATE_FIELD = `
  mutation UpdateField(
    $fieldId: ID!
    $stadionId: Int!
    $name: String!
    $description: String
    $pricePerHour: Int!
    $images: [FieldImageInput!]
    $status: Status
  ) {
    updateField(
      fieldId: $fieldId
      stadionId: $stadionId
      name: $name
      description: $description
      pricePerHour: $pricePerHour
      images: $images
      status: $status
    ) {
      id
      stadionId
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
`