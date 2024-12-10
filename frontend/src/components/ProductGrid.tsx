"use client";

import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/use-is-mobile";
import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { cn } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import FilterContext from "@/providers/filter";
import { StoreCart, StoreProduct, StoreProductVariant } from "@medusajs/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Spinner from "./Spinner";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type ProductItemProps = {
  product: StoreProduct;
};

const ProductItem = ({ product }: ProductItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<SlideImage | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const { cart, setCart } = useContext(CartContext);
  const isMobile = useIsMobile();

  const variant = product.variants?.[0] as StoreProductVariant;
  const lineItem = cart?.items?.find((item) => item?.variant_id === variant.id);

  const add = useMutation({
    mutationKey: ["add", variant.id],
    mutationFn: () => {
      setIsLoading(true);
      return sdk.store.cart.createLineItem(cart?.id as string, {
        variant_id: variant.id as string,
        quantity: 1,
      });
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
  });

  const deleteItem = useMutation({
    mutationKey: ["delete", variant.id],
    mutationFn: () => {
      setIsLoading(true);
      return sdk.store.cart.deleteLineItem(
        cart?.id as string,
        lineItem?.id as string
      );
    },
    onSuccess: (response) => {
      setCart(response.parent as StoreCart);
      setIsLoading(false);
    },
  });

  if (!variant) return null;

  const photos = product.images?.map((image) => ({
    key: image.id,
    label: image.id,
    alt: image.id,
    src: image.url,
  }));

  const isAvailable = Boolean(variant.inventory_quantity);
  const isInBasket = Boolean(lineItem);

  return (
    product.thumbnail && (
      <div className="relative aspect-square hover:cursor-pointer transition-all duration-500 ease-in-out">
        {isAvailable ? (
          <div
            className={cn("hover:opacity-75", {
              "border-[1px] border-white": isInBasket,
            })}
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
            {(isInBasket || isHovered || isMobile || isLoading) && (
              <div className="absolute bottom-0 w-full flex items-center justify-between px-4 py-2 animate-in fade-in ease-in">
                <span className="text-xl font-light">{`€${variant.calculated_price?.calculated_amount}`}</span>
                <Button
                  variant="ghost"
                  className="text-xl text-white"
                  onClick={() => {
                    isInBasket ? deleteItem.mutate() : add.mutate();
                  }}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : !isInBasket ? (
                    <PlusIcon />
                  ) : (
                    <MinusIcon />
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Image
              onClick={() => setLightboxPhoto(photos?.[0])}
              src={product.thumbnail}
              alt={product.title}
              fill
              style={{ objectFit: "contain" }}
            />
            <Badge
              className="text-thin text-gray-300 absolute bottom-4 left-4"
              variant={"outline"}
            >
              UNAVAILABLE
            </Badge>
          </div>
        )}

        {photos?.length && (
          <Lightbox
            open={Boolean(lightboxPhoto)}
            close={() => setLightboxPhoto(undefined)}
            slides={photos}
            carousel={{ finite: false }}
            styles={{
              root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .8)" },
            }}
            controller={{
              closeOnBackdropClick: true,
              closeOnPullUp: true,
              closeOnPullDown: true,
            }}
            render={{
              slideFooter: () => (
                <div className="flex flex-col  gap-4 items-center fixed bottom-10 left-1/2 -translate-x-1/2">
                  <div className="font-thin flex flex-col sm:flex-row ">
                    {variant.width && (
                      <Badge variant="outline" className="font-light">
                        WIDTH: {variant.width} mm
                      </Badge>
                    )}
                    {variant.height && (
                      <Badge variant="outline" className="font-light">
                        HEIGHT: {variant.height} mm
                      </Badge>
                    )}
                    {variant.length && (
                      <Badge variant="outline" className="font-light">
                        LENGTH: {variant.length} mm
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-xl text-white border-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      isInBasket ? deleteItem.mutate() : add.mutate();
                    }}
                  >
                    {isLoading ? (
                      <Spinner />
                    ) : !isInBasket ? (
                      <PlusIcon />
                    ) : (
                      <MinusIcon />
                    )}
                  </Button>
                </div>
              ),
            }}
          ></Lightbox>
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
  emailHref: string;
};

const IMAGE_SIZE = 3000;

export default function ProductGrid({ products, images, emailHref }: Props) {
  const { id, setId } = useContext(FilterContext);

  const searchParams = useSearchParams();

  useEffect(() => {
    setId(searchParams.get("category"));
  }, []);

  const { data: filteredProductsData, isLoading } = useQuery({
    queryKey: ["filteredProducts", id],
    queryFn: () =>
      sdk.store.product.list({
        fields: "*variants.calculated_price",
        region_id: REGION_ID,
        category_id: id as string,
      }),
    enabled: Boolean(id),
  });

  const filteredProducts = filteredProductsData?.products ?? products;

  const firstSet = filteredProducts.slice(0, 4);
  const secondSet = filteredProducts.slice(4, 6);
  const thirdSet = filteredProducts.slice(6, 10);
  const fourthSet = filteredProducts.slice(10);
  const firstImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col mx-auto">
        <Label className="text-2xl text-center font-light">
          No products found with the applied filter.
        </Label>
        <Label className="text-2xl text-center font-light">
          Feel free to explore more categories through the categories on top.
        </Label>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col gap-8">
        {firstSet.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <SubGrid className="grid-cols-1 sm:grid-cols-2 col-span-2 ">
              {firstSet.map((product) => (
                <div key={product.id} className="col-span-1">
                  <ProductItem product={product} />
                </div>
              ))}
            </SubGrid>

            {firstImage && (
              <Image
                className="aspect-square h-full col-span-4 md:col-span-2"
                src={firstImage.url}
                alt={firstImage.alternativeText ?? "ai studio catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
        ) : null}

        {secondSet.length ? (
          <SubGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {secondImage && (
              <Image
                className="col-span-2 h-full hidden lg:block"
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
        ) : null}

        {thirdSet.length ? (
          <SubGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ">
            {thirdSet.map((product) => (
              <div key={product.id} className="col-span-1">
                <ProductItem product={product} />
              </div>
            ))}

            {thirdImage && (
              <Image
                className="col-span-1 sm:col-span-2 lg:col-span-4 max-h-[400px]"
                src={thirdImage.url}
                alt={thirdImage.alternativeText ?? "ai studio catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "cover" }}
              />
            )}

            {fourthSet.length
              ? fourthSet.map((product) => (
                  <div key={product.id}>
                    <ProductItem product={product} />
                  </div>
                ))
              : null}
          </SubGrid>
        ) : null}
      </div>

      <div className="mt-40">
        <Link
          href="/sizing"
          target="_blank"
          className="text-3xl md:text-5xl font-bold"
        >
          RING SIZE GUIDE
        </Link>
        <div className="text-md md:text-xl font-light">
          If you have any questions feel free to{" "}
          <a
            href={emailHref}
            target="_blank"
            className="font-normal hover:cursor-pointer hover:opacity-75 transition-all"
          >
            contact us
          </a>
        </div>
      </div>
    </div>
  );
}
