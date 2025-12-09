"use client"

import { toast, useToast } from "@/hooks/use-toast"
import { Countries, CountryCode } from "@/lib/countries"
import { store, CartItem, Product, ShippingOption } from "@/lib/store"
import { stripePromise } from "@/lib/stripe"
import { formatPrice } from "@/lib/utils"
import { CartContext } from "@/providers/cart"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { StripeCardElement } from "@stripe/stripe-js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import CutoffText from "./CutoffText"
import DropdownPicker from "./DropdownPicker"
import Spinner from "./Spinner"
import { Button } from "./ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface BasketItem extends CartItem {
  product: Product
}

const BasketListItem = ({ item, index }: { item: BasketItem; index: number }) => {
  const { cart, setCart } = useContext(CartContext)
  const [isLoading, setIsLoading] = useState(false)

  const deleteItem = useMutation({
    mutationKey: ["delete", item.product.id],
    mutationFn: async () => {
      setIsLoading(true)
      return store.cart.deleteLineItem(cart?.id as string, index)
    },
    onSuccess: (response) => {
      setCart(response.cart)
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const description = item.product.description
  const thumbnailUrl =
    typeof item.product.thumbnail === "string"
      ? item.product.thumbnail
      : item.product.thumbnail?.url

  return (
    <div className="flex justify-between w-full border border-gray-400 px-4 py-2">
      <div className="aspect-square bg-black min-h-36 min-w-36 max-h-52 max-w-52">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={item.product.title}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
        )}
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
            <div className="text-xl font-light text-end">{`${description}`}</div>
          )}
          <div className="text-2xl font-bold text-end">{`€${formatPrice(item.unitPrice)}`}</div>
        </div>
      </div>
    </div>
  )
}

const BasketList = ({ items }: { items: BasketItem[] }) => {
  return (
    <div className="flex flex-col gap-4 h-fit w-full overflow-y-auto overflow-x-hidden">
      {items.map((item, index) => (
        <BasketListItem key={item.product.id} item={item} index={index} />
      ))}
    </div>
  )
}

const CHECKOUT_FORM_STORAGE_KEY = "checkout_form_values"

export const clearCheckoutFormStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY)
  }
}

