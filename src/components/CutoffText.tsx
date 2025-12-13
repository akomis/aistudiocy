import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  align?: "left" | "right";
  size?: "default" | "sm";
};

const sizeClasses = {
  default: {
    container: "h-[85px] sm:h-[125px]",
    text: "text-6xl sm:text-[9rem]",
  },
  sm: {
    container: "h-[50px] sm:h-[125px]",
    text: "text-5xl sm:text-[9rem]",
  },
};

export default function CutoffText({
  children,
  align = "left",
  size = "default",
}: Props) {
  return (
    <div
      className={cn(
        sizeClasses[size].container,
        "font-black overflow-hidden w-full",
        {
          "text-right": align === "right",
        }
      )}
    >
      <span className={cn(sizeClasses[size].text, "tracking-[10px]")}>
        {children}
      </span>
    </div>
  );
}
