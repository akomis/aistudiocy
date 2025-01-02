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

  const isAvailable = Boolean(variant.inventory_quantity);
  const isInBasket = Boolean(lineItem);

  return (
    product.thumbnail && (
      <div
        onClick={(event: any) => {
          event.stopPropagation();
          setIsLightboxOpen(true);
        }}
        className="relative aspect-square hover:cursor-pointer animate-in fade-in transition-all duration-700 ease-in-out"
      >
        {isAvailable ? (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn("hover:opacity-85 duration-700 transition-all", {
              "border border-white": isInBasket,
            })}
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              style={{ objectFit: "contain" }}
            />
            {(isInBasket || isHovered || isMobile || isLoading) && (
              <div className="absolute bottom-0 h-full w-full flex flex-col items-center justify-between px-1 animate-in fade-in ease-in">
                <span>{product.description}</span>
                <div className="flex w-full justify-between">
                  <span className="text-2xl">{`€${variant.calculated_price?.calculated_amount}`}</span>
                  <Button
                    variant="link"
                    className="font-regular tracking-normal text-white p-0"
                    onClick={(event: any) => {
                      event.stopPropagation();
                      isInBasket ? deleteItem.mutate() : add.mutate();
                    }}
                    size={"sm"}
                    disabled={!cart}
                  >
                    {isLoading ? (
                      <div className="mr-4">
                        <Spinner />
                      </div>
                    ) : !isInBasket ? (
                      "ADD"
                    ) : (
                      "REMOVE"
                    )}
                  </Button>
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
            />
            <Badge
              className="text-thin text-gray-300 absolute bottom-2 left-2"
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
              root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .8)" },
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
                      {isLoading ? <Spinner /> : !isInBasket ? "ADD" : "REMOVE"}
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
  return <div className={cn("grid gap-8", className)}>{children}</div>;
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
  const secondSet = filteredProducts.slice(4, 6);
  const thirdSet = filteredProducts.slice(6, 10);
  const fourthSet = filteredProducts.slice(10);
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

      <div className="mt-40 flex flex-col gap-20">
        <Link
          href="/sizing"
          target="_blank"
          className="text-3xl md:text-5xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
        >
          RING SIZE GUIDE
        </Link>
        <a
          href={emailHref}
          target="_blank"
          className="text-3xl md:text-5xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
        >
          FEEL FREE TO ASK
        </a>
      </div>
    </div>
  );
}
