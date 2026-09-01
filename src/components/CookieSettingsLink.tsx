"use client";

import { useTranslations } from "next-intl";
import { openCookieSettings } from "./CookieConsent";

export default function CookieSettingsLink({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("Cookies");

  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {t("settings")}
    </button>
  );
}
