"use client"

import { clearCheckoutFormStorage } from "@/components/Basket"
import { store, Cart } from "@/lib/store"
import React, { createContext, useEffect, useMemo, useState } from "react"

type Props = {
  children: React.ReactNode
}

type ContextType = {
  cart?: Cart
  setCart: (cart: Cart) => void
  refetchCart: () => Promise<void>
  resetCart: () => void
  basketOpen: boolean
  setBasketOpen: (open: boolean) => void
}

// Client-side logging helper
const logCart = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[CartProvider] ${message}`, data || '')
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[CartProvider] ${message}`, data || '')
  },
  error: (message: string, error: unknown, data?: Record<string, unknown>) => {
    const errorDetails: Record<string, unknown> = {
      message: error instanceof Error ? error.message : String(error),
    }

    if (error instanceof Error) {
      errorDetails.name = error.name
      errorDetails.stack = error.stack

      // Extract cause chain (important for network errors)
      if ('cause' in error && error.cause) {
        const cause = error.cause as any
        errorDetails.cause = {
          message: cause.message,
          code: cause.code,
          name: cause.name,
        }
      }

      // Extract error codes
      if ('code' in error) {
        errorDetails.code = (error as any).code
      }
    }

    console.error(`[CartProvider] ${message}`, {
      ...data,
      error: errorDetails,
      timestamp: new Date().toISOString(),
    })
  },
}

export const CartContext = createContext<ContextType>({
  cart: undefined,
  setCart: () => {},
  refetchCart: async () => {},
  resetCart: () => {},
  basketOpen: false,
  setBasketOpen: () => {},
})

export const CartProvider = ({ children }: Props) => {
  const [cart, setCart] = useState<Cart | undefined>(undefined)
  const [basketOpen, setBasketOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    logCart.debug('Initializing cart provider')

    // Try to retrieve existing cart from session cookie
    store.cart
      .retrieve()
      .then(({ cart }) => {
        logCart.debug('Cart retrieved successfully', { cartId: cart.id, itemCount: cart.items?.length })
        setCart(cart)
        setInitialized(true)
      })
      .catch((retrieveError) => {
        logCart.debug('No existing cart session, creating new cart', { error: retrieveError instanceof Error ? retrieveError.message : String(retrieveError) })

        // No existing cart session, create a new one
        clearCheckoutFormStorage()
        store.cart
          .create()
          .then(({ cart }) => {
            logCart.info('New cart created', { cartId: cart.id })
            setCart(cart)
            setInitialized(true)
          })
          .catch((createError) => {
            logCart.error('Failed to create cart - user cannot shop', createError, {
              retrieveError: retrieveError instanceof Error ? retrieveError.message : String(retrieveError),
            })
            setInitialized(true)
          })
      })
  }, [initialized])

  const resetCart = async () => {
    logCart.debug('Resetting cart')
    clearCheckoutFormStorage()
    await store.cart.reset()
    setCart(undefined)
    setInitialized(false)
  }

  const refetchCart = async () => {
    logCart.debug('Refetching cart')
    try {
      const { cart: fetchedCart } = await store.cart.retrieve()
      logCart.debug('Cart refetched successfully', { cartId: fetchedCart.id, itemCount: fetchedCart.items?.length })
      setCart(fetchedCart)
    } catch (error) {
      logCart.error('Failed to refetch cart, resetting', error)
      resetCart()
    }
  }

  const contextValue = useMemo(
    () => ({
      cart,
      setCart,
      refetchCart,
      resetCart,
      basketOpen,
      setBasketOpen,
    }),
    [cart, basketOpen]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
