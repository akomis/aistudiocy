"use client";

import { cn } from "@/lib/utils";
import AnimateOnScroll from "./AnimateOnScroll";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Section({ children, className, style }: Props) {
  return (
    <AnimateOnScroll
      animation="fade-in"
      className="duration-1000 transition-all"
    >
      <section className={cn("", className)} style={style}>
        {children}
      </section>
    </AnimateOnScroll>
  );
}
