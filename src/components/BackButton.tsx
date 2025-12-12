"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
};

export default function BackButton({ fallbackHref = "/" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 hover:opacity-75 transition-all text-xl tracking-wide"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>BACK</span>
    </button>
  );
}
