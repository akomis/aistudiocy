"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  fallbackHref?: string;
};

export default function BackButton({ fallbackHref = "/" }: Props) {
  const t = useTranslations("Common");
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
      className="flex items-center gap-2 hover:opacity-75 transition-all text-2xl tracking-wide"
    >
      <span>{t("back")}</span>
    </button>
  );
}
