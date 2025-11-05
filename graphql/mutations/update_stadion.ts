// String mutasi Update
export const MUTATION_UPDATE_STADION = `
  mutation UpdateStadion($stadionId: ID!, $name: String!, $description: String, $mapUrl: String!) {
    updateStadion(stadionId: $stadionId, name: $name, description: $description, mapUrl: $mapUrl) {
      id
      name
    }
  }
`