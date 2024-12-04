import Filter from "@/components/Filter";
import HomeButton from "@/components/HomeButton";
import ProductGrid from "@/components/ProductGrid";
import Screen from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sdk } from "@/lib/medusa";
import { get } from "@/lib/strapi";
import Link from "next/link";

export default async function Catalogue() {
  const products = (
    await sdk.store.product.list({
      fields: "*variants.calculated_price",
      region_id: "reg_01JE7JJ691K3XF415A25MVP6ZT",
    })
  ).products;
  const categories = (await sdk.store.category.list()).product_categories.map(
    (category) => category.name
  );
  const catalogueStaticImages = (await get("image")).data.Catalogue;
  const socials = (await get("socials")).data;

  if (products === undefined) throw new Error("Couldn't load products");
  if (!categories) throw new Error("Couldn't load categories");

  const noProductsAvailable = products.length === 0;
  const emailHref = socials.find(
    (social: any) => social.Key.toLowerCase() === "email"
  ).URL;

  return (
    <Screen>
      <div className="flex justify-between items-center w-full">
        <HomeButton isIcon />

        {noProductsAvailable ? (
          <Label className="text-center text-xl">
            {
              "We currently don't have any available pieces. We are working to produce more beautiful silver pieces so feel free to follow us on social media."
            }
          </Label>
        ) : (
          <Filter categories={categories} />
        )}

        <Button
          className="font-bold text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all text-white hover:no-underline"
          variant={"link"}
          disabled={noProductsAvailable}
        >
          BASKET
        </Button>
      </div>

      <ProductGrid products={products} images={catalogueStaticImages} />

      <div>
        <Link href="/sizing" target="_blank" className="text-5xl font-bold">
          RING SIZE GUIDE
        </Link>
        <div className="text-xl font-light">
          If you have any questions feel free to{" "}
          <a
            href={emailHref}
            target="_blank"
            className="font-normal hover:cursor-pointer hover:opacity-75 transition-all"
          >
            contact us
          </a>
        </div>
      </div>
    </Screen>
  );
}
