export const MUTATION_DELETE_FIELD_IMAGE = `
  mutation DeleteFieldImage($imageId: ID!) {
    deleteFieldImage(imageId: $imageId) {
      id
      imageUrl
    }
  }
`
