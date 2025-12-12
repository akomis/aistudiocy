"use client"

import { clearCheckoutFormStorage } from "@/components/Basket"
import { store, Cart } from "@/lib/store"
import React, { createContext, useEffect, useState } from "react"

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

    // Try to retrieve existing cart from session cookie
    store.cart
      .retrieve()
      .then(({ cart }) => {
        setCart(cart)
        setInitialized(true)
      })
      .catch(() => {
        // No existing cart session, create a new one
        clearCheckoutFormStorage()
        store.cart
          .create()
          .then(({ cart }) => {
            setCart(cart)
            setInitialized(true)
          })
          .catch((error) => {
            console.error("Error creating cart:", error)
            setInitialized(true)
          })
      })
  }, [initialized])

  const resetCart = async () => {
    clearCheckoutFormStorage()
    await store.cart.reset()
    setCart(undefined)
    setInitialized(false)
  }

  const refetchCart = async () => {
    try {
      const { cart: fetchedCart } = await store.cart.retrieve()
      setCart(fetchedCart)
    } catch (error) {
      console.error("Error retrieving cart:", error)
      resetCart()
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        refetchCart,
        resetCart,
        basketOpen,
        setBasketOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
