"use client";

import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/use-is-mobile";
import { toast } from "@/hooks/use-toast";
import { Product, store } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import FilterContext from "@/providers/filter";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Spinner from "./Spinner";
import { Badge } from "./ui/badge";

type Social = {
  key: string;
  value: string;
  url?: string;
};

type ProductItemProps = {
  product: Product;
};

const ProductItem = ({ product }: ProductItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { cart, setCart } = useContext(CartContext);
  const isMobile = useIsMobile();
  const router = useRouter();

  const lineItemIndex = cart?.items?.findIndex((item) => {
    const productId =
      typeof item.product === "string" ? item.product : item.product?.id;
    return productId === product.id;
  });
  const lineItem =
    lineItemIndex !== undefined && lineItemIndex >= 0
      ? cart?.items?.[lineItemIndex]
      : undefined;

  const add = useMutation({
    mutationKey: ["add", product.id],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.addLineItem(cart?.id as string, product.id, 1);
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const deleteItem = useMutation({
    mutationKey: ["delete", product.id],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.deleteLineItem(
        cart?.id as string,
        lineItemIndex as number
      );
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const thumbnailUrl =
    typeof product.thumbnail === "string"
      ? product.thumbnail
      : product.thumbnail?.url;

  if (!thumbnailUrl) return null;

  const iconStrokeWidth = isMobile ? 2 : 5;
  const price = product.price;
  const isAvailable = product.available !== false && Boolean(price);
  const isInBasket = product.available !== false && Boolean(lineItem);

  const handleClick = () => {
    router.push(`/catalogue/${product.handle}`);
  };

  return (
    <div
      onClick={handleClick}
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
            src={thumbnailUrl}
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
                    onClick={(event) => {
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
            src={thumbnailUrl}
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
    </div>
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
  images: { url: string; alternativeText?: string }[];
  socials: Social[];
};

const IMAGE_SIZE = 3000;
const REFETCH_PRODUCTS_INTERVAL = 1000 * 60 * 2;

export default function ProductGrid({ images, socials }: Props) {
  const { cart, refetchCart } = useContext(CartContext);
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

  const { data: productData, error } = useSuspenseQuery({
    queryKey: ["products", id, cart?.id],
    queryFn: async () => {
      const data = await store.product.list(id ?? undefined);

      const unavailableProducts = data.products.filter(
        (product) => product.available === false
      );

      if (cart && cart.items) {
        for (let i = cart.items.length - 1; i >= 0; i--) {
          const item = cart.items[i];
          const productId =
            typeof item.product === "string" ? item.product : item.product?.id;
          const unavailableProduct = unavailableProducts?.find(
            (product) => product.id === productId
          );

          if (unavailableProduct) {
            try {
              await store.cart.deleteLineItem(cart.id, i);
              toast({
                title: `Product is no longer available and was removed from your cart.`,
              });
            } catch {
              // ignore
            }
          }
        }

        refetchCart();
      }

      return data;
    },
    refetchInterval: REFETCH_PRODUCTS_INTERVAL,
    refetchIntervalInBackground: true,
  });

  if (error) throw new Error("Couldn't load products");

  const products = productData?.products ?? [];

  const firstSet = products.slice(0, 4);
  const intermediateSet = products.slice(4, 12);
  const secondSet = products.slice(12, 14);
  const thirdSet = products.slice(14, 26);
  const fourthSet = products.slice(26);

  const firstImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center w-full">
        {id ? (
          <>
            <p className="text-lg md:text-2xl text-center font-light">
              No products found with the applied filter. Feel free to explore
              more through the categories on top.
            </p>
            <Button
              variant={"outline"}
              className="mx-auto mt-10"
              onClick={() => {
                setId(null);
                router.push("/catalogue");
              }}
            >
              EXPLORE
            </Button>
          </>
        ) : (
          <p className="text-lg md:text-2xl text-center font-light max-w-2xl">
            We currently don&apos;t have any available pieces. Feel free to
            stalk us on{" "}
            <a
              href={
                socials.find((s) => s.key.toLowerCase() === "instagram")?.url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-75 transition-all"
            >
              instagram
            </a>{" "}
            for any updates!
          </p>
        )}
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
                alt={firstImage.alternativeText ?? "catalogue image"}
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
                className="col-span-2 aspect-video max-h-[300px] mt-14 sm:m-0"
                src={secondImage.url}
                alt={secondImage.alternativeText ?? "catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "cover" }}
              />
            )}
            {secondSet.map((product) => (
              <div key={product.id} className="col-span-1 mb-24">
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
                className="col-span-2 lg:col-span-4 aspect-video max-h-[300px] m-0"
                src={thirdImage.url}
                alt={thirdImage.alternativeText ?? "catalogue image"}
                height={IMAGE_SIZE}
                width={IMAGE_SIZE}
                style={{ objectFit: "cover" }}
              />
            )}

            {Boolean(fourthSet.length)
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
          href={socials.find((s) => s.key.toLowerCase() === "email")?.url}
          target="_blank"
          className="text-2xl md:text-4xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
        >
          FEEL FREE TO ASK
        </a>
      </div>
    </>
  );
}
