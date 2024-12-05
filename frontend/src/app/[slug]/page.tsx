import Block from "@/components/Block";
import Screen from "@/components/Screen";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/strapi";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import HomeButton from "@/components/HomeButton";
import Title from "@/components/Title";

export async function generateStaticParams() {
  const pages = (await get("pages")).data;

  return pages.map((page: any) => ({
    slug: page.Key,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const pages = (await get("pages")).data;

  const page = pages.find((page: any) => page.Key === slug);

  if (!page) {
    notFound();
  }

  const photos = page.Gallery?.map((image: any) => ({
    src: image.url,
    width: image.width,
    height: image.height,
  }));

  return (
    <Screen>
      <HomeButton />

      <div className="flex flex-col">
        <Title>{page.Title}</Title>
        {page.Subtitle && (
          <Label className="text-xl font-light">{page.Subtitle}</Label>
        )}
      </div>

      <div>
        <Block content={page.Content} />
      </div>

      {photos && <Gallery photos={photos} />}
    </Screen>
  );
}
