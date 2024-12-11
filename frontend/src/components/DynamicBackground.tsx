"use client";

import { StoreProductCategory } from "@medusajs/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryPicker from "./CategoryPicker";
import Logo from "./Logo";
import Section from "./Section";

type Props = { data: { category: StoreProductCategory; url: string }[] };

const DynamicBackground = ({ data }: Props) => {
  const [categoryId, setCategoryId] = useState(data[0].category.id);

  const router = useRouter();
  const categories = data.map((e) => e.category);

  useEffect(() => {
    const currentCategoryIndex = data.findIndex(
      (e) => e.category.id === categoryId
    );

    setTimeout(() => {
      currentCategoryIndex < data.length - 1
        ? setCategoryId(data[currentCategoryIndex + 1].category.id)
        : setCategoryId(data[0].category.id);
    }, 5000);
  }, [categoryId]);

  const displayedImageUrl = data.find((e) => {
    return e.category.id === categoryId;
  })?.url;

  return (
    <Section className="h-screen flex items-center p-0">
      <div
        key={displayedImageUrl}
        className="absolute h-full w-full  -z-10 animate-in fade-in duration-1000 border-"
      >
        <Image
          src={displayedImageUrl as string}
          alt={categoryId}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div
        className={
          "flex items-center justify-between max-w-[2000px] px-2 mx-auto h-full w-full hover:cursor-pointer "
        }
        onClick={() => {
          router.push("/catalogue");
        }}
      >
        <Logo />

        <CategoryPicker
          categories={categories}
          activeId={categoryId}
          setActive={setCategoryId}
          setOnHover
          navigateOnClick
        />
      </div>
    </Section>
  );
};

export default DynamicBackground;
