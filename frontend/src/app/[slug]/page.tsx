import Block from "@/components/Block";
import Screen from "@/components/Screen";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/strapi";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import HomeButton from "@/components/HomeButton";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const pages = await get("pages");

  const page = pages.data.find((page: any) => page.Key === slug);

  if (!page) {
    notFound();
  }

  const photos = page.Gallery?.map((image: any) => ({
    src: image.url,
    width: image.width,
    height: image.height,
  }));

  return (
    <Screen className="p-20 flex flex-col gap-20">
      <HomeButton />

      <div className="flex flex-col">
        <Label className="text-6xl font-bold">{page.Title}</Label>
        {page.Subtitle && (
          <Label className="text-xl font-thin">{page.Subtitle}</Label>
        )}
      </div>

      <div>
        <Block content={page.Content} />
      </div>

      {photos && <Gallery photos={photos} />}
    </Screen>
  );
}
