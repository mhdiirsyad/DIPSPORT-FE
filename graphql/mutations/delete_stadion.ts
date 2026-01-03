export const MUTATION_DELETE_STADION = `
  mutation DeleteStadion($stadionId: ID!) {
    deleteStadion(stadionId: $stadionId) {
      id
    }
  }
`