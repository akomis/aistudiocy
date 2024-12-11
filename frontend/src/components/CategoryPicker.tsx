"use client";
import { cn } from "@/lib/utils";
import { StoreProductCategory } from "@medusajs/types";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

type Props = {
  activeId: string | number | null;
  categories: StoreProductCategory[];
  setActive:
    | Dispatch<SetStateAction<string | null>>
    | Dispatch<SetStateAction<string>>;
  setOnClick?: boolean;
  onHover?: (id: string) => void;
  onExitHover?: () => void;
  navigateOnClick?: boolean;
};

export default function CategoryPicker({
  activeId,
  categories,
  setActive,
  onHover,
  onExitHover,
  setOnClick = true,
  navigateOnClick,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 w-fit text-center">
      {categories.map((category: StoreProductCategory) => (
        <div
          key={category.id}
          className={cn(
            "text-sm font-semibold hover:cursor-pointer hover:opacity-80 tracking-[0.3em] text-center w-full",
            {
              "opacity-70": activeId === category.id,
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
                    if (category.id === activeId) setActive(null);
                    else setActive(category.id);
                  }
                }
          }
          onMouseEnter={() => {
            if (!onHover) return;
            onHover(category.id);
          }}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
}
