// ~/graphql/mutations/create_stadion.ts
export const MUTATION_CREATE_STADION = `
  mutation CreateStadion(
    $name: String!
    $description: String
    $mapUrl: String!
    $status: Status
    $facilityIds: [Int]
  ) {
    createStadion(
      name: $name
      description: $description
      mapUrl: $mapUrl
      status: $status
      facilityIds: $facilityIds
    ) {
      id
      name
      status
      facilities {
        id
        Facility {
          id
          name
          icon
        }
      }
    }
  }
`