export const query = `
    query CheckBookingAvailability($fieldId: ID!, $date: String!) {
        bookings(where: {
        fieldId: { equals: $fieldId }
        bookDate: { equals: $date }
        bookStatus: { notIn: ["CANCEL", "FAILED"] }
        }) {
        id
        timeSlot
        }
    }
`