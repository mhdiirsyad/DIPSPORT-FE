export const QUERY_GET_FIELDS = `
    query GetFields($stadionId: ID) {
        fields(stadionId: $stadionId) {
            id
            stadionId
            name
            description
            pricePerHour
            images {
                id
                imageUrl
            }
        }
    }
`

