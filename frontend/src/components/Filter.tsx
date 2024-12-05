"use client";

import { useContext } from "react";
import CategoryPicker from "./CategoryPicker";
import FilterContext from "@/providers/filter";
import { StoreProductCategory } from "@medusajs/types";

type Props = {
  categories: StoreProductCategory[];
};

export default function Filter({ categories }: Props) {
  const { id, setId } = useContext(FilterContext);

  return (
    <CategoryPicker categories={categories} active={id} setActive={setId} />
  );
}
