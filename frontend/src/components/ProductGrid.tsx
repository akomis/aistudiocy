"use client";

import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/use-is-mobile";
import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { cn, formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import FilterContext from "@/providers/filter";
import { StoreCart, StoreProduct, StoreProductVariant } from "@medusajs/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Spinner from "./Spinner";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type ProductItemProps = {
  product: StoreProduct;
};

const ProductItem = ({ product }: ProductItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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
    label: image.rank,
    alt: image.url,
    src: image.url,
  }));

  const iconStrokeWidth = isMobile ? 2 : 5;
  const price = variant.calculated_price?.calculated_amount as number;
  const isAvailable = Boolean(variant.inventory_quantity) && Boolean(price);
  const isInBasket = Boolean(lineItem);

  return (
    product.thumbnail && (
      <div
        onClick={(event: any) => {
          event.stopPropagation();
          setIsLightboxOpen(true);
        }}
        className={cn(
          "hover:opacity-85 duration-700 transition-all relative aspect-square hover:cursor-pointer animate-in fade-in ease-in-out ",
          {
            "border border-white/30": isInBasket,
          }
        )}
      >
        {isAvailable ? (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              style={{ objectFit: "contain" }}
            />
            {(isInBasket || isHovered || isMobile || isLoading) && (
              <div>
                <div
                  className={cn(
                    "absolute h-full w-full flex flex-col items-center justify-end ",
                    { "-bottom-10": isMobile, "bottom-0 pl-4 p-2": !isMobile }
                  )}
                >
                  <div className="flex w-full justify-between items-center animate-in slide-in-from-bottom duration-500 ease-out">
                    <span className="text-sm font-bold sm:text-xl tracking-wide">{`€${formatPrice(price)}`}</span>
                    <Button
                      variant="outline"
                      className="font-bold bg-black/80 border-0"
                      onClick={(event: any) => {
                        event.stopPropagation();
                        isInBasket ? deleteItem.mutate() : add.mutate();
                      }}
                      size={"sm"}
                      disabled={!cart}
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : !isInBasket ? (
                        <Plus strokeWidth={iconStrokeWidth} />
                      ) : (
                        <Minus strokeWidth={iconStrokeWidth} />
                      )}
                    </Button>
                  </div>
                </div>
                <div
                  className={cn(
                    "bg-black/80 w-full text-center text-xs sm:text-lg absolute animate-in fade-in duration-500 transition-none ",
                    {
                      "bg-white/30 text-black": isInBasket,
                      "-bottom-14 text-start bg-transparent text-gray-400":
                        isMobile,
                      "top-2": !isMobile,
                    }
                  )}
                >
                  <div className="animate-in slide-in-from-left duration-500 ease-out font-bold text-xs sm:text-sm">
                    {product.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              style={{ objectFit: "contain" }}
              className="opacity-70"
            />
            <Badge
              className={cn(
                "text-thin text-xs sm:text-sm text-gray-300 absolute left-5",
                {
                  "-bottom-10": isMobile,
                  "bottom-3 ": !isMobile,
                }
              )}
              variant={"outline"}
            >
              SOLD
            </Badge>
          </div>
        )}

        {photos?.length && (
          <Lightbox
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            slides={photos}
            carousel={{ finite: true }}
            styles={{
              root: {
                "--yarl__color_backdrop": "rgba(0, 0, 0, .9)",
              },
              slide: {
                width: "60vw",
                height: "60vh",
                margin: "auto",
              },
            }}
            controller={{
              closeOnBackdropClick: true,
              closeOnPullUp: true,
              closeOnPullDown: true,
            }}
            render={{
              slideFooter: () => (
                <div className="flex flex-col gap-4 items-center fixed bottom-10 left-1/2 -translate-x-1/2">
                  <Badge
                    variant={"default"}
                    className="bg-black text-lg text-white flex flex-col sm:flex-row"
                  >
                    {product.description}
                  </Badge>
                  {isAvailable && (
                    <Button
                      variant="outline"
                      className="text-white font-regular tracking-normal"
                      onClick={(e) => {
                        e.stopPropagation();
                        isInBasket ? deleteItem.mutate() : add.mutate();
                      }}
                      disabled={!cart}
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : !isInBasket ? (
                        <Plus strokeWidth={iconStrokeWidth} />
                      ) : (
                        <Minus strokeWidth={iconStrokeWidth} />
                      )}
                    </Button>
                  )}
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
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-24 sm:gap-8",
        className
      )}
    >
      {children}
    </div>
  );
};

type Props = {
  products: StoreProduct[];
  images: any[];
  emailHref: string;
};

const IMAGE_SIZE = 3000;

export default function ProductGrid({ products, images, emailHref }: Props) {
  const { cart } = useContext(CartContext);
  const { id, setId } = useContext(FilterContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setId(searchParams.get("category"));
  }, []);

  useEffect(() => {
    if (id) {
      const params = new URLSearchParams(searchParams);
      params.set("category", id);
      router.push(`?${params.toString()}`);
    }
  }, [id]);

  const { data: filteredProductsData, isLoading } = useQuery({
    queryKey: ["filteredProducts", id],
    queryFn: () =>
      sdk.store.product.list({
        fields: "*variants.calculated_price,+variants.inventory_quantity",
        region_id: REGION_ID,
        category_id: id as string,
      }),
    enabled: Boolean(id),
  });

  const filteredProducts = filteredProductsData?.products ?? products;

  const firstSet = filteredProducts.slice(0, 4);
  const intermediateSet = filteredProducts.slice(4, 12);
  const secondSet = filteredProducts.slice(12, 14);
  const thirdSet = filteredProducts.slice(14, 26);
  const fourthSet = filteredProducts.slice(26);

  const firstImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];

  if (isLoading || !cart) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col mx-auto px-10">
        <Label className="text-lg md:text-2xl text-center font-light">
          No products found with the applied filter. Feel free to explore more
          through the categories on top.
        </Label>
        <Button
          variant={"outline"}
          className="mx-auto mt-10"
          onClick={() => setId(null)}
        >
          EXPLORE
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {firstSet.length ? (
          <SubGrid>
            <SubGrid className="col-span-2 lg:grid-cols-2">
              {firstSet.map((product) => (
                <div key={product.id} className="col-span-1">
                  <ProductItem product={product} />
                </div>
              ))}
            </SubGrid>

            {firstImage && (
              <Image
                className="aspect-square col-span-2"
                src={firstImage.url}
                alt={firstImage.alternativeText ?? "ai studio catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "contain" }}
              />
            )}
          </SubGrid>
        ) : null}

        {intermediateSet.length ? (
          <SubGrid>
            {intermediateSet.map((product) => (
              <div key={product.id} className="col-span-1">
                <ProductItem product={product} />
              </div>
            ))}
          </SubGrid>
        ) : null}

        {secondSet.length ? (
          <SubGrid>
            {secondImage && (
              <Image
                className="col-span-2 mt-24 sm:m-0 sm:h-full"
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
          <SubGrid>
            {thirdSet.map((product) => (
              <div key={product.id} className="col-span-1">
                <ProductItem product={product} />
              </div>
            ))}

            {thirdImage && (
              <Image
                className="col-span-2 lg:col-span-4 aspect-video mt-10 sm:m-0"
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
      <div className="mt-40 flex flex-col gap-10 sm:gap-16">
        <Link
          href="/sizing"
          target="_blank"
          className="text-2xl md:text-4xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
        >
          RING SIZE GUIDE
        </Link>
        <a
          href={emailHref}
          target="_blank"
          className="text-2xl md:text-4xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
        >
          FEEL FREE TO ASK
        </a>
      </div>
    </>
  );
}
