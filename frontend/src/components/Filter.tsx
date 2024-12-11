"use client";

import FilterContext from "@/providers/filter";
import { StoreProductCategory } from "@medusajs/types";
import { useContext } from "react";
import CategoryPicker from "./CategoryPicker";

type Props = {
  categories: StoreProductCategory[];
};

export default function Filter({ categories }: Props) {
  const { id, setId } = useContext(FilterContext);

  return (
    <CategoryPicker categories={categories} activeId={id} setActive={setId} />
  );
}
