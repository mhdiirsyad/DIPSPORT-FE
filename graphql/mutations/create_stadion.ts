// String mutasi Create
export const MUTATION_CREATE_STADION = `
  mutation CreateStadion(
    $name: String!, 
    $description: String, 
    $mapUrl: String!
  ) {
    createStadion(
      name: $name, 
      description: $description, 
      mapUrl: $mapUrl
    ) {
      id
      name
    }
  }
`