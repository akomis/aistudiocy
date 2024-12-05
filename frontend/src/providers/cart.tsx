"use client";

import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { StoreCart } from "@medusajs/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type ContextType = {
  cart: StoreCart | undefined;
  setCart: (cart: any) => void;
  refreshCart: () => void;
};

export const CartContext = createContext<ContextType>({
  cart: undefined,
  setCart: () => {},
  refreshCart: () => {},
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
      sdk.store.cart
        .retrieve(cartId as string, {
          fields: "id,*items.*",
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
    <CartContext.Provider value={{ cart, setCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
