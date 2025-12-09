"use client";

import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { useMutation } from "@tanstack/react-query";
import { useContext, useState } from "react";
import Spinner from "./Spinner";
import { Button } from "./ui/button";

type Props = {
  productId: string;
  openBasketOnAdd?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export default function AddToCartButton({
  productId,
  openBasketOnAdd = false,
  className,
  size = "lg",
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { cart, setCart, setBasketOpen } = useContext(CartContext);

  const lineItemIndex = cart?.items?.findIndex((item) => {
    const itemProductId =
      typeof item.product === "string" ? item.product : item.product?.id;
    return itemProductId === productId;
  });
  const isInBasket = lineItemIndex !== undefined && lineItemIndex >= 0;

  const add = useMutation({
    mutationKey: ["add", productId],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.addLineItem(cart?.id as string, productId, 1);
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
      if (openBasketOnAdd) {
        setBasketOpen(true);
      }
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const deleteItem = useMutation({
    mutationKey: ["delete", productId],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.deleteLineItem(
        cart?.id as string,
        lineItemIndex as number
      );
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  return (
    <Button
      variant={isInBasket ? "outline" : "default"}
      size={size}
      className={cn(
        "text-base font-medium",
        isInBasket && "border-white/30",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        isInBasket ? deleteItem.mutate() : add.mutate();
      }}
      disabled={!cart || isLoading}
    >
      {isLoading ? (
        <Spinner className={!isInBasket ? "text-black dark:text-black" : ""} />
      ) : isInBasket ? (
        "REMOVE"
      ) : (
        "ADD"
      )}
    </Button>
  );
}
