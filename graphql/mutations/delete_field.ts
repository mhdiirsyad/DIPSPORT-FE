export const MUTATION_DELETE_FIELD = `
  mutation DeleteField($fieldId: ID!) {
    deleteField(fieldId: $fieldId) {
      id
      name
    }
  }
`