import Link from "next/link"

export default function RingSizeGuide() {
  return (
    <Link
      href="/sizing"
      target="_blank"
      className="text-2xl md:text-4xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
    >
      RING SIZE GUIDE
    </Link>
  )
}
