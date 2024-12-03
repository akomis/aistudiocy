import Block from "@/components/Block";
import Screen from "@/components/Screen";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/strapi";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import Link from "next/link";

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

  return (
    <Screen className="p-20 flex flex-col gap-20">
      <Link href="/">
        <Label className="text-xl hover:cursor-pointer hover:text-gray-300 transform transition-all">
          HOME
        </Label>
      </Link>

      <div className="flex flex-col">
        <Label className="text-4xl font-bold">{page.Title}</Label>
        <Label className="text-xl font-thin">{page.Subtitle}</Label>
      </div>

      <div className="">
        <Block content={page.Content} />
      </div>

      <Gallery photos={photos} />
    </Screen>
  );
}
