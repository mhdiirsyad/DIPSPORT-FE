export const MUTATION_UPDATE_OPERATING_HOUR = `
  mutation UpdateOperatingHour($openHour: Int!, $closeHour: Int!) {
    updateOperatingHour(openHour: $openHour, closeHour: $closeHour) {
      id
      openHour
      closeHour
    }
  }
`
