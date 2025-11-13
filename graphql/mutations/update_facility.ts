export const MUTATION_UPDATE_FACILITY = `
  mutation UpdateFacility(
    $facilityId: ID!
    $name: String!
    $icon: String
  ) {
    updateFacility(
      facilityId: $facilityId
      name: $name
      icon: $icon
    ) {
      id
      name
      icon
    }
  }
`