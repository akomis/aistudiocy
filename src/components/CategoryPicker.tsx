"use client"
import { cn } from "@/lib/utils"
import { Category } from "@/lib/store"
import { useRouter } from "next/navigation"

type Props = {
  activeHandle?: string | null
  categories: Category[]
  onHover?: (id: string) => void
  onExitHover?: () => void
}

export default function CategoryPicker({
  activeHandle,
  categories,
  onHover,
  onExitHover,
}: Props) {
  const router = useRouter()

  const handleClick = (category: Category) => {
    // If clicking the active category, navigate back to all catalogue
    if (activeHandle === category.handle) {
      router.push('/catalogue')
    } else {
      router.push(`/catalogue/category/${category.handle}`)
    }
  }

  return (
    <div className="flex flex-col gap-1 w-fit text-center">
      {categories.map((category: Category) => (
        <div
          key={category.id}
          className={cn(
            "text-sm font-black hover:cursor-pointer hover:opacity-80 tracking-[0.3em] text-center w-full",
            {
              "opacity-70": activeHandle === category.handle,
            },
          )}
          onClick={() => handleClick(category)}
          onMouseEnter={() => {
            if (!onHover) return
            onHover(category.id)
          }}
          onMouseLeave={onExitHover}
        >
          {category.name}
        </div>
      ))}
    </div>
  )
}