const getStoredFormValues = () => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const CustomerForm = () => {
  const [isProceeding, setIsProceeding] = useState<boolean>(false)
  const { cart, setCart, refetchCart } = useContext(CartContext)
  const router = useRouter()

  const { data: shippingData, isLoading: shippingLoading } = useQuery({
    queryKey: ["shipping_options"],
    queryFn: () => store.shipping.listOptions(),
  })

  // Get supported countries from shipping options
  const countries = useMemo(() => {
    if (!shippingData?.shipping_options) return []
    const countrySet = new Set<CountryCode>()
    shippingData.shipping_options.forEach((option: ShippingOption) => {
      option.countries?.forEach((code) => countrySet.add(code))
    })
    return Array.from(countrySet).map((code) => ({
      label: Countries[code],
      value: code,
    }))
  }, [shippingData])

  const customerFormSchema = useMemo(
    () =>
      z.object({
        first_name: z.string().min(1, { message: "First name is required" }),
        last_name: z.string().min(1, { message: "Last name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        phone: z.string().regex(/^\+?\d{1,4}?\d{7}$/, {
          message:
            "Phone number must be at least 8 digits and may include country code with '+' prefix",
        }),
        city: z.string().min(1, { message: "City is required" }),
        address_1: z.string().min(1, { message: "Address is required" }),
        country_code: z.string().min(2, { message: "Country code is required" }),
        postal_code: z
          .string()
          .min(4, { message: "Postal code must be at least 4 digits" }),
        shipping_option: z.string().min(1, { message: "Shipping option is required" }),
      }),
    [],
  )

  const storedValues = getStoredFormValues()

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: storedValues?.first_name ?? cart?.shippingAddress?.firstName ?? "",
      last_name: storedValues?.last_name ?? cart?.shippingAddress?.lastName ?? "",
      phone: storedValues?.phone ?? cart?.shippingAddress?.phone ?? "",
      city: storedValues?.city ?? cart?.shippingAddress?.city ?? "",
      address_1: storedValues?.address_1 ?? cart?.shippingAddress?.address1 ?? "",
      country_code: storedValues?.country_code ?? cart?.shippingAddress?.countryCode ?? "",
      postal_code: storedValues?.postal_code ?? cart?.shippingAddress?.postalCode ?? "",
      email: storedValues?.email ?? cart?.email ?? "",
      shipping_option:
        storedValues?.shipping_option ??
        (typeof cart?.shippingOption === "string" || typeof cart?.shippingOption === "number"
          ? String(cart.shippingOption)
          : String(cart?.shippingOption?.id ?? "")),
    },
  })

  // Save form values to local storage when they change
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [form])

  const { watch } = form
  const countryCode = watch("country_code")

  const initializePayment = async () => {
    setIsProceeding(true)

    try {
      const formValues = form.getValues()

      const address = {
        firstName: formValues.first_name,
        lastName: formValues.last_name,
        address1: formValues.address_1,
        city: formValues.city,
        postalCode: formValues.postal_code,
        countryCode: formValues.country_code,
        phone: formValues.phone,
      }

      // Update cart with customer info
      await store.cart.update(cart?.id as string, {
        email: formValues.email,
        shippingAddress: address,
        billingAddress: address,
        shippingOption: parseInt(formValues.shipping_option, 10),
      })

      // Fetch latest cart state (may have existing payment intent)
      const { cart: updatedCart } = await store.cart.retrieve(cart?.id as string)

      // Only create payment intent if one doesn't exist
      if (updatedCart?.stripeClientSecret && updatedCart?.stripePaymentIntentId) {
        setCart(updatedCart)
      } else {
        const paymentData = await store.cart.createPaymentIntent(cart?.id as string)
        setCart({
          ...updatedCart,
          stripeClientSecret: paymentData.client_secret,
          stripePaymentIntentId: paymentData.payment_intent_id,
        })
      }
    } catch (e: unknown) {
      toast({
        title: "Error with customer registration",
        description: (e as Error).message,
        variant: "destructive",
      })
      router.refresh()
    } finally {
      setIsProceeding(false)
    }
  }

  const shippingOptions = countryCode
    ? shippingData?.shipping_options
        ?.filter((option: ShippingOption) =>
          option.countries?.some((c) => c.toLowerCase() === countryCode.toLowerCase()),
        )
        .map((option: ShippingOption) => ({
          label: `${option.name} - €${formatPrice(option.amount)}`,
          value: String(option.id),
        }))
    : []

  const clientSecret = cart?.stripeClientSecret

  const isLoading = isProceeding || shippingLoading

  const isProceedDisabled =
    !cart?.items?.length || Boolean(clientSecret) || !form.formState.isValid

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(initializePayment)} className="grid grid-cols-2 gap-4 animate-in fade-in">
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
                    const value = e.target.value.replace(/\D/g, "")
                    field.onChange(value)
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
                    const value = e.target.value.replace(/[^\d+]/g, "")
                    field.onChange(value)
                  }}
                  inputMode="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Label className="col-span-2 text-md font-light -my-2">
          * We will ship your order to the closest pickup point based on your address.
        </Label>

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
                PROCEED
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}

const ThankYouView = () => {
  const { resetCart, setBasketOpen, setOrderComplete } = useContext(CartContext)
  const router = useRouter()

  const handleClose = () => {
    setOrderComplete(false)
    resetCart()
    setBasketOpen(false)
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 px-4 text-center animate-in fade-in">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-widest">THANK YOU</h2>
        <p className="text-xl font-light">Your order has been placed successfully.</p>
        <p className="text-lg font-light text-gray-400">
          You will receive a confirmation email shortly.
        </p>
      </div>
      <Button
        onClick={handleClose}
        className="text-xl tracking-widest px-8 py-6"
        variant="outline"
      >
        CONTINUE
      </Button>
    </div>
  )
}

