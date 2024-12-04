import Filter from "@/components/Filter";
import HomeButton from "@/components/HomeButton";
import ProductGrid from "@/components/ProductGrid";
import Screen from "@/components/Screen";
import { Label } from "@/components/ui/label";
import { sdk } from "@/lib/medusa";

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

  if (!products) throw new Error("Couldn't load products");
  if (!categories) throw new Error("Couldn't load categories");

  return (
    <Screen>
      <div className="flex justify-between items-center w-full">
        <HomeButton isIcon />
        <Filter categories={categories} />
        <Label className="font-bold text-2xl hover:cursor-pointer hover:opacity-75 transform transition-all">
          BASKET
        </Label>
      </div>
      <ProductGrid products={products} />
    </Screen>
  );
}
