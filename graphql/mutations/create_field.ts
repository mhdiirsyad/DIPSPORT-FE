export const MUTATION_CREATE_FIELD = `
  mutation CreateField(
    $stadionId: Int!
    $name: String!
    $description: String
    $pricePerHour: Int!
    $images: [FieldImageInput!]
    $status: Status
  ) {
    createField(
      stadionId: $stadionId
      name: $name
      description: $description
      pricePerHour: $pricePerHour
      images: $images
      status: $status
    ) {
      id
      name
      status
    }
  }
`