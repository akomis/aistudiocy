import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  align?: "left" | "right";
};

export default function CutoffText({ children, align = "left" }: Props) {
  return (
    <div
      className={cn("h-[62px] sm:h-[125px] font-black overflow-hidden w-screen", {
        "text-right": align === "right",
      })}
    >
      <span className="text-5xl sm:text-[9rem] tracking-[10px]">
        {children}
      </span>
    </div>
  );
}
