"use client";

import { Link } from "@/i18n/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const GA_ID = "G-6NSNH6LYWE";

const COOKIE_NAME = "cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

type Consent = "granted" | "denied";

function readConsent(): Consent | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=(granted|denied)`),
  );

  return (match?.[1] as Consent | undefined) ?? null;
}

function writeConsent(consent: Consent) {
  document.cookie = `${COOKIE_NAME}=${consent}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * Opens the consent banner again from anywhere on the page. Used by the
 * "Cookie Settings" link the Privacy Notice promises.
 */
export const COOKIE_SETTINGS_EVENT = "cookie-settings:open";

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

export default function CookieConsent() {
  const t = useTranslations("Cookies");

  // `null` while we have not read the cookie yet - nothing renders and, more
  // importantly, Analytics stays unloaded until consent is known.
  const [consent, setConsent] = useState<Consent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setIsOpen(stored === null);

    const reopen = () => setIsOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);

    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const decide = useCallback((next: Consent) => {
    writeConsent(next);
    setConsent(next);
    setIsOpen(false);
  }, []);

  return (
    <>
      {consent === "granted" && <GoogleAnalytics gaId={GA_ID} />}

      {isOpen && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-black/95 px-5 py-5 backdrop-blur sm:px-10"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-gray-300">
              {t("description")}{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 text-foreground"
              >
                {t("privacyLink")}
              </Link>
            </p>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="border border-input px-4 py-2 text-sm transition-opacity hover:opacity-70"
              >
                {t("reject")}
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="bg-white px-4 py-2 text-sm text-black transition-opacity hover:opacity-70"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
