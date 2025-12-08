"use client";

import { cn } from "@/lib/utils";
import AnimateIn from "./AnimateIn";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Section({ children, className, style }: Props) {
  return (
    <AnimateIn className="duration-1000">
      <section className={cn("", className)} style={style}>
        {children}
      </section>
    </AnimateIn>
  );
}
