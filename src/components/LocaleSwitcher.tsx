"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * Switches locale while keeping the visitor on the same page. next-intl also
 * writes NEXT_LOCALE, so the choice sticks on later visits.
 */
export default function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const other = routing.locales.find((candidate) => candidate !== locale);

  if (!other) return null;

  return (
    <button
      type="button"
      // Without a `pathnames` mapping, usePathname already returns the
      // locale-stripped path with its dynamic segments resolved, so it can be
      // handed straight back with the other locale.
      onClick={() => router.replace(pathname, { locale: other })}
      className={cn("hover:opacity-70 transition-all duration-500", className)}
    >
      {t("switchLanguage")}
    </button>
  );
}
