"use client"

import { Category } from "@/lib/store"
import CategoryPicker from "./CategoryPicker"

type Props = {
  categories: Category[]
  activeCategoryHandle?: string | null
}

export default function Filter({ categories, activeCategoryHandle }: Props) {
  return (
    <CategoryPicker
      categories={categories}
      activeHandle={activeCategoryHandle}
    />
  )
}
