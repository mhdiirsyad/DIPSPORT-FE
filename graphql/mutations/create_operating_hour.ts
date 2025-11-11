export const MUTATION_CREATE_OPERATING_HOUR = `
  mutation CreateOperatingHour(
    $stadionId: Int!
    $day: DayofWeek!
    $open: DateTime!
    $close: DateTime!
  ) {
    createOperatingHour(
      stadionId: $stadionId
      day: $day
      openTime: $open
      closeTime: $close
    ) {
      id
      stadionId
      day
      openTime
      closeTime
    }
  }
`
