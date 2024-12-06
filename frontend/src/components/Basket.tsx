"use client";

import { StoreAddAddress, StoreCartLineItem } from "@medusajs/types";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { MinusIcon } from "lucide-react";
import Image from "next/image";
import {
  AddressElement,
  useElements,
  useStripe,
  Elements,
  CardElement,
} from "@stripe/react-stripe-js";
import CutoffText from "./CutoffText";
import { Label } from "@radix-ui/react-label";
import { useContext, useState } from "react";
import { CartContext } from "@/providers/cart";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "@/lib/medusa";
import Spinner from "./Spinner";
import { REGION_ID, SHIPPING_OPTION_ID } from "@/lib/constants";
import { stripePromise } from "@/lib/stripe";
import { Input } from "./ui/input";
import {
  StripeAddressElementChangeEvent,
  StripeCardElement,
} from "@stripe/stripe-js";

type BasketGridProps = {
  items: StoreCartLineItem[];
};

const BasketGridItem = ({ item }: { item: StoreCartLineItem }) => {
  const { cart, setCart } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(false);

  const deleteItem = useMutation({
    mutationKey: ["delete", item?.id],
    mutationFn: () => {
      setIsLoading(true);
      return sdk.store.cart.deleteLineItem(
        cart?.id as string,
        item?.id as string
      );
    },
    onSuccess: (response) => {
      setCart(response.parent);
      setIsLoading(false);
    },
  });

  return (
    <div className="relative aspect-square border-[1px] border-white p-3 bg-black min-h-36 min-w-36">
      <Image
        src={item.thumbnail as string}
        alt={item.title}
        width={200}
        height={200}
        style={{ objectFit: "contain" }}
      />
      <div className="absolute bottom-0 w-full flex items-center justify-between p-4 pr-8 animate-in fade-in ease-in">
        <span className="text-xl font-light">{`€${item.unit_price}`}</span>
        <Button
          variant="ghost"
          className="text-xl"
          onClick={() => deleteItem.mutate()}
        >
          {isLoading ? <Spinner /> : <MinusIcon />}
        </Button>
      </div>
    </div>
  );
};

const BasketGrid = ({ items }: BasketGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 h-full md:max-w-[50vw] overflow-y-auto overflow-x-hidden">
      {items.map((item) => (
        <BasketGridItem key={item?.id} item={item} />
      ))}
    </div>
  );
};

const CheckoutForm = () => {
  const { cart, setCart, refreshCart } = useContext(CartContext);

  const stripe = useStripe();
  const elements = useElements();

  const [shippingAddress, setShippingAddress] = useState<
    StripeAddressElementChangeEvent["value"] | null
  >(null);
  const [email, setEmail] = useState<string | null>(null);

  const handlePayment = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    const address: StoreAddAddress = {
      address_1: shippingAddress?.address?.line1 ?? undefined,
      address_2: shippingAddress?.address?.line2 ?? undefined,
      city: shippingAddress?.address?.city ?? undefined,
      country_code:
        shippingAddress?.address?.country.toLowerCase() ?? undefined,
      postal_code: shippingAddress?.address?.postal_code ?? undefined,
    };

    await sdk.store.cart.update(cart?.id as string, {
      region_id: REGION_ID,
      email: email as string,
      shipping_address: address,
      billing_address: address,
    });

    const { cart: updatedCart } = await sdk.store.cart.addShippingMethod(
      cart?.id as string,
      {
        option_id: SHIPPING_OPTION_ID,
      }
    );

    setCart(updatedCart);
    const clientSecret = updatedCart?.payment_collection?.payment_sessions?.[0]
      .data.client_secret as string;

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card as StripeCardElement,
        billing_details: {
          name: cart?.billing_address?.first_name,
          email: cart?.email,
          phone: cart?.billing_address?.phone,
          address: {
            city: cart?.billing_address?.city,
            country: cart?.billing_address?.country_code,
            line1: cart?.billing_address?.address_1,
            line2: cart?.billing_address?.address_2,
            postal_code: cart?.billing_address?.postal_code,
          },
        },
      },
    });

    if (error) {
      console.log(error);
    }

    const { type } = await sdk.store.cart.complete(cart?.id as string);

    if (type === "cart" && cart) {
      console.error(error);
    } else if (type === "order") {
      alert("Order placed.");
      refreshCart();
    }
  };

  return (
    <form
      className="flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden"
      onSubmit={handlePayment}
    >
      <AddressElement
        onChange={(event: any) => {
          setShippingAddress(event.value);
        }}
        options={{ mode: "billing" }}
      />
      <CardElement className="bg-white p-4" />
      <Input
        type="email"
        placeholder="Email"
        onChange={(event) => {
          setEmail(event.target.value);
        }}
        className="bg-white text-black min-h-12"
      />

      <div className="flex w-full flex-col gap-4">
        <div className="w-full flex justify-between">
          <span className="text-2xl font-bold text-gray-400">TOTAL</span>
          <span className="text-2xl font-bold ml-2">{`€${cart?.total ?? 0}`}</span>
        </div>
        <Button
          variant="outline"
          className="w-full font-bold tracking-widest text-2xl"
          size={"lg"}
          type="submit"
          disabled={!cart?.items?.length || !stripe || !elements || !email}
        >
          CHECKOUT
        </Button>
      </div>
    </form>
  );
};

type Props = {
  noProductsAvailable?: boolean;
};

export default function Basket({ noProductsAvailable }: Props) {
  const { cart } = useContext(CartContext);

  const items: StoreCartLineItem[] =
    cart?.items?.filter((item) => item != null) ?? [];
  const clientSecret = cart?.payment_collection?.payments?.[0]?.data
    ?.client_secret as string;

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

        <div className="flex flex-1 flex-col md:flex-row gap-10 max-h-[70vh] ">
          {items?.length ? (
            <BasketGrid items={items} />
          ) : (
            <Label className="text-2xl font-thin">
              Your basket is empty. Use the [+] button on your preferred piece.
            </Label>
          )}

          <hr className="h-1 mx-auto w-96 md:h-96 md:w-1 md:my-auto rounded-full border-0 bg-[#111111] " />

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              loader: "auto",
              appearance: {
                theme: "stripe",
                labels: "floating",
                variables: { borderRadius: "0" },
              },
            }}
          >
            <CheckoutForm />
          </Elements>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
