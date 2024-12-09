"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StoreProductCategory } from "@medusajs/types";
import { useRouter } from "next/navigation";

type Props = {
  active: string | number | null;
  categories: StoreProductCategory[];
  setActive: (id: any) => void;
  setOnClick?: boolean;
  setOnHover?: boolean;
  navigateOnClick?: boolean;
};

export default function CategoryPicker({
  active,
  categories,
  setActive,
  setOnClick = true,
  setOnHover,
  navigateOnClick,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 w-fit text-center">
      {categories.map((category: StoreProductCategory) => (
        <Label
          key={category.id}
          className={cn(
            "text-sm font-semibold hover:cursor-pointer hover:opacity-80 tracking-[0.3em] text-center w-full",
            {
              "opacity-70": active === category.id,
            }
          )}
          onClick={
            navigateOnClick
              ? (e: any) => {
                  e.stopPropagation();
                  router.push(`/catalogue?category=${category.id}`);
                }
              : () => {
                  if (setOnClick) {
                    if (category.id === active) setActive(null);
                    else setActive(category.id);
                  }
                }
          }
          onMouseEnter={() => {
            if (setOnHover) setActive(category.id);
          }}
        >
          {category.name}
        </Label>
      ))}
    </div>
  );
}
