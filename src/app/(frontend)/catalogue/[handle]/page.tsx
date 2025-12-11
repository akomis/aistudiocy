"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Basket from "@/components/Basket";
import HomeButton from "@/components/HomeButton";
import RingSizeGuide from "@/components/RingSizeGuide";
import Screen from "@/components/Screen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Category, Media, Product, store } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const router = useRouter();

  const { data, error } = useSuspenseQuery({
    queryKey: ["product", handle],
    queryFn: () => store.product.get(handle),
  });

  if (error || !data?.product) {
    return (
      <Screen className="px-5 animate-in fade-in">
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
    );
  }

  return <ProductDetails product={data.product} />;
}

function ProductDetails({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const thumbnailUrl =
    typeof product.thumbnail === "string"
      ? product.thumbnail
      : product.thumbnail?.url;

  const allImages: { url: string; alt: string }[] = [];

  if (thumbnailUrl) {
    allImages.push({ url: thumbnailUrl, alt: product.title });
  }

  product.images?.forEach((img) => {
    const imgUrl =
      typeof img.image === "string" ? img.image : (img.image as Media)?.url;
    if (imgUrl && imgUrl !== thumbnailUrl) {
      allImages.push({ url: imgUrl, alt: product.title });
    }
  });

  const inventory = product.inventory ?? 1;
  const isAvailable = inventory > 0 && Boolean(product.price);

  // Sync carousel with selected index
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setSelectedImageIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // When thumbnail is clicked, scroll carousel to that index
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  const category =
    typeof product.category === "string"
      ? null
      : (product.category as Category);
  const isFingerCategory = category?.handle === "finger";

  return (
    <Screen className="px-5 animate-in fade-in">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black pb-8 pt-10">
          <HomeButton isIcon />
          <Basket />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 pb-20">
          {/* Images Section */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Main Image Carousel */}
            <div className="relative">
              <Carousel
                setApi={setCarouselApi}
                className="w-full"
                opts={{ loop: false }}
              >
                <CarouselContent>
                  {allImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div
                        className="relative aspect-square w-full cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt}
                          fill
                          style={{ objectFit: "cover" }}
                          priority={index === 0}
                          draggable={false}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
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

            <div className="flex items-center gap-4">
              <span className="text-2xl lg:text-3xl font-bold">
                €{formatPrice(product.price)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    €{formatPrice(product.compareAtPrice)}
                  </span>
                )}
            </div>

            {product.description && (
              <p className="text-gray-300 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {isAvailable ? (
              <AddToCartButton
                productId={product.id}
                openBasketOnAdd
                maxQuantity={inventory}
              />
            ) : (
              <Button variant="outline" size="lg" disabled>
                SOLD
              </Button>
            )}
          </div>
        </div>

        {isFingerCategory && (
          <div className="pb-20">
            <RingSizeGuide />
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedImageIndex}
        slides={allImages.map((img) => ({ src: img.url, alt: img.alt }))}
        on={{
          view: ({ index }) => setSelectedImageIndex(index),
        }}
      />
    </Screen>
  );
}
