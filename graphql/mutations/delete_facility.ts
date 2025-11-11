export const MUTATION_DELETE_FACILITY = `
  mutation DeleteFacility($facilityId: ID!) {
    deleteFacility(facilityId: $facilityId) {
      id
    }
  }
`