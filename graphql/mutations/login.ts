export const MUTATION_LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      admin { id name email }
    }
  }
`