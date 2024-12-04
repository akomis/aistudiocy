"use client";

import { useState } from "react";
import Section from "./Section";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import Categories from "./Categories";

type Props = { data: any[] };

const DynamicBackground = ({ data }: Props) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();

  const images = data.map((image: any) => image.Image?.url);
  const categories = data.map((category: any) => category.Category);

  return (
    <Section
      className="h-screen flex items-center px-14"
      style={{
        backgroundImage: `url(${images[slideIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={"flex justify-between w-full hover:cursor-pointer"}
        onClick={() => {
          router.push("/catalogue");
        }}
      >
        <Logo />

        <Categories
          categories={categories}
          activeIndex={slideIndex}
          setIndex={setSlideIndex}
        />
      </div>
    </Section>
  );
};

export default DynamicBackground;
