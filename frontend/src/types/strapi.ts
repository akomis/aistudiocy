import { Schema } from "@strapi/strapi";

// Utility type to extract the primitive type from Schema.Attribute.X
type ExtractType<T> = T extends Schema.Attribute.String
  ? string
  : T extends Schema.Attribute.DateTime
    ? Date
    : T extends Schema.Attribute.Relation<any, any>
      ? any // Adjust as necessary
      : T extends Schema.Attribute.Blocks
        ? any // Adjust as necessary
        : never;

// Define a utility type to extract attributes and convert them
export type StrapiAttributes<T> = T extends { attributes: infer A }
  ? {
      [K in keyof A]: ExtractType<A[K]>; // Map over each attribute and apply ExtractType
    }[]
  : never;
