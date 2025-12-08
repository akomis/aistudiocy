"use client";

import { useIsVisible } from "@/hooks/use-is-visible";
import { ReactNode, useState, useEffect } from "react";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
}

const AnimateIn = ({ children, className = "" }: AnimateInProps) => {
  const [ref, isVisible] = useIsVisible({ threshold: 0.1 });
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible, hasBeenVisible]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-opacity duration-500 ${className} ${
        hasBeenVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

export default AnimateIn;
