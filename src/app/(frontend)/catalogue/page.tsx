import Basket from "@/components/Basket"
import Filter from "@/components/Filter"
import HomeButton from "@/components/HomeButton"
import ProductGrid from "@/components/ProductGrid"
import Screen from "@/components/Screen"
import { getPayloadClient } from "@/lib/payload"
import { Category, Catalogue as CatalogueType, LandingPage } from "@/lib/store"

// Use dynamic rendering for pages that need database access
export const dynamic = 'force-dynamic'

export default async function Catalogue() {
  const payload = await getPayloadClient()

  const [categoriesResult, catalogue, landingPage] = await Promise.all([
    payload.find({
      collection: "categories",
      depth: 2,
      limit: 100,
    }),
    payload.findGlobal({
      slug: "catalogue",
      depth: 2,
    }) as Promise<CatalogueType>,
    payload.findGlobal({
      slug: "landing-page" as "catalogue",
    }) as unknown as Promise<LandingPage>,
  ])

  const categories = categoriesResult.docs as unknown as Category[]
  const socials = landingPage.socials || []

  if (!categories) throw new Error("Couldn't load categories")

  const catalogueStaticImages =
    catalogue.showcaseImages?.map((item) => ({
      url: item.image?.url || "",
    })) || []

  return (
    <Screen className="px-5 animate-in fade-in">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center w-full sticky top-0 z-10 bg-black pb-16 pt-10">
          <HomeButton isIcon />

          <div className="ml-10">
            <Filter categories={categories} />
          </div>

          <Basket />
        </div>

        <ProductGrid images={catalogueStaticImages} socials={socials} />
      </div>
    </Screen>
  )
}
