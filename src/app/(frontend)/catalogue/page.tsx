import Basket from "@/components/Basket"
import Filter from "@/components/Filter"
import HomeButton from "@/components/HomeButton"
import ProductGrid from "@/components/ProductGrid"
import Screen from "@/components/Screen"
import { getPayloadClient } from "@/lib/payload"
import { Category, SiteSettings, LandingPage } from "@/lib/store"

// Use dynamic rendering for pages that need database access
export const dynamic = 'force-dynamic'

export default async function Catalogue() {
  const payload = await getPayloadClient()

  const [categoriesResult, siteSettings, landingPage] = await Promise.all([
    payload.find({
      collection: "categories",
      depth: 2,
      limit: 100,
    }),
    payload.findGlobal({
      slug: "site-settings",
      depth: 2,
    }) as Promise<SiteSettings>,
    payload.findGlobal({
      slug: "landing-page" as "site-settings",
    }) as unknown as Promise<LandingPage>,
  ])

  const categories = categoriesResult.docs as unknown as Category[]
  const socials = landingPage.socials || []

  if (!categories) throw new Error("Couldn't load categories")

  const catalogueStaticImages =
    siteSettings.catalogueImages?.map((item) => ({
      url: item.image?.url || "",
    })) || []

  const emailSocial = socials.find(
    (social) => social.key.toLowerCase() === "email"
  )
  const emailHref = emailSocial?.url || ""

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
  )
}
