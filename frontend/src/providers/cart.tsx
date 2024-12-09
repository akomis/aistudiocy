"use client";

import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { StoreCart } from "@medusajs/types";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type ContextType = {
  cart?: StoreCart | undefined;
  setCart: (cart: StoreCart) => void;
  refetchCart: (cartId?: string) => Promise<any>;
  resetCart: () => void;
};

export const CartContext = createContext<ContextType>({
  cart: undefined,
  setCart: () => {},
  refetchCart: () => {
    return new Promise((resolve) => {
      resolve(`Need to implement refetchCart in cart context`);
    });
  },
  resetCart: () => {},
});

export const CartProvider = ({ children }: Props) => {
  const [cart, setCart] = useState<StoreCart | undefined>(undefined);

  useEffect(() => {
    if (cart) return;

    const cartId = localStorage.getItem("cart_id");

    if (!cartId) {
      sdk.store.cart
        .create({
          region_id: REGION_ID,
        })
        .then(({ cart }) => {
          setCart(cart);
          localStorage.setItem("cart_id", cart.id);
        })
        .catch((error) => {
          throw new Error("Error creating cart:", error);
        });
    } else {
      refetchCart(cartId);
    }
  }, [cart]);

  const resetCart = () => {
    localStorage.removeItem("cart_id");
    setCart(undefined);
  };

  const refetchCart = (cartId?: string) =>
    sdk.store.cart
      .retrieve(cartId ?? (cart?.id as string), {
        fields: "*items.*",
      })
      .then(({ cart }) => {
        setCart(cart);
      })
      .catch((error) => {
        throw new Error("Error retrieving cart:", error);
      });

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        refetchCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
