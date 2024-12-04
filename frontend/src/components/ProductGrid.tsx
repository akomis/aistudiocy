"use client";

import { StoreProduct } from "@medusajs/types";
import Image from "next/image";
import { useState } from "react";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import "yet-another-react-lightbox/styles.css";

type Props = {
  products: StoreProduct[];
};

const ProductItem = ({ product }: { product: StoreProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<SlideImage | undefined>(
    undefined
  );

  if (!product.variants) return null;

  const photos = product.images?.map((image) => ({
    key: image.id,
    label: image.id,
    alt: image.id,
    src: image.url,
  }));

  return (
    product.thumbnail && (
      <div
        className="hover:cursor-pointer hover:opacity-75 transition-all relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          onClick={() => setLightboxPhoto(photos?.[0])}
          src={product.thumbnail}
          alt={product.title}
          width={288}
          height={288}
          style={{ objectFit: "contain" }}
        ></Image>
        {isHovered && (
          <div className="absolute bottom-0 w-full flex items-center justify-between px-4 py-2">
            <span className="font-thin text-xl">{`€${product.variants[0].calculated_price?.calculated_amount}`}</span>
            <Button variant="ghost" className="font-thin text-xl text-white">
              <PlusIcon />
            </Button>
          </div>
        )}

        {photos?.length && (
          <Lightbox
            open={Boolean(lightboxPhoto)}
            close={() => setLightboxPhoto(undefined)}
            slides={
              lightboxPhoto
                ? [
                    lightboxPhoto,
                    ...photos.filter((photo) => photo !== lightboxPhoto),
                  ]
                : undefined
            }
            carousel={{ finite: true }}
            styles={{ root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .8)" } }}
            controller={{
              closeOnBackdropClick: true,
              closeOnPullUp: true,
              closeOnPullDown: true,
            }}
          />
        )}
      </div>
    )
  );
};

export default function ProductGrid({ products }: Props) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-8">
        {products.map((product) => (
          <div className="h-72 w-72" key={product.id}>
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
