import * as React from "react";

const MOBILE_BREAKPOINT = 640;

/**
 * Hook to detect if the current viewport is mobile-sized.
 *
 * IMPORTANT: Returns `undefined` during SSR and initial hydration to prevent
 * hydration mismatches. Components using this hook should handle the undefined
 * case (typically by rendering a neutral/desktop layout during SSR).
 *
 * After hydration, returns `true` for mobile viewports, `false` for desktop.
 */
export default function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return undefined during SSR/initial hydration to avoid hydration mismatch
  // Components should handle this by rendering a consistent initial state
  return isMobile;
}
