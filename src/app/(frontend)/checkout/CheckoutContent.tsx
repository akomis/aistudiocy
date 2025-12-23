"use client";

import CutoffText from "@/components/CutoffText";
import DropdownPicker from "@/components/DropdownPicker";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Countries, CountryCode } from "@/lib/countries";
import { CartItem, Coupon, Product, ShippingOption, store } from "@/lib/store";
import { stripePromise } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface BasketItem extends CartItem {
  product: Product;
}

const CHECKOUT_FORM_STORAGE_KEY = "checkout_form_values";

const getStoredFormValues = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const OrderSummaryItem = ({ item }: { item: BasketItem }) => {
  const thumbnailUrl =
    typeof item.product.thumbnail === "string"
      ? item.product.thumbnail
      : item.product.thumbnail?.url;

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-4 py-3 border-b border-gray-700">
      <div className="aspect-square bg-black w-16 flex-shrink-0 relative">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={item.product.title}
            fill
            className="object-cover"
          />
        )}
        {item.quantity > 1 && (
          <div className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {item.quantity}
          </div>
        )}
      </div>
      <div className="flex flex-1 justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{item.product.title}</span>
          {item.product.size && (
            <span className="text-sm text-gray-400">{item.product.size}</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          {item.quantity > 1 && (
            <span className="text-xs text-gray-400">
              {`€${formatPrice(item.unitPrice)} × ${item.quantity}`}
            </span>
          )}
          <span className="font-bold">{`€${formatPrice(lineTotal)}`}</span>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({ items }: { items: BasketItem[] }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold tracking-wider mb-2">ORDER SUMMARY</h2>
      <div className="flex flex-col max-h-[300px] overflow-y-auto">
        {items.map((item, index) => (
          <OrderSummaryItem key={`${item.product.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const CustomerForm = () => {
  const { cart, setCart } = useContext(CartContext);
  const router = useRouter();
  const [isProceeding, setIsProceeding] = useState<boolean>(false);
  const [notes, setNotes] = useState(cart?.notes ?? "");

  const { data: shippingData, isLoading: shippingLoading } = useQuery({
    queryKey: ["shipping_options"],
    queryFn: () => store.shipping.listOptions(),
  });

  const countries = useMemo(() => {
    if (!shippingData?.shipping_options) return [];
    const countrySet = new Set<CountryCode>();
    shippingData.shipping_options.forEach((option: ShippingOption) => {
      option.countries?.forEach((code) => countrySet.add(code));
    });
    return Array.from(countrySet).map((code) => ({
      label: Countries[code],
      value: code,
    }));
  }, [shippingData]);

  const customerFormSchema = useMemo(
    () =>
      z.object({
        first_name: z.string().min(1, { message: "First name is required" }),
        last_name: z.string().min(1, { message: "Last name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        phone: z.string().regex(/^\+?\d{8,}$/, {
          message:
            "Phone number must be at least 8 digits and may include country code with '+' prefix",
        }),
        city: z.string().min(1, { message: "City is required" }),
        address_1: z.string().min(1, { message: "Address is required" }),
        country_code: z
          .string()
          .min(2, { message: "Country code is required" }),
        postal_code: z
          .string()
          .min(4, { message: "Postal code must be at least 4 digits" }),
        shipping_option: z
          .string()
          .min(1, { message: "Shipping option is required" }),
      }),
    []
  );

  const storedValues = getStoredFormValues();

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    mode: "onTouched",
    defaultValues: {
      first_name:
        storedValues?.first_name ?? cart?.shippingAddress?.firstName ?? "",
      last_name:
        storedValues?.last_name ?? cart?.shippingAddress?.lastName ?? "",
      phone: storedValues?.phone ?? cart?.shippingAddress?.phone ?? "",
      city: storedValues?.city ?? cart?.shippingAddress?.city ?? "",
      address_1:
        storedValues?.address_1 ?? cart?.shippingAddress?.address1 ?? "",
      country_code:
        storedValues?.country_code ?? cart?.shippingAddress?.countryCode ?? "",
      postal_code:
        storedValues?.postal_code ?? cart?.shippingAddress?.postalCode ?? "",
      email: storedValues?.email ?? cart?.email ?? "",
      shipping_option:
        storedValues?.shipping_option ??
        (typeof cart?.shippingOption === "string" ||
        typeof cart?.shippingOption === "number"
          ? String(cart.shippingOption)
          : String(cart?.shippingOption?.id ?? "")),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { watch } = form;
  const countryCode = watch("country_code");

  const initializePayment = async () => {
    setIsProceeding(true);

    try {
      const formValues = form.getValues();

      const address = {
        firstName: formValues.first_name,
        lastName: formValues.last_name,
        address1: formValues.address_1,
        city: formValues.city,
        postalCode: formValues.postal_code,
        countryCode: formValues.country_code,
        phone: formValues.phone,
      };

      await store.cart.update({
        email: formValues.email,
        shippingAddress: address,
        billingAddress: address,
        shippingOption: parseInt(formValues.shipping_option, 10),
        notes,
      });

      const { cart: updatedCart } = await store.cart.retrieve();

      if (
        updatedCart?.stripeClientSecret &&
        updatedCart?.stripePaymentIntentId
      ) {
        setCart(updatedCart);
      } else {
        const paymentData = await store.cart.createPaymentIntent();
        setCart({
          ...updatedCart,
          stripeClientSecret: paymentData.client_secret,
          stripePaymentIntentId: paymentData.payment_intent_id,
        });
      }
    } catch (e: unknown) {
      toast({
        title: "Error with customer registration",
        description: (e as Error).message,
        variant: "destructive",
      });
      router.refresh();
    } finally {
      setIsProceeding(false);
    }
  };

  const shippingOptions = countryCode
    ? shippingData?.shipping_options
        ?.filter((option: ShippingOption) =>
          option.countries?.some(
            (c) => c.toLowerCase() === countryCode.toLowerCase()
          )
        )
        .map((option: ShippingOption) => ({
          label: `${option.name} - €${formatPrice(option.amount)}`,
          value: String(option.id),
        }))
    : [];

  const clientSecret = cart?.stripeClientSecret;

  const isLoading = isProceeding || shippingLoading;

  const isProceedDisabled =
    !cart?.items?.length || Boolean(clientSecret) || !form.formState.isValid;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(initializePayment)}
        className="grid grid-cols-2 gap-4 animate-in fade-in"
      >
        <h2 className="text-xl font-bold tracking-wider col-span-2 mb-2">
          SHIPPING DETAILS
        </h2>

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
                <DropdownPicker
                  options={countries}
                  value={field.value}
                  setValue={field.onChange}
                  title="country"
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
                <Input
                  placeholder="POSTAL CODE *"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                  inputMode="numeric"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <hr className="w-full col-span-2" />

        <FormField
          control={form.control}
          name="shipping_option"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1 h-10">
              <FormControl>
                <DropdownPicker
                  options={shippingOptions ?? []}
                  value={field.value}
                  setValue={field.onChange}
                  title={"shipping"}
                  disabled={!shippingOptions?.length}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormControl>
                <Input
                  placeholder="PHONE"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d+]/g, "");
                    field.onChange(value);
                  }}
                  inputMode="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order notes */}
        <div className="col-span-2 flex flex-col gap-1">
          <textarea
            placeholder="ORDER NOTES (OPTIONAL)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            maxLength={500}
          />
          <span className="text-xs text-gray-500 self-end">
            {notes.length}/500
          </span>
        </div>

        {!clientSecret && (
          <div className="h-12 col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isProceedDisabled}
                className="w-full text-xl tracking-widest h-full"
              >
                PROCEED TO PAYMENT
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};

const CheckoutForm = () => {
  const { cart, setCart, resetCart } = useContext(CartContext);
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const appliedCoupon =
    cart?.coupon && typeof cart.coupon === "object"
      ? (cart.coupon as Coupon)
      : null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setCouponLoading(true);
    try {
      const { cart: updatedCart } = await store.cart.applyCoupon(couponCode);
      // Update PaymentIntent with new total (after discount)
      const paymentData = await store.cart.createPaymentIntent();
      setCart({
        ...updatedCart,
        stripeClientSecret: paymentData.client_secret,
        stripePaymentIntentId: paymentData.payment_intent_id,
      });
      setCouponCode("");
      toast({ title: "Coupon applied successfully" });
    } catch (error) {
      toast({
        title: "Failed to apply coupon",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!cart) return;
    setCouponLoading(true);
    try {
      const { cart: updatedCart } = await store.cart.removeCoupon();
      // Update PaymentIntent with new total (without discount)
      const paymentData = await store.cart.createPaymentIntent();
      setCart({
        ...updatedCart,
        stripeClientSecret: paymentData.client_secret,
        stripePaymentIntentId: paymentData.payment_intent_id,
      });
      toast({ title: "Coupon removed" });
    } catch (error) {
      toast({
        title: "Failed to remove coupon",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const clientSecret = cart?.stripeClientSecret;

    if (!stripe || !elements || !clientSecret || !cart)
      throw new Error("handlePayment() is missing data");

    const card = elements.getElement(CardElement);

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card as StripeCardElement,
        billing_details: {
          name: cart?.shippingAddress?.firstName,
          email: cart?.email,
          phone: cart?.shippingAddress?.phone,
          address: {
            city: cart?.shippingAddress?.city,
            country: cart?.shippingAddress?.countryCode,
            line1: cart?.shippingAddress?.address1,
            postal_code: cart?.shippingAddress?.postalCode,
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

    try {
      const result = await store.cart.complete();

      if (result.type === "cart") {
        // Check if items became unavailable (sold to another customer)
        if ("code" in result && result.code === "ITEMS_UNAVAILABLE") {
          // Redirect to catalogue with param to show toast there
          router.push("/catalogue?items_removed=true");
          return;
        }
        throw new Error(result.error || "There was a problem with the order");
      } else if (result.type === "order" || result.type === "processing") {
        resetCart();
        router.push("/confirmation?status=success");
        return;
      }
    } catch (error: unknown) {
      toast({
        title: "There was a problem with the order",
        description: (error as Error).message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["products"],
      refetchType: "all",
    });
    setIsLoading(false);
  };

  const goBackToCustomerForm = () => {
    setCart({
      ...cart!,
      stripeClientSecret: undefined,
      stripePaymentIntentId: undefined,
    });
  };

  return (
    <div className="h-fit flex flex-col gap-4 animate-in fade-in">
      <Button
        variant={"link"}
        className="p-0 self-start text-xl"
        onClick={goBackToCustomerForm}
      >
        BACK TO DETAILS
      </Button>

      <h2 className="text-xl font-bold tracking-wider">PAYMENT</h2>

      <form
        className="flex flex-col gap-4 flex-1 h-full overflow-y-auto overflow-x-hidden justify-between px-0.5"
        onSubmit={handlePayment}
      >
        <CardElement className="bg-gray-300 p-4" />

        {/* Coupon input */}
        <div className="flex flex-col gap-2">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">COUPON APPLIED</span>
                <span className="font-bold">{appliedCoupon.code}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                disabled={couponLoading}
              >
                {couponLoading ? <Spinner /> : "REMOVE"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 overflow-visible">
              <Input
                placeholder="COUPON CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? <Spinner /> : "APPLY"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="w-full flex justify-between">
              <span className="text-lg font-light text-gray-400">SUBTOTAL</span>
              <span className="text-lg font-light">{`€${formatPrice(cart?.subtotal ?? 0)}`}</span>
            </div>
            {(cart?.discount ?? 0) > 0 && (
              <div className="w-full flex justify-between">
                <span className="text-lg font-light text-green-400">
                  DISCOUNT
                </span>
                <span className="text-lg font-light text-green-400">{`-€${formatPrice(cart?.discount ?? 0)}`}</span>
              </div>
            )}
            <div className="w-full flex justify-between">
              <span className="text-lg font-light text-gray-400">SHIPPING</span>
              <span className="text-lg font-light">{`€${formatPrice(cart?.shippingTotal ?? 0)}`}</span>
            </div>
            <div className="w-full flex justify-between border-t border-gray-600 pt-2">
              <span className="text-2xl font-bold text-gray-400">TOTAL</span>
              <span className="text-2xl font-bold">{`€${formatPrice(cart?.total ?? 0)}`}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full font-bold tracking-widest text-2xl"
            size={"lg"}
            type="submit"
            disabled={!cart?.items?.length || !stripe || !elements}
          >
            {isLoading ? <Spinner /> : "PAY NOW"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function CheckoutContent() {
  const { cart } = useContext(CartContext);
  const router = useRouter();

  const items: BasketItem[] =
    (cart?.items?.filter(
      (item): item is BasketItem =>
        item != null && typeof item.product !== "string"
    ) as BasketItem[]) ?? [];

  const clientSecret = cart?.stripeClientSecret;
  const hasItems = items.length > 0;

  // Redirect to catalogue if cart is empty
  useEffect(() => {
    if (cart && !hasItems) {
      router.push("/catalogue");
    }
  }, [cart, hasItems, router]);

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!hasItems) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-10 animate-in fade-in">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-end mb-10">
          <CutoffText align="right" size="sm">CHECKOUT</CutoffText>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <OrderSummary items={items} />
          </div>

          {/* Forms */}
          <div className="order-1 lg:order-2">
            {clientSecret ? (
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
        </div>
      </div>
    </div>
  );
}
