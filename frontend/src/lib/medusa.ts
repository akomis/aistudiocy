import Medusa from "@medusajs/js-sdk";

if (!process.env.NEXT_PUBLIC_MEDUSA_URL) {
  throw new Error("process.env.NEXT_PUBLIC_MEDUSA_URL is not defined..");
}

if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  throw new Error(
    "process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not defined."
  );
}

export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});
