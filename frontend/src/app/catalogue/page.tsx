import Basket from "@/components/Basket";
import Filter from "@/components/Filter";
import HomeButton from "@/components/HomeButton";
import ProductGrid from "@/components/ProductGrid";
import Screen from "@/components/Screen";
import { REGION_ID } from "@/lib/constants";
import { sdk } from "@/lib/medusa";
import { get } from "@/lib/strapi";

export default async function Catalogue() {
  const products = (
    await sdk.store.product.list({
      fields: "*variants.calculated_price,+variants.inventory_quantity",
      region_id: REGION_ID,
    })
  ).products;

  const categories = (await sdk.store.category.list()).product_categories;
  const catalogueStaticImages = (await get("image")).data.Catalogue;
  const socials = (await get("socials")).data;

  if (products === undefined) throw new Error("Couldn't load products");
  if (!categories) throw new Error("Couldn't load categories");

  const noProductsAvailable = products.length === 0;
  const emailHref = socials.find(
    (social: any) => social.Key.toLowerCase() === "email"
  ).URL;
  const instagram = socials.find(
    (social: any) => social.Key.toLowerCase() === "instagram"
  );

  return (
    <Screen className="px-5">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black/60 py-4">
          <HomeButton isIcon />

          {noProductsAvailable ? (
            <div className="text-center text-xl">
              {`We currently don't have any available pieces. We are working to produce more beautiful silver pieces so feel free to follow us on social media `}
              <a
                href={instagram.URL}
                className="hover:opacity-75 transition-all"
              >{`@${instagram.Value}`}</a>
            </div>
          ) : (
            <Filter categories={categories} />
          )}

          <Basket />
        </div>

        <ProductGrid
          products={products}
          images={catalogueStaticImages}
          emailHref={emailHref}
        />
      </div>
    </Screen>
  );
}
