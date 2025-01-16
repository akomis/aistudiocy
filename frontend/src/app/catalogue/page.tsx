import Basket from "@/components/Basket";
import Filter from "@/components/Filter";
import HomeButton from "@/components/HomeButton";
import ProductGrid from "@/components/ProductGrid";
import Screen from "@/components/Screen";
import { sdk } from "@/lib/medusa";
import { get } from "@/lib/strapi";

export default async function Catalogue() {
  const categories = (await sdk.store.category.list()).product_categories;
  const catalogueStaticImages = (await get("image")).data.Catalogue;
  const socials = (await get("socials")).data;

  if (!categories) throw new Error("Couldn't load categories");

  const emailHref = socials.find(
    (social: any) => social.Key.toLowerCase() === "email"
  ).URL;

  return (
    <Screen className="px-5">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black pb-16 pt-10">
          <HomeButton isIcon />

          <div className="ml-10">
            <Filter categories={categories} />
          </div>

          <Basket />
        </div>

        <ProductGrid images={catalogueStaticImages} emailHref={emailHref} />
      </div>
    </Screen>
  );
}
