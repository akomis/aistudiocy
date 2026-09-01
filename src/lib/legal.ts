/**
 * Version of the General Conditions currently published on the site. Shown on
 * the terms page and carried in the order confirmation email, which clause 2.4
 * requires to supply the accepted conditions on a durable medium.
 *
 * Update this together with the text in src/lib/pages and the PDFs in
 * public/legal whenever counsel issues a new version.
 */
export const TERMS_VERSION = "20.07.2026";

export const PRIVACY_VERSION = "07.08.2026";

export const LEGAL_PDFS = {
  en: "legal/general-conditions-en.pdf",
  el: "legal/general-conditions-el.pdf",
} as const;
