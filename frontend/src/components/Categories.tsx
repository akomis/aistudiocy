"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  activeIndex: number;
  categories: any[];
  setIndex: (index: number) => void;
};

export default function Categories({
  activeIndex,
  categories,
  setIndex,
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-24">
      {categories.map((category: any) => (
        <div key={category} className="flex items-center text-right">
          <Label
            className={cn(
              "text-sm font-semibold text-white hover:cursor-pointer hover:opacity-80 tracking-widest",
              {
                "opacity-70": activeIndex === categories.indexOf(category),
              }
            )}
            onMouseEnter={() => setIndex(categories.indexOf(category))}
          >
            {category}
          </Label>
        </div>
      ))}
    </div>
  );
}
