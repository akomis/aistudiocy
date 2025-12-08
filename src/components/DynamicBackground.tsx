"use client";

import useIsMobile from "@/hooks/use-is-mobile";
import { Category } from "@/lib/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryPicker from "./CategoryPicker";
import Logo from "./Logo";
import Section from "./Section";

type Props = {
  data: {
    category: Category;
    desktopUrl?: string;
    mobileUrl?: string;
  }[];
};

const DynamicBackground = ({ data }: Props) => {
  const [categoryId, setCategoryId] = useState<string | null>(data[0]?.category?.id ?? null);
  const [isPaused, setIsPaused] = useState(false);

  const isMobile = useIsMobile();
  const router = useRouter();
  const categories = data.map((e) => e.category);

  useEffect(() => {
    if (isPaused || !data.length) return;

    const currentCategoryIndex = data.findIndex(
      (e) => e.category.id === categoryId
    );

    const timeout = setTimeout(() => {
      currentCategoryIndex < data.length - 1
        ? setCategoryId(data[currentCategoryIndex + 1].category.id)
        : setCategoryId(data[0].category.id);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [categoryId, isPaused, data]);

  if (!data.length) {
    return (
      <Section className="h-[100dvh] flex items-center justify-center p-0">
        <Logo />
      </Section>
    );
  }

  const displayedHeaderUrls = data.find((e) => {
    return e.category.id === categoryId;
  });

  const displayedImageUrl = isMobile
    ? displayedHeaderUrls?.mobileUrl
    : displayedHeaderUrls?.desktopUrl;

  return (
    <Section className="h-[100dvh] flex items-center p-0">
      {displayedImageUrl && (
        <div
          key={displayedImageUrl}
          className="absolute h-full w-full -z-10 animate-in fade-in duration-1000"
        >
          <Image
            src={displayedImageUrl}
            alt={categoryId ?? "category"}
            fill
            style={{ objectFit: "cover" }}
            quality={100}
            priority
          />
        </div>
      )}
      <div
        className={
          "flex items-center justify-between max-w-[2000px] px-2 md:px-10 mx-auto h-full w-full hover:cursor-pointer"
        }
        onClick={() => {
          router.push("/catalogue");
        }}
      >
        <Logo />

        <CategoryPicker
          categories={categories}
          activeId={categoryId}
          setActive={(categoryId: string | null) => {
            setCategoryId(categoryId as string);
          }}
          onHover={(categoryId: string) => {
            setCategoryId(categoryId);
            setIsPaused(true);
          }}
          onExitHover={() => {
            setIsPaused(false);
          }}
          navigateOnClick
          setOnClick={false}
        />
      </div>
    </Section>
  );
};

export default DynamicBackground;