const CheckoutForm = () => {
  const { cart, setCart, setOrderComplete, resetCart, refetchCart } = useContext(CartContext)
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const clientSecret = cart?.stripeClientSecret

    if (!stripe || !elements || !clientSecret || !cart)
      throw new Error("handlePayment() is missing data")

    const card = elements.getElement(CardElement)

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
    })

    if (error) {
      toast({
        title: "Error with payment details",
        description: error.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await store.cart.complete(cart?.id as string)

      if (result.type === "cart") {
        throw new Error(result.error || "There was a problem with the order")
      } else if (result.type === "order") {
        resetCart()
        setOrderComplete(true)
      } else if (result.type === "processing") {
        // Payment successful but order creation is still processing
        // Show success message anyway - user will get email confirmation
        resetCart()
        setOrderComplete(true)
        toast({
          title: "Payment successful",
          description: result.message,
        })
      }
    } catch (error: unknown) {
      toast({
        title: "There was a problem with the order",
        description: (error as Error).message,
        variant: "destructive",
      })
      setIsLoading(false)
      refetchCart()
      return
    }

    await queryClient.invalidateQueries({
      queryKey: ["products"],
      refetchType: "all",
    })
    setIsLoading(false)
  }

  const goBackToCustomerForm = () => {
    setCart({
      ...cart!,
      stripeClientSecret: undefined,
      stripePaymentIntentId: undefined,
    })
  }

  return (
    <div className="h-fit flex flex-col gap-4 animate-in fade-in">
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
              <span className="text-lg font-light text-gray-400">SUBTOTAL</span>
              <span className="text-lg font-light">{`€${formatPrice(cart?.subtotal ?? 0)}`}</span>
            </div>
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
            {isLoading ? <Spinner /> : "CHECKOUT"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function Basket() {
  const { cart, setCart, basketOpen, setBasketOpen, orderComplete, setOrderComplete } =
    useContext(CartContext)

  const items: BasketItem[] =
    (cart?.items?.filter(
      (item): item is BasketItem =>
        item != null && typeof item.product !== "string",
    ) as BasketItem[]) ?? []

  const clientSecret = cart?.stripeClientSecret

  const hasItemsInBasket = Boolean(items.length)

  // Always show customer form when basket opens (clear any existing payment session)
  useEffect(() => {
    if (basketOpen && clientSecret && cart) {
      setCart({
        ...cart,
        stripeClientSecret: undefined,
        stripePaymentIntentId: undefined,
      })
    }
  }, [basketOpen])

  const handleOpenChange = (open: boolean) => {
    setBasketOpen(open)
    if (!open && orderComplete) {
      setOrderComplete(false)
    }
  }

  return (
    <Drawer open={basketOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger
        className="font-black text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all hover:no-underline disabled:opacity-50 disabled:cursor-wait tracking-widest"
        disabled={!cart}
      >
        BASKET
      </DrawerTrigger>
      <DrawerContent className="p-4 max-w-[700px] border-b-0 ml-auto sm:mr-4 bg-black/85 h-full max-h-[90vh] overflow-hidden">
        <DrawerHeader>
          <DrawerTitle className="-mb-4 mx-auto">
            <CutoffText>{orderComplete ? "ORDER" : "BASKET"}</CutoffText>
          </DrawerTitle>
        </DrawerHeader>

        {orderComplete ? (
          <ThankYouView />
        ) : (
          <div className="flex flex-col flex-1 gap-10 justify-between overflow-y-auto">
            <div className="flex">
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
        )}
      </DrawerContent>
    </Drawer>
  )
}
