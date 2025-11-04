export const MUTATION_DELETE_OPERATING_HOUR = `
  mutation DeleteOperatingHour($id: Int!) {
    deleteOperatingHour(id: $id) {
      id
      day
    }
  }
`
