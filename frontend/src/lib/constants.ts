export const REGION_ID = process.env.NEXT_PUBLIC_REGION_ID;

export const PHONE_REGEX = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export const PAYMENT_PROVIDER_ID = "pp_stripe_stripe";
