import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createLoginLimiter, createSessionToken, verifyPassword, verifySessionToken } from './auth.js'

const COOKIE = 'session'
const WEEK_SECONDS = 7 * 24 * 60 * 60

globalThis.loginLimiter ??= createLoginLimiter()

export async function isAdmin() {
  const store = await cookies()
  return verifySessionToken(store.get(COOKIE)?.value, process.env.SESSION_SECRET)
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/studio/login')
}

export async function logIn(password) {
  const limiter = globalThis.loginLimiter
  if (limiter.isLocked()) return 'terkunci'
  if (!verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)) {
    limiter.fail()
    return 'salah'
  }
  limiter.reset()
  const store = await cookies()
  store.set(COOKIE, createSessionToken(process.env.SESSION_SECRET), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: WEEK_SECONDS,
  })
  return null
}

export async function logOut() {
  const store = await cookies()
  store.delete(COOKIE)
}
