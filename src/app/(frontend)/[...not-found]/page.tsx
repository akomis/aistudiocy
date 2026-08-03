// https://github.com/vercel/next.js/discussions/50034
// Catch-all route for 404 pages. The app has two root layouts ((frontend) and
// (payload)), so there is no top-level app/not-found.tsx to catch unmatched
// URLs - this route stands in for it.
//
// It calls notFound() rather than rendering the page body inline, so the
// request short-circuits into (frontend)/not-found.tsx (identical UI) instead
// of rendering a full page for scanner traffic.
//
// Known limitation: with two root layouts, Next still answers 200 rather than
// 404 for multi-segment unmatched paths - the same defect the discussion above
// tracks. Getting a real 404 needs a root-level app/not-found.tsx, which has no
// access to the (frontend) layout's styles. Until then the Sentry noise from
// this route is handled by ignoreErrors in sentry.server.config.ts.

import { notFound } from "next/navigation";

export default function NotFoundCatchAll() {
  notFound();
}
