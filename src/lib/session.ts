import { cookies } from 'next/headers'

const CART_SESSION_COOKIE = 'cart_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Get the cart ID from the session cookie
 */
export async function getCartSession(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_SESSION_COOKIE)?.value
}

/**
 * Set the cart ID in the session cookie
 */
export async function setCartSession(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_SESSION_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

/**
 * Clear the cart session cookie
 */
export async function clearCartSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CART_SESSION_COOKIE)
}
