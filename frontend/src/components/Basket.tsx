import { StoreProduct } from "@medusajs/types";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { MinusIcon } from "lucide-react";
import Image from "next/image";

type Props = {
  noProductsAvailable?: boolean;
  products: StoreProduct[];
};

const BasketGrid = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4 max-h-[80vh] md:max-h-[50vh] overflow-y-auto     ">
      {products.map((product) => (
        <div key={product.id} className="relative aspect-square ">
          <Image
            src={product.thumbnail as string}
            alt={product.title}
            width={144}
            height={144}
            style={{ objectFit: "contain" }}
          />
          <div className="absolute bottom-0 w-full flex items-center justify-between px-4 py-2 animate-in fade-in ease-in">
            <span className="text-xl font-light">{`€${product?.variants?.[0].calculated_price?.calculated_amount}`}</span>
            <Button variant="ghost" className="text-xl text-white">
              <MinusIcon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Basket({ noProductsAvailable, products }: Props) {
  return (
    <Drawer>
      <DrawerTrigger
        className="font-bold text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all hover:no-underline p-0"
        disabled={noProductsAvailable}
      >
        BASKET
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <div className="h-[80px] overflow-hidden">
            <DrawerTitle className="tracking-widest text-8xl">
              BASKET
            </DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex gap-10">
          <BasketGrid products={products} />

          <hr className="h-96 w-1 bg-[#111111] my-auto rounded-full border-0" />
        </div>

        <DrawerFooter className="flex items-end justify-center">
          <Button variant="outline" className="w-fit">
            Proceed
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
