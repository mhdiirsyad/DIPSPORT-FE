import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_token')
  if (!token) return { authenticated: false }

  const secret = process.env.JWT_SECRET
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'JWT_SECRET missing' })

  try {
    const payload = jwt.verify(token, secret as string)
    return { authenticated: true, payload }
  } catch {
    return { authenticated: false }
  }
})