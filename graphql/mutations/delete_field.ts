export const MUTATION_DELETE_FIELD = `
  mutation DeleteField($fieldId: Int!) {
    deleteField(fieldId: $fieldId) {
      id
    }
  }
`