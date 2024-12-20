"use client";

import { toast, useToast } from "@/hooks/use-toast";
import { PAYMENT_PROVIDER_ID, REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { stripePromise } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { zodResolver } from "@hookform/resolvers/zod";
import { StoreAddAddress, StoreCart, StoreCartLineItem } from "@medusajs/types";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CountryPicker from "./CountryPicker";
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
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const BasketListItem = ({ item }: { item: StoreCartLineItem }) => {
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
      setCart(response.parent as StoreCart);
      setIsLoading(false);
    },
  });

  const { data } = useQuery({
    queryKey: ["product", item?.variant_id],
    queryFn: () => {
      return sdk.store.product.retrieve(item?.product_id as string);
    },
  });

  console.log(data);

  const description = data?.product.description;

  return (
    <div className="flex justify-between w-full border border-gray-400 px-4 py-2">
      <div className="aspect-square bg-black min-h-36 min-w-36 max-h-52 max-w-52">
        <Image
          src={item.thumbnail as string}
          alt={item.title}
          width={200}
          height={200}
          style={{ objectFit: "contain" }}
        />
      </div>
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
          {Boolean(description) && (
            <div className="text-xl font-light">{`€${description}`}</div>
          )}
          <div className="text-2xl font-bold text-end">{`€${formatPrice(item.unit_price)}`}</div>
        </div>
      </div>
    </div>
  );
};

const BasketList = ({ items }: { items: StoreCartLineItem[] }) => {
  return (
    <div className="flex flex-col gap-4 h-fit w-full overflow-y-auto overflow-x-hidden">
      {items.map((item) => (
        <BasketListItem key={item?.id} item={item} />
      ))}
    </div>
  );
};

