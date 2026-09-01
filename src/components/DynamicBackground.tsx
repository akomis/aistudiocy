"use client";

import useImagePreloader from "@/hooks/use-image-preloader";
import useIsMobile from "@/hooks/use-is-mobile";
import { Category } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Logo from "./Logo";
import Section from "./Section";

// Wrapper component for CategoryPicker with landing page-specific behavior
type LandingCategoryPickerProps = {
  categories: Category[];
  activeHandle: string | null;
  setCategoryHandle: (handle: string) => void;
  setIsPaused: (paused: boolean) => void;
};

const LandingCategoryPicker = ({
  categories,
  activeHandle,
  setCategoryHandle,
  setIsPaused,
}: LandingCategoryPickerProps) => {
  const router = useRouter();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col gap-1 w-fit text-center">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`text-sm font-black hover:cursor-pointer hover:opacity-80 tracking-[0.3em] text-center w-full ${
              activeHandle === category.handle ? "opacity-70" : ""
            }`}
            onClick={() => router.push(`/catalogue/category/${category.handle}`)}
            onMouseEnter={() => setCategoryHandle(category.handle)}
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  );
};

type Props = {
  data: {
    category: Category;
    desktopUrl?: string;
    mobileUrl?: string;
  }[];
};

const DynamicBackground = ({ data }: Props) => {
  const [categoryHandle, setCategoryHandle] = useState<string | null>(data[0]?.category?.handle ?? null);
  const [isPaused, setIsPaused] = useState(false);

  const isMobileValue = useIsMobile();
  const router = useRouter();

  // During SSR/hydration (when isMobileValue is undefined), default to desktop
  // to ensure consistent rendering between server and initial client render
  const isMobile = isMobileValue ?? false;
  const categories = data.map((e) => e.category);

  const allImageUrls = useMemo(() => {
    return data.flatMap((e) => [e.desktopUrl, e.mobileUrl]);
  }, [data]);

  const imagesLoaded = useImagePreloader(allImageUrls);

  useEffect(() => {
    if (isPaused || !data.length) return;

    const currentCategoryIndex = data.findIndex(
      (e) => e.category.handle === categoryHandle
    );

    const timeout = setTimeout(() => {
      currentCategoryIndex < data.length - 1
        ? setCategoryHandle(data[currentCategoryIndex + 1].category.handle)
        : setCategoryHandle(data[0].category.handle);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [categoryHandle, isPaused, data]);

  if (!data.length || !imagesLoaded) {
    return (
      <Section className="h-[100dvh] flex items-center justify-center p-0">
        <Logo />
      </Section>
    );
  }

  const displayedHeaderUrls = data.find((e) => {
    return e.category.handle === categoryHandle;
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
            alt={categoryHandle ?? "category"}
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
        <Link href="/" onClick={(e) => e.stopPropagation()}>
          <Logo />
        </Link>

        <LandingCategoryPicker
          categories={categories}
          activeHandle={categoryHandle}
          setCategoryHandle={setCategoryHandle}
          setIsPaused={setIsPaused}
        />
      </div>
    </Section>
  );
};

export default DynamicBackground;
