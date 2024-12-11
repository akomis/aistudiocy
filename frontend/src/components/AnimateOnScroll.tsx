"use client";

import { useIsVisible } from "@/hooks/use-is-visible";
import { ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: string;
}

const AnimateOnScroll = ({
  children,
  className = "",
  animation = "fade-in",
}: AnimateOnScrollProps) => {
  const [ref, isVisible] = useIsVisible();

  return (
    <div
      key={ref.toString()}
      ref={ref as any}
      className={`animate-in ${className} ${
        isVisible ? `animate-${animation}` : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
