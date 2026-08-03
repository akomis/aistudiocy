"use client";

import AddToCartButton from "@/components/AddToCartButton";
import BackButton from "@/components/BackButton";
import Basket from "@/components/Basket";
import RingSizeGuide from "@/components/RingSizeGuide";
import Screen from "@/components/Screen";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Category, Media, Product } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";

export default function ProductDetails({ product }: { product: Product }) {
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
          <BackButton fallbackHref="/catalogue" />
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
                        className="relative aspect-[3/4] w-full cursor-pointer"
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
            <div className="flex flex-col gap-1">
              <h1 className="text-base lg:text-lg text-muted-foreground tracking-wide">
                {product.title}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-3xl lg:text-4xl font-semibold">
                  €{formatPrice(product.price)}
                </span>
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      €{formatPrice(product.compareAtPrice)}
                    </span>
                  )}
              </div>
            </div>

            {product.size && <p className="text-gray-300">{product.size}</p>}

            <div className="text-gray-300 text-sm space-y-1">
              {product.description && (
                <p className="text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              )}

              {isFingerCategory && (
                <p>
                  For your convenience, please let us know your size to adjust
                  it for you.
                </p>
              )}
              <p>Handmade, silver 925.</p>
              <p>Please, allow 5 to 15 days for delivery.</p>
              <p>Made in Cyprus.</p>
            </div>

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
