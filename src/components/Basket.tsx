"use client";

import { CartItem, Product, store } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import CutoffText from "./CutoffText";
import Spinner from "./Spinner";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Label } from "./ui/label";

interface BasketItem extends CartItem {
  product: Product;
}

const CHECKOUT_FORM_STORAGE_KEY = "checkout_form_values";

export const clearCheckoutFormStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
  }
};

const BasketListItem = ({
  item,
  index,
}: {
  item: BasketItem;
  index: number;
}) => {
  const { setCart } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(false);

  const deleteItem = useMutation({
    mutationKey: ["delete", item.product.id],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.deleteLineItem(index);
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const thumbnailUrl =
    typeof item.product.thumbnail === "string"
      ? item.product.thumbnail
      : item.product.thumbnail?.url;

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex justify-between w-full border border-gray-400 px-4 py-2">
      <Link
        href={`/catalogue/${item.product.handle}`}
        className="aspect-square bg-black w-24 sm:w-36 md:w-52 flex-shrink-0 relative block hover:opacity-80 transition-opacity"
      >
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={item.product.title}
            fill
            className="object-cover"
          />
        )}
        {item.quantity > 1 && (
          <div className="absolute -top-1 -right-2 bg-white text-black rounded-2xl w-6 h-6 flex items-center justify-center text-sm font-bold">
            {item.quantity}
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-between items-end">
        {isLoading ? (
          <div className="p-2">
            <Spinner />
          </div>
        ) : (
          <Button
            variant="ghost"
            className="text-xl p-0"
            onClick={() => deleteItem.mutate()}
          >
            REMOVE
          </Button>
        )}

        <div className="flex flex-col items-end justify-between">
          {item.product.size && (
            <div className="text-sm text-gray-400">{item.product.size}</div>
          )}
          {item.quantity > 1 ? (
            <>
              <div className="text-sm text-gray-400">
                {`€${formatPrice(item.unitPrice)} × ${item.quantity}`}
              </div>
              <div className="text-2xl font-bold text-end">{`€${formatPrice(lineTotal)}`}</div>
            </>
          ) : (
            <div className="text-2xl font-bold text-end">{`€${formatPrice(item.unitPrice)}`}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const BasketList = ({ items }: { items: BasketItem[] }) => {
  return (
    <div className="flex flex-col gap-4 h-fit w-full overflow-y-auto overflow-x-hidden">
      {items.map((item, index) => (
        <BasketListItem key={item.product.id} item={item} index={index} />
      ))}
    </div>
  );
};

export default function Basket() {
  const { cart, setBasketOpen, basketOpen } = useContext(CartContext);

  const items: BasketItem[] =
    (cart?.items?.filter(
      (item): item is BasketItem =>
        item != null && typeof item.product !== "string"
    ) as BasketItem[]) ?? [];

  const hasItemsInBasket = Boolean(items.length);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <Drawer open={basketOpen} onOpenChange={setBasketOpen}>
      <DrawerTrigger
        className="font-black text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all hover:no-underline disabled:opacity-50 disabled:cursor-wait tracking-widest"
        disabled={!cart}
      >
        BASKET
      </DrawerTrigger>
      <DrawerContent className="p-4 max-w-[700px] border-b-0 ml-auto sm:mr-4 bg-black/85 h-full max-h-[90vh] overflow-hidden rounded-none">
        <DrawerHeader>
          <DrawerTitle className="-mb-4 mx-auto">
            <CutoffText>BASKET</CutoffText>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col flex-1 gap-6 justify-between overflow-y-auto">
          <div className="flex flex-1">
            {hasItemsInBasket ? (
              <BasketList items={items} />
            ) : (
              <div className="flex p-2 md:py-10 flex-1 flex-col items-center justify-center">
                <Label className="text-lg sm:text-2xl font-thin text-center">
                  Your basket is empty.
                </Label>{" "}
                <Label className="text-lg sm:text-2xl font-thin text-center">
                  Use the [+] button on your preferred piece.
                </Label>
              </div>
            )}
          </div>

          {hasItemsInBasket && (
            <div className="flex flex-col gap-4 p-1">
              <div className="w-full flex justify-between border-t border-gray-600 pt-4">
                <span className="text-xl font-light text-gray-400">
                  SUBTOTAL
                </span>
                <span className="text-xl font-bold">{`€${formatPrice(subtotal)}`}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setBasketOpen(false)}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full font-bold tracking-widest text-2xl h-14"
                  size="lg"
                >
                  CONTINUE
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
