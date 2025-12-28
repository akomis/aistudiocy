"use client";

import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/use-is-mobile";
import { toast } from "@/hooks/use-toast";
import { Product, store } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { CartContext } from "@/providers/cart";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import RingSizeGuide from "./RingSizeGuide";
import Spinner from "./Spinner";
import { Badge } from "./ui/badge";

const SCROLL_POSITION_KEY = "catalogue-scroll-position";

const saveScrollPosition = () => {
  sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
};

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
  if (saved) {
    window.scrollTo(0, parseInt(saved, 10));
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
  }
};

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

  const { cart, setCart, setBasketOpen } = useContext(CartContext);
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
      return store.cart.addLineItem(product.id, 1);
    },
    onSuccess: (response) => {
      setCart(response.cart);
      setIsLoading(false);
      setBasketOpen(true);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const deleteItem = useMutation({
    mutationKey: ["delete", product.id],
    mutationFn: async () => {
      setIsLoading(true);
      return store.cart.deleteLineItem(lineItemIndex as number);
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
  const inventory = product.inventory ?? 1;
  const isAvailable = inventory > 0 && Boolean(price);
  const isInBasket = inventory > 0 && Boolean(lineItem);

  const handleClick = () => {
    saveScrollPosition();
    router.push(`/catalogue/${product.handle}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "hover:opacity-85 duration-700 transition-all hover:cursor-pointer animate-in fade-in ease-in-out",
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
          <div className="relative aspect-square">
            <Image
              src={thumbnailUrl}
              alt={product.title}
              fill
              style={{ objectFit: "cover" }}
            />
            {/* Desktop overlay */}
            {!isMobile && (isInBasket || isHovered || isLoading) && (
              <div className="absolute bottom-0 left-0 right-0 p-2 pl-4">
                <div className="flex w-full justify-between items-center animate-in slide-in-from-bottom duration-500 ease-out">
                  <span className="text-xl font-bold tracking-wide">{`€${formatPrice(price)}`}</span>
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
            )}
          </div>
          {/* Mobile controls - in flow below image */}
          {isMobile && (
            <div className="flex w-full justify-between items-center pl-1">
              <span className="text-sm font-bold tracking-wide">{`€${formatPrice(price)}`}</span>
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
          )}
        </div>
      ) : (
        <div>
          <div className="relative aspect-square">
            <Image
              src={thumbnailUrl}
              alt={product.title}
              fill
              style={{ objectFit: "cover" }}
              className="opacity-70"
            />
            {/* Desktop SOLD badge */}
            {!isMobile && (
              <Badge
                className="text-thin text-sm text-gray-300 absolute left-5 bottom-3"
                variant={"outline"}
              >
                SOLD
              </Badge>
            )}
          </div>
          {/* Mobile SOLD badge - in flow */}
          {isMobile && (
            <Badge
              className="text-thin text-xs text-gray-300 mt-2"
              variant={"outline"}
            >
              SOLD
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("pb-5 md:pb-8 lg:pb-10", className)}>{children}</div>
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
        "grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 lg:gap-10",
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
  initialProducts?: Product[];
  categoryHandle?: string;
};

const IMAGE_SIZE = 3000;
const REFETCH_PRODUCTS_INTERVAL = 1000 * 60 * 2;

export default function ProductGrid({
  images,
  socials,
  initialProducts,
  categoryHandle,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Show toast if redirected here due to sold items
  useEffect(() => {
    if (searchParams.get("items_removed") === "true") {
      toast({
        title: "Some items are no longer available",
        description: "Items that have been sold were removed from your cart.",
        variant: "destructive",
      });
      // Clean up the URL param
      const params = new URLSearchParams(searchParams);
      params.delete("items_removed");
      const newUrl = params.toString() ? `?${params.toString()}` : "/catalogue";
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  useLayoutEffect(() => {
    restoreScrollPosition();
  }, []);

  const { data: productData, error } = useSuspenseQuery({
    queryKey: ["products", categoryHandle],
    queryFn: async () => {
      return store.product.list(categoryHandle ?? undefined);
    },
    // Use server-fetched products as initial data when no category filter
    // This eliminates the extra API call on initial page load
    initialData:
      !categoryHandle && initialProducts
        ? { products: initialProducts }
        : undefined,
    refetchInterval: REFETCH_PRODUCTS_INTERVAL,
    refetchIntervalInBackground: true,
  });

  if (error) throw new Error("Couldn't load products");

  const products = productData?.products ?? [];

  const firstSet = products.slice(0, 4);
  const intermediateSet = products.slice(4, 12);
  const secondSet = products.slice(12, 16);
  const thirdSet = products.slice(16, 28);
  const fourthSet = products.slice(28);

  const firstImage = images[0];
  const secondImage = images[1];
  const thirdImage = images[2];

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center w-full">
        {categoryHandle ? (
          <>
            <p className="text-lg md:text-2xl text-center font-light">
              No products found with the applied filter. Feel free to explore
              more through the categories on top.
            </p>
            <Button
              variant={"outline"}
              className="mx-auto mt-10"
              onClick={() => {
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
      <div className="flex flex-col">
        {firstSet.length ? (
          <Container>
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
                  className="aspect-square col-span-2 self-end"
                  src={firstImage.url}
                  alt={firstImage.alternativeText ?? "catalogue image"}
                  height={IMAGE_SIZE}
                  width={IMAGE_SIZE}
                  style={{ objectFit: "cover" }}
                />
              )}
            </SubGrid>
          </Container>
        ) : null}

        {intermediateSet.length ? (
          <Container className="mb-2">
            <SubGrid>
              {intermediateSet.map((product) => (
                <div key={product.id} className="col-span-1">
                  <ProductItem product={product} />
                </div>
              ))}
            </SubGrid>
          </Container>
        ) : null}

        {secondSet.length ? (
          <Container>
            <SubGrid>
              {secondImage && (
                <Image
                  className="aspect-square col-span-2"
                  src={secondImage.url}
                  alt={secondImage.alternativeText ?? "catalogue image"}
                  height={IMAGE_SIZE}
                  width={IMAGE_SIZE}
                  style={{ objectFit: "cover" }}
                />
              )}
              <SubGrid className="col-span-2 lg:grid-cols-2">
                {secondSet.map((product) => (
                  <div key={product.id} className="col-span-1">
                    <ProductItem product={product} />
                  </div>
                ))}
              </SubGrid>
            </SubGrid>
          </Container>
        ) : null}

        {thirdSet.length ? (
          <Container>
            <SubGrid>
              <SubGrid className="col-span-2 lg:col-span-4">
                {thirdSet.map((product) => (
                  <div key={product.id} className="col-span-1">
                    <ProductItem product={product} />
                  </div>
                ))}
              </SubGrid>

              {thirdImage && (
                <Image
                  className="aspect-video col-span-2 lg:col-span-4 self-end"
                  src={thirdImage.url}
                  alt={thirdImage.alternativeText ?? "catalogue image"}
                  height={IMAGE_SIZE}
                  width={IMAGE_SIZE}
                  style={{ objectFit: "cover" }}
                />
              )}

              {Boolean(fourthSet.length) && (
                <SubGrid className="col-span-2 lg:col-span-4">
                  {fourthSet.map((product) => (
                    <div key={product.id} className="col-span-1">
                      <ProductItem product={product} />
                    </div>
                  ))}
                </SubGrid>
              )}
            </SubGrid>
          </Container>
        ) : null}
      </div>
      <div className="mt-40 flex flex-col">
        <RingSizeGuide />
      </div>
    </>
  );
}
