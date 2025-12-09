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
  refetchCart: (cartId?: string) => Promise<void>
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

  useEffect(() => {
    if (cart) return

    const cartId = localStorage.getItem("cart_id")

    if (!cartId) {
      clearCheckoutFormStorage()
      store.cart
        .create()
        .then(({ cart }) => {
          setCart(cart)
          localStorage.setItem("cart_id", cart.id)
        })
        .catch((error) => {
          console.error("Error creating cart:", error)
        })
    } else {
      refetchCart(cartId)
    }
  }, [cart])

  const resetCart = () => {
    localStorage.removeItem("cart_id")
    clearCheckoutFormStorage()
    setCart(undefined)
  }

  const refetchCart = async (cartId?: string) => {
    const id = cartId ?? cart?.id
    if (!id) return

    try {
      const { cart: fetchedCart } = await store.cart.retrieve(id)
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