const CustomerForm = () => {
  const { cart, refetchCart } = useContext(CartContext);

  const customerFormSchema = useMemo(
    () =>
      z.object({
        first_name: z.string().min(1, { message: "First name is required" }),
        last_name: z.string().min(1, { message: "Last name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        phone: z.string().regex(/^$|^\+?\d{1,4}?\d{7}$/, {
          message:
            "Phone number must be at least 8 digits and may include country code with '+' prefix",
        }),
        city: z.string().min(1, { message: "City is required" }),
        address_1: z.string().min(1, { message: "Address is required" }),
        country_code: z
          .string()
          .min(2, { message: "Country code is required" }),
        postal_code: z.string().regex(/^\d{4,}$/, {
          message: "Postal code must be at least 4 digits",
        }),
      }),
    []
  );
  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    mode: "onChange",
    defaultValues: {
      first_name: cart?.billing_address?.first_name ?? "",
      last_name: cart?.billing_address?.last_name ?? "",
      phone: cart?.billing_address?.phone ?? "",
      city: cart?.billing_address?.city ?? "",
      address_1: cart?.billing_address?.address_1 ?? "",
      country_code: cart?.billing_address?.country_code ?? "",
      postal_code: cart?.billing_address?.postal_code ?? "",
      email: cart?.email ?? "",
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const clientSecret = cart?.payment_collection?.payment_sessions?.[0]?.data
    ?.client_secret as string;

  const initializePayment = async () => {
    setIsLoading(true);

    try {
      await sdk.store.cart.update(cart?.id as string, {
        region_id: REGION_ID,
        email: form.getValues().email,
      });
    } catch (e: any) {
      toast({
        title: "Error with customer registration",
        description: e.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }

    const address = {
      ...form.getValues(),
      email: undefined,
    } as StoreAddAddress;

    const { cart: updatedCart } = await sdk.store.cart.update(
      cart?.id as string,
      {
        shipping_address: address,
        billing_address: address,
      }
    );

    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: updatedCart?.id as string,
    });

    const shippingOption = shipping_options?.find(
      (option) => option?.name === updatedCart?.shipping_address?.country_code
    );

    if (!shippingOption) {
      toast({
        title: "Error with payment details",
        description: "Please select a shipping option",
        variant: "destructive",
      });

      setIsLoading(false);
      return;
    }

    await sdk.store.cart.addShippingMethod(updatedCart?.id as string, {
      option_id: shippingOption?.id as string,
    });

    sdk.store.payment
      .initiatePaymentSession(updatedCart as StoreCart, {
        provider_id: PAYMENT_PROVIDER_ID as string,
        data: {},
      })
      .then(async () => {
        await refetchCart();
      })
      .catch((error) => {
        throw new Error("Error creating payment session:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(initializePayment)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <Input placeholder="EMAIL *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <Input placeholder="PHONE" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input placeholder="FIRST NAME *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input placeholder="LAST NAME *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_1"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input placeholder="ADDRESS *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input className="col-span-2" placeholder="CITY *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country_code"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1 h-10">
              <FormControl>
                <CountryPicker
                  {...field}
                  value={form.getValues("country_code")}
                  setValue={(event: any) =>
                    form.setValue("country_code", event)
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input placeholder="POSTAL CODE *" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {!clientSecret && (
          <div className="h-12 col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : (
              <Button
                type="submit"
                disabled={
                  !cart?.items?.length ||
                  Boolean(clientSecret) ||
                  !form.formState.isValid
                }
                className="w-full text-xl tracking-widest h-full"
              >
                PROCEED
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};

const CheckoutForm = () => {
  const { cart, resetCart, setCart } = useContext(CartContext);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const clientSecret = cart?.payment_collection?.payment_sessions?.[0]?.data
      ?.client_secret as string;

    if (!stripe || !elements || !clientSecret || !cart)
      throw new Error("handlePayment() is missing data");

    const card = elements.getElement(CardElement);

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
      receipt_email: cart?.email,
    });

    if (error) {
      toast({
        title: "Error with payment details",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { type } = await sdk.store.cart.complete(cart?.id as string);

    if (type === "cart" && cart) {
      toast({
        title: "Error with the order",
        description: error,
        variant: "destructive",
      });
    } else if (type === "order") {
      toast({
        title: "Order placed succesfully",
        description:
          "Thank you for choosing us. You should receive a confirmation email soon.",
      });
    }

    await resetCart();
    await queryClient.refetchQueries({ queryKey: ["filteredProducts"] });
    setIsLoading(false);
  };

  const goBackToCustomerForm = () => {
    setCart({
      ...cart,
      payment_collection: { payment_sessions: [] },
    } as unknown as StoreCart);
  };

  return (
    <div className="h-fit flex flex-col gap-4">
      <Button variant={"link"} className="p-0" onClick={goBackToCustomerForm}>
        BACK
      </Button>
      <form
        className="flex flex-col gap-4 flex-1 h-full overflow-y-auto overflow-x-hidden justify-between"
        onSubmit={handlePayment}
      >
        <CardElement className="bg-gray-300 p-4" />

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="w-full flex justify-between">
              <span className="text-2xl font-bold text-gray-400">TOTAL</span>
              <span className="text-2xl font-bold">{`€${cart?.total ?? 0}`}</span>
            </div>
            <div className="flex justify-end">
              <span className="text-lg font-light">{`SHIPPING €${cart?.shipping_methods?.[0]?.amount ?? 0}`}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full font-bold tracking-widest text-2xl"
            size={"lg"}
            type="submit"
            disabled={!cart?.items?.length || !stripe || !elements}
          >
            {isLoading ? <Spinner /> : "CHECKOUT"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Basket() {
  const { cart } = useContext(CartContext);

  const [open, setOpen] = useState(false);

  const items: StoreCartLineItem[] =
    cart?.items?.filter((item) => item != null) ?? [];

  const clientSecret = cart?.payment_collection?.payment_sessions?.[0]?.data
    ?.client_secret as string;

  const hasItemsInBasket = Boolean(cart?.items?.length);

  useEffect(() => {
    if (open && !clientSecret) {
      setOpen(false);
    }
  }, [clientSecret]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        className="font-bold text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all hover:no-underline"
        disabled={!cart}
      >
        BASKET
      </DrawerTrigger>
      <DrawerContent className="p-4 max-w-[700px] ml-auto sm:mr-4 bg-black/85 h-full max-h-[90vh] overflow-hidden">
        <DrawerHeader>
          <DrawerTitle className="-mb-5 sm:-mb-7">
            <CutoffText>BASKET</CutoffText>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col flex-1 gap-10 justify-between overflow-y-auto">
          <div className="flex ">
            {hasItemsInBasket ? (
              <BasketList items={items} />
            ) : (
              <div className="flex p-2 md:py-10 flex-1 flex-col items-center justify-center ">
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
            <div className="flex flex-1 flex-col justify-end gap-4 p-1">
              {Boolean(clientSecret) ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: clientSecret,
                    loader: "auto",
                  }}
                >
                  <CheckoutForm />
                </Elements>
              ) : (
                <CustomerForm />
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
