export const MUTATION_DELETE_STADION_IMAGE = `
  mutation DeleteStadionImage($imageId: ID!) {
    deleteStadionImage(imageId: $imageId) {
      id
      imageUrl
    }
  }
`
