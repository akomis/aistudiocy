"use client";

import { useState } from "react";
import Section from "./Section";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import CategoryPicker from "./CategoryPicker";
import { StoreProductCategory } from "@medusajs/types";

type Props = { data: { category: StoreProductCategory; url: string }[] };

const DynamicBackground = ({ data }: Props) => {
  const [categoryId, setCategoryId] = useState(data[0].category.id);
  const router = useRouter();
  const categories = data.map((e) => e.category);

  const displayedImageUrl = data.find((e) => {
    return e.category.id === categoryId;
  })?.url;

  return (
    <Section
      className="h-screen flex items-center px-14"
      style={{
        backgroundImage: `url(${displayedImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={
          "flex items-center justify-between h-full w-full hover:cursor-pointer "
        }
        onClick={() => {
          router.push("/catalogue");
        }}
      >
        <Logo />

        <CategoryPicker
          categories={categories}
          active={categoryId}
          setActive={setCategoryId}
          setOnHover
          navigateOnClick
        />
      </div>
    </Section>
  );
};

export default DynamicBackground;
