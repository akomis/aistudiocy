"use client";

import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { StoreCart } from "@medusajs/types";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type ContextType = {
  cart: StoreCart | undefined;
  setCart: (cart: any) => void;
  refreshCart: () => void;
  clientSecret: string | undefined;
  setClientSecret: (secret: string) => void;
};

export const CartContext = createContext<ContextType>({
  cart: undefined,
  setCart: () => {},
  refreshCart: () => {},
  clientSecret: undefined,
  setClientSecret: () => {},
});

export const CartProvider = ({ children }: Props) => {
  const [cart, setCart] = useState<StoreCart | undefined>(undefined);
  const [clientSecret, setClientSecret] = useState<string | undefined>(
    undefined
  );

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
      sdk.store.cart
        .retrieve(cartId as string, {
          fields: "*items.*",
        })
        .then(({ cart }) => {
          setCart(cart);
        })
        .catch((error) => {
          throw new Error("Error retrieving cart:", error);
        });
    }
  }, [cart]);

  const refreshCart = () => {
    localStorage.removeItem("cart_id");
    setCart(undefined);
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, refreshCart, clientSecret, setClientSecret }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
