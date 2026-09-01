"use client";

import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import Spinner from "./Spinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  productId: string;
  openBasketOnAdd?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  maxQuantity?: number;
};

export default function AddToCartButton({
  productId,
  openBasketOnAdd = false,
  className,
  size = "lg",
  maxQuantity = 1,
}: Props) {
  const t = useTranslations("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
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
      return store.cart.addLineItem(productId, quantity);
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
      return store.cart.deleteLineItem(lineItemIndex as number);
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const showQuantityInput = maxQuantity > 1 && !isInBasket;
  const [inputValue, setInputValue] = useState("1");

  return (
    <div className={cn("flex gap-2 w-full", className)}>
      {showQuantityInput && (
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={maxQuantity}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onFocus={() => {
            setInputValue("");
          }}
          onBlur={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (isNaN(parsed) || parsed < 1) {
              setQuantity(1);
              setInputValue("1");
            } else if (parsed > maxQuantity) {
              setQuantity(maxQuantity);
              setInputValue(String(maxQuantity));
            } else {
              setQuantity(parsed);
              setInputValue(String(parsed));
            }
          }}
          className="w-20 text-center"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <Button
        variant={isInBasket ? "outline" : "default"}
        size={size}
        className={cn(
          "text-base font-medium flex-1",
          isInBasket && "border-white/30"
        )}
        onClick={(e) => {
          e.stopPropagation();
          isInBasket ? deleteItem.mutate() : add.mutate();
        }}
        disabled={!cart || isLoading}
      >
        {isLoading ? (
          <Spinner
            className={!isInBasket ? "text-black dark:text-black" : ""}
          />
        ) : isInBasket ? (
          t("remove")
        ) : (
          t("add")
        )}
      </Button>
    </div>
  );
}
