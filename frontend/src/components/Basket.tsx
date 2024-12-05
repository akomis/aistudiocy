"use client";

import { StoreCartLineItem, StoreProduct } from "@medusajs/types";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { MinusIcon } from "lucide-react";
import Image from "next/image";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
  Elements,
} from "@stripe/react-stripe-js";
import { sdk } from "@/lib/medusa";
import CutoffText from "./CutoffText";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@radix-ui/react-label";
import { useContext } from "react";
import { CartContext } from "@/providers/cart";

type BasketGridProps = {
  items: StoreCartLineItem[];
};

const BasketGrid = ({ items }: BasketGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 overflow-y-auto overflow-x-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square border-[1px] border-white p-3 bg-black"
        >
          <Image
            src={item.thumbnail as string}
            alt={item.title}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <div className="absolute bottom-0 w-full flex items-center justify-between p-4 pr-8 animate-in fade-in ease-in">
            <span className="text-xl font-light">{`€${null}`}</span>
            <Button variant="ghost" className="text-xl text-white">
              <MinusIcon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) return;
  };

  return (
    <>
      <AddressElement
        onChange={(event) => {
          //setShippingAddress(event.value);
        }}
        options={{ mode: "billing" }}
      />

      <PaymentElement />
    </>
  );
};

type Props = {
  noProductsAvailable?: boolean;
};

export default function Basket({ noProductsAvailable }: Props) {
  const { cart } = useContext(CartContext);

  const items: StoreCartLineItem[] = cart?.items ?? [];

  return (
    <Drawer>
      <DrawerTrigger
        className="font-bold text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all hover:no-underline p-0"
        disabled={noProductsAvailable}
      >
        BASKET
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>
            <CutoffText>BASKET</CutoffText>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex gap-10 max-h-[70vh] md:max-h-[50vh] ">
          {items?.length ? (
            <BasketGrid items={items} />
          ) : (
            <Label className="text-2xl font-thin">
              Your basket is empty. Use the [+] button on your preferred piece.
            </Label>
          )}

          <hr className="h-96 w-1 bg-[#111111] my-auto rounded-full border-0" />

          {/* <Elements
            stripe={stripePromise}
            // @ts-ignore
            options={{ clientSecret, loader }}
          >
            <CheckoutForm />
          </Elements> */}

          <div className="ml-auto flex flex-col self-end justify-center w-64 gap-4">
            <div className="w-full flex justify-between">
              <span className="text-2xl font-bold text-gray-400">TOTAL</span>
              <span className="text-2xl font-bold ml-2">€0.00</span>
            </div>
            <Button
              variant="outline"
              className="w-full font-bold tracking-widest text-2xl"
              size={"lg"}
            >
              CHECKOUT
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
