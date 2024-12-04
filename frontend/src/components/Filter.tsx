"use client";

import { useState } from "react";
import Categories from "./Categories";

type Props = {
  categories: any[];
};

export default function Filter({ categories }: Props) {
  const [index, setIndex] = useState(0);

  return (
    <Categories
      categories={categories}
      activeIndex={index}
      setIndex={setIndex}
    />
  );
}
