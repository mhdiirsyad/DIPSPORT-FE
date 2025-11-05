export const MUTATION_UPDATE_OPERATING_HOUR = `
  mutation UpdateOperatingHour(
    $id: Int!,
    $day: DayofWeek!,
    $open: DateTime!,
    $close: DateTime!
  ) {
    updateOperatingHour(
      id: $id,
      day: $day,
      openTime: $open,
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
