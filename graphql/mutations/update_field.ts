export const MUTATION_UPDATE_FIELD = `
  mutation UpdateField(
    $fieldId: Int!, 
    $stadionId: Int!, 
    $name: String!, 
    $description: String, 
    $pricePerHour: Int!
    # $images: [FieldImageInput!]
  ) {
    updateField(
      fieldId: $fieldId, 
      stadionId: $stadionId, 
      name: $name, 
      description: $description, 
      pricePerHour: $pricePerHour
      # images: $images
    ) {
      id
      name
    }
  }
`