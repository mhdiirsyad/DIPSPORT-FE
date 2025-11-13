export const MUTATION_CREATE_FACILITY = `
  mutation CreateFacility(
    $name: String!
    $icon: String
  ) {
    createFacility(
      name: $name
      icon: $icon
    ) {
      id
      name
      icon
    }
  }
`