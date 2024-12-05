"use client";

import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { StoreCart } from "@medusajs/types";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type ContextType = {
  cart: StoreCart | null;
  setCart: (cart: any) => void;
};

export const CartContext = createContext<ContextType>({
  cart: null,
  setCart: () => {},
});

export const CartProvider = ({ children }: Props) => {
  const cartId =
    typeof window !== "undefined" ? localStorage.getItem("cart_id") : "";
  const [cart, setCart] = useState<StoreCart | null>(null);

  useEffect(() => {
    (async () => {
      if (true || !cartId) {
        try {
          const response = await sdk.store.cart.create({
            region_id: REGION_ID,
          });

          setCart(response.cart);
        } catch (error: any) {
          throw new Error("Error creating cart:", error);
        }
      }
    })();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () =>
      sdk.store.cart.retrieve(cartId as string, { fields: "id,*items.*" }),
    enabled: Boolean(cartId),
  });

  return (
    <CartContext.Provider value={{ cart } as any}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
