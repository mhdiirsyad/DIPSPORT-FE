export const QUERY_GET_FACILITY_BY_ID = `
  query GetFacilityById($facilityId: ID!) {
    facility(facilityId: $facilityId) {
      id
      name
      icon
    }
  }
`