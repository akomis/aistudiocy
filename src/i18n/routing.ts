import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el"],
  defaultLocale: "en",

  // English keeps the URLs it already had (/catalogue, /terms); Greek lives
  // under /el. Nothing existing moves, so no redirects and no lost SEO.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
