// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production, matching sentry.server.config.ts.
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://ec274f6c76f33524ceccd9436378c9c6@o4510566655524864.ingest.de.sentry.io/4510566658408528",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    integrations: [
      // Drops errors whose stack frames are *entirely* outside our own bundle.
      // Most of what this site sees is injected script from in-app browsers
      // (Instagram's native bridge) and mobile extensions - those have zero
      // frames in our code. Errors that touch _next/static chunks still come
      // through, which matters: real bugs surface there.
      //
      // `filterKeys` must match `applicationKey` in next.config.mjs. A mismatch
      // drops everything, so re-verify after changing either.
      Sentry.thirdPartyErrorFilterIntegration({
        filterKeys: ["fosjewels"],
        behaviour: "drop-error-if-exclusively-contains-third-party-frames",
      }),
    ],

    ignoreErrors: [
      // Instagram / Facebook in-app browser native bridge failing on its own.
      "window.webkit.messageHandlers",
      // Benign browser noise with no actionable cause.
      "ResizeObserver loop",
      "Non-Error promise rejection captured",
      // User navigated away or lost connectivity mid-request.
      "Failed to fetch",
      "Load failed",
      "NetworkError when attempting to fetch resource",
      "AbortError",
      // Stale page submitting into a new deployment - handled as a reload
      // prompt in (frontend)/error.tsx.
      "Failed to find Server Action",
    ],

    denyUrls: [
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      /^safari-(web-)?extension:\/\//,
    ],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
