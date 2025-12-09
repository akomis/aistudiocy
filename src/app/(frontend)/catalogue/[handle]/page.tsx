"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Basket from "@/components/Basket"
import HomeButton from "@/components/HomeButton"
import Screen from "@/components/Screen"
import Spinner from "@/components/Spinner"
import useIsMobile from "@/hooks/use-is-mobile"
import { store, Product, Media } from "@/lib/store"
import { cn, formatPrice } from "@/lib/utils"
import { CartContext } from "@/providers/cart"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useContext, useState } from "react"

export default function ProductPage() {
  const params = useParams()
  const handle = params.handle as string
  const router = useRouter()

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => store.product.get(handle),
  })

  if (isLoading) {
    return (
      <Screen className="px-5">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner />
        </div>
      </Screen>
    )
  }

  if (error || !data?.product) {
    return (
      <Screen className="px-5">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black pb-8 pt-10">
            <HomeButton isIcon />
            <Basket />
          </div>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-lg">Product not found</p>
            <Button variant="outline" onClick={() => router.push("/catalogue")}>
              Back to catalogue
            </Button>
          </div>
        </div>
      </Screen>
    )
  }

  return <ProductDetails product={data.product} />
}

function ProductDetails({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { cart, setCart } = useContext(CartContext)
  const isMobile = useIsMobile()
  const router = useRouter()

  const lineItemIndex = cart?.items?.findIndex((item) => {
    const productId = typeof item.product === "string" ? item.product : item.product?.id
    return productId === product.id
  })
  const isInBasket = lineItemIndex !== undefined && lineItemIndex >= 0

  const add = useMutation({
    mutationKey: ["add", product.id],
    mutationFn: async () => {
      setIsLoading(true)
      return store.cart.addLineItem(cart?.id as string, product.id, 1)
    },
    onSuccess: (response) => {
      setCart(response.cart)
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const deleteItem = useMutation({
    mutationKey: ["delete", product.id],
    mutationFn: async () => {
      setIsLoading(true)
      return store.cart.deleteLineItem(cart?.id as string, lineItemIndex as number)
    },
    onSuccess: (response) => {
      setCart(response.cart)
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const thumbnailUrl = typeof product.thumbnail === "string"
    ? product.thumbnail
    : product.thumbnail?.url

  const allImages: { url: string; alt: string }[] = []

  if (thumbnailUrl) {
    allImages.push({ url: thumbnailUrl, alt: product.title })
  }

  product.images?.forEach((img) => {
    const imgUrl = typeof img.image === "string" ? img.image : (img.image as Media)?.url
    if (imgUrl && imgUrl !== thumbnailUrl) {
      allImages.push({ url: imgUrl, alt: product.title })
    }
  })

  const isAvailable = product.available !== false && Boolean(product.price)
  const iconStrokeWidth = isMobile ? 2 : 3

  return (
    <Screen className="px-5">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black pb-8 pt-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/catalogue")}
              className="hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <HomeButton isIcon />
          </div>
          <Basket />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 pb-20">
          {/* Images Section */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full">
              {allImages[selectedImageIndex] && (
                <Image
                  src={allImages[selectedImageIndex].url}
                  alt={allImages[selectedImageIndex].alt}
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              )}
              {!isAvailable && (
                <Badge
                  className="absolute bottom-4 left-4 text-gray-300"
                  variant="outline"
                >
                  SOLD
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative w-20 h-20 flex-shrink-0 border transition-all",
                      selectedImageIndex === index
                        ? "border-white"
                        : "border-white/20 hover:border-white/50"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex-1 flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <h1 className="text-2xl lg:text-4xl font-bold tracking-wide">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-gray-400 text-base lg:text-lg">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-2xl lg:text-3xl font-bold">
                €{formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  €{formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {isAvailable ? (
              <Button
                variant={isInBasket ? "outline" : "default"}
                size="lg"
                className={cn(
                  "w-full lg:w-auto lg:px-12 text-base font-medium",
                  isInBasket && "border-white/30"
                )}
                onClick={() => (isInBasket ? deleteItem.mutate() : add.mutate())}
                disabled={!cart || isLoading}
              >
                {isLoading ? (
                  <Spinner />
                ) : isInBasket ? (
                  <>
                    <Minus strokeWidth={iconStrokeWidth} className="mr-2" />
                    Remove from basket
                  </>
                ) : (
                  <>
                    <Plus strokeWidth={iconStrokeWidth} className="mr-2" />
                    Add to basket
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="lg" disabled className="w-full lg:w-auto">
                Sold out
              </Button>
            )}

            <Link
              href="/sizing"
              target="_blank"
              className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Ring size guide
            </Link>
          </div>
        </div>
      </div>
    </Screen>
  )
}
