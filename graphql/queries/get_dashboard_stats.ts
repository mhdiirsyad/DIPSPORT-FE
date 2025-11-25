import { gql } from 'graphql-tag'

export const QUERY_GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($startDate: String, $endDate: String, $stadionId: ID) {
    getDashboardStats(startDate: $startDate, endDate: $endDate, stadionId: $stadionId) {
      totalStadions
      totalFields
      totalBookings
      pendingBookings
      revenueYTD
      dailyBookings { date, count }
      weeklySlots { date, bookedHours, availableHours }
      userDemographics { category, count }
      recentBookings {
        id
        bookingCode
        name
        totalPrice
        status
        createdAt
        details {
          bookingDate
          startHour
          Field { stadionId, name }
        }
      }
      fieldRevenues {
        fieldId
        fieldName
        revenue
        percentage
      }
    }
  }
`