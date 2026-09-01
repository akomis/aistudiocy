"use client";

import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useCallback, useEffect, useState } from "react";

const GA_ID = "G-6NSNH6LYWE";

const COOKIE_NAME = "cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
const INITIAL_DELAY_MS = 3000;

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
  // `null` while we have not read the cookie yet - nothing renders and, more
  // importantly, Analytics stays unloaded until consent is known.
  const [consent, setConsent] = useState<Consent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);

    // Let the landing animation play out before the banner slides in. Reopening
    // from the footer link is deliberate, so that path stays instant.
    const timer =
      stored === null
        ? window.setTimeout(() => setIsOpen(true), INITIAL_DELAY_MS)
        : undefined;

    const reopen = () => setIsOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
    };
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
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 z-50 w-auto max-w-[calc(100vw-2rem)] border border-white/20 bg-black/95 p-5 shadow-lg backdrop-blur duration-500 animate-in fade-in slide-in-from-bottom-4 sm:left-auto sm:bottom-10 sm:right-6 sm:w-96"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-6 text-gray-300">
              We use technical cookies that keep the site working, and analytics
              cookies that help us understand how it is used. Analytics cookies
              are only set if you accept.{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 text-foreground"
              >
                Read our Privacy Notice
              </Link>
            </p>

            <div className="flex shrink-0 justify-end gap-3">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="border border-input px-4 py-2 text-sm transition-opacity hover:opacity-70"
              >
                REJECT
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="bg-white px-4 py-2 text-sm text-black transition-opacity hover:opacity-70"
              >
                ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
