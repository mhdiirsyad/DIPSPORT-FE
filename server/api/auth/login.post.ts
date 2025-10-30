import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { $fetch } from 'ofetch'
import { MUTATION_LOGIN } from '~/graphql/mutations/login'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string; password: string }>(event)
  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email & password required' })

  const endpoint = process.env.GQL_HTTP_ENDPOINT
  if (!endpoint)
    throw createError({ statusCode: 500, statusMessage: 'Missing GQL_HTTP_ENDPOINT' })

  try {
    const resp = await $fetch<{ data?: any; errors?: Array<{ message: string; extensions?: any }> }>(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { query: MUTATION_LOGIN, variables: { email, password } },
      timeout: 8000,
      retry: 0
    })

    if (resp?.errors?.length) {
      const first = resp.errors[0]
      const msg = first?.message || 'Invalid credentials'
      const code = first?.extensions?.code === 'UNAUTHENTICATED' ? 401 : 400
      throw createError({ statusCode: code, statusMessage: msg })
    }

    const data = resp?.data?.login
    if (!data?.token)
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

    setCookie(event, 'admin_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return { ok: true, admin: data.admin }
  } catch (err: any) {
    if (err?.name === 'FetchError' || err?.message?.includes('timeout')) {
      throw createError({ statusCode: 502, statusMessage: 'Auth service unreachable' })
    }
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Unexpected error' })
  }
})