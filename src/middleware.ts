import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except the Payload admin and API, Next internals, the Sentry
  // tunnel route (`tunnelRoute` in next.config.mjs - a middleware hit here
  // silently breaks client error reporting) and files with an extension.
  matcher: ["/((?!api|admin|_next|_vercel|monitoring|.*\\..*).*)"],
};
