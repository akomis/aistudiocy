"use client";

import { StoreProduct } from "@medusajs/types";
import Image from "next/image";
import { useState } from "react";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/lib/utils";

type ProductItemProps = {
  product: StoreProduct;
};

const ProductItem = ({ product }: ProductItemProps) => {
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
        className="hover:cursor-pointer hover:opacity-75 transition-all relative aspect-square duration-500 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          onClick={() => setLightboxPhoto(photos?.[0])}
          src={product.thumbnail}
          alt={product.title}
          fill
          style={{ objectFit: "contain" }}
        />
        {isHovered && (
          <div className="absolute bottom-0 w-full flex items-center justify-between px-4 py-2 animate-in fade-in ease-in">
            <span className="text-xl font-light">{`€${product.variants[0].calculated_price?.calculated_amount}`}</span>
            <Button variant="ghost" className="text-xl text-white">
              <PlusIcon />
            </Button>
          </div>
        )}

        {photos?.length && (
          <Lightbox
            open={Boolean(lightboxPhoto)}
            close={() => setLightboxPhoto(undefined)}
            slides={photos}
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

const SubGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("grid gap-8", className)}>{children}</div>;
};

type Props = {
  products: StoreProduct[];
  images: any[];
};

const IMAGE_SIZE = 3000;

export default function ProductGrid({ products, images }: Props) {
  const firstSet = products.slice(0, 4);
  const secondSet = products.slice(4, 6);
  const thirdSet = products.slice(6, 10);
  const fourthSet = products.slice(10);

  const firstImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];

  return (
    <div>
      <div className="flex flex-col gap-8">
        {firstSet && (
          <SubGrid className="grid-cols-4">
            <SubGrid className="grid-cols-2 col-span-2">
              {firstSet.map((product) => (
                <div key={product.id} className="col-span-1 row-span-1">
                  <ProductItem product={product} />
                </div>
              ))}
            </SubGrid>

            {firstImage && (
              <SubGrid className="col-span-2">
                <Image
                  className="aspect-square h-full"
                  src={firstImage.url}
                  alt={
                    firstImage.alternativeText ?? "ai studio catalogue image"
                  }
                  height={IMAGE_SIZE}
                  width={IMAGE_SIZE}
                  style={{ objectFit: "contain" }}
                />
              </SubGrid>
            )}
          </SubGrid>
        )}

        {secondSet && (
          <SubGrid className="grid-cols-4">
            {secondImage && (
              <Image
                className="col-span-2 h-full"
                src={secondImage.url}
                alt={secondImage.alternativeText ?? "ai studio catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "cover" }}
              />
            )}

            {secondSet.map((product) => (
              <div key={product.id} className="col-span-1">
                <ProductItem product={product} />
              </div>
            ))}
          </SubGrid>
        )}

        {thirdSet && (
          <SubGrid className="grid-cols-4">
            {thirdSet.map((product) => (
              <div key={product.id}>
                <ProductItem product={product} />
              </div>
            ))}

            {thirdImage && (
              <Image
                className="col-span-4 max-h-[400px]"
                src={thirdImage.url}
                alt={thirdImage.alternativeText ?? "ai studio catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "cover" }}
              />
            )}

            {fourthSet &&
              fourthSet.map((product) => (
                <div key={product.id}>
                  <ProductItem product={product} />
                </div>
              ))}
          </SubGrid>
        )}
      </div>
    </div>
  );
}
