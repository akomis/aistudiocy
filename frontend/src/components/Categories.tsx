"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StoreProductCategory } from "@medusajs/types";

type Props = {
  active: string | null;
  categories: StoreProductCategory[];
  setActive: (id: string | null) => void;
  enableChangeOnHover?: boolean;
};

export default function Categories({
  active,
  categories,
  setActive,
  enableChangeOnHover,
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-fit">
      {categories.map((category: StoreProductCategory) => (
        <div key={category.id} className="flex items-center text-right">
          <Label
            className={cn(
              "text-sm font-semibold text-white hover:cursor-pointer hover:opacity-80 tracking-widest",
              {
                "opacity-70": active === category.id,
              }
            )}
            onClick={() => setActive(category.id)}
            onMouseEnter={() => enableChangeOnHover && setActive(category.id)}
          >
            {category.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
