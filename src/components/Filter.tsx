"use client"

import FilterContext from "@/providers/filter"
import { Category } from "@/lib/store"
import { useContext } from "react"
import CategoryPicker from "./CategoryPicker"

type Props = {
  categories: Category[]
}

export default function Filter({ categories }: Props) {
  const { id, setId } = useContext(FilterContext)

  return (
    <CategoryPicker categories={categories} activeId={id} setActive={setId} />
  )
}
