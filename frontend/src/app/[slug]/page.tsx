import Block from "@/components/Block";
import Screen from "@/components/Screen";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/strapi";
import { notFound } from "next/navigation";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";

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

  const photos = page.Gallery.map((image: any) => ({
    src: image.url,
    width: image.width,
    height: image.height,
  }));

  console.log(page);

  return (
    <Screen className="p-20 flex flex-col gap-20">
      <div className="flex flex-col">
        <Label className="text-4xl">{page.Title}</Label>
        <Label className="text-xl font-thin">{page.Subtitle}</Label>
      </div>

      <div>
        <Block content={page.Content} />
      </div>

      <MasonryPhotoAlbum photos={photos} />
    </Screen>
  );
}
