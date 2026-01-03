import { defineEventHandler, setCookie } from "h3";
import { AUTH } from '~/utils/constants'

export default defineEventHandler(async (event) => {
  setCookie(event, AUTH.TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true, message: 'Logged out successfully' };
});
