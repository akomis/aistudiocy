"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  /**
   * When set, BACK always navigates here and ignores history. Use it where
   * "back" means a fixed place in the site rather than wherever the visitor
   * happened to come from.
   */
  href?: string;
  fallbackHref?: string;
};

const STYLE =
  "flex items-center gap-2 hover:opacity-75 transition-all text-2xl tracking-wide";

export default function BackButton({ href, fallbackHref = "/" }: Props) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className={STYLE}>
        <span>BACK</span>
      </Link>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button onClick={handleBack} className={STYLE}>
      <span>BACK</span>
    </button>
  );
}
