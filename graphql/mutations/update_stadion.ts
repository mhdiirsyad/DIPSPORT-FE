export const MUTATION_UPDATE_STADION = `
  mutation UpdateStadion(
    $stadionId: ID!
    $name: String!
    $description: String
    $mapUrl: String!
    $status: Status
    $facilityIds: [Int]
  ) {
    updateStadion(
      stadionId: $stadionId
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