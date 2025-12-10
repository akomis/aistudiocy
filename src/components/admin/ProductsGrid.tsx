'use client'

import { useEffect, useState } from 'react'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import type { Product, Category, Media } from '@/payload-types'

type ProductWithRelations = Omit<Product, 'thumbnail' | 'category'> & {
  thumbnail: Media
  category: Category
}

interface PaginatedDocs {
  docs: ProductWithRelations[]
  totalDocs: number
  totalPages: number
  page: number
}

export default function ProductsGrid() {
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          depth: '2',
          limit: '12',
          page: String(page),
          sort: '-createdAt',
        })
        if (search) {
          params.append('where[title][contains]', search)
        }
        const res = await fetch(`/api/products?${params}`)
        const data: PaginatedDocs = await res.json()
        setProducts(data.docs)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, search])

  return (
    <Gutter>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--theme-elevation-800)]">Products</h1>
        <Link
          href="/admin/collections/products/create"
          className="flex items-center gap-2 py-2 px-4 rounded-md bg-[var(--theme-elevation-100)] no-underline font-medium hover:bg-[var(--theme-elevation-150)] transition-colors"
        >
          <Plus size={18} />
          Create New
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
            <Search size={18} className="text-[var(--theme-elevation-400)]" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full max-w-md pl-10 pr-4 py-2 rounded-md border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-0)] text-[var(--theme-elevation-800)] placeholder:text-[var(--theme-elevation-400)] focus:outline-none focus:border-[var(--theme-elevation-300)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-[var(--theme-elevation-50)] animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-[var(--theme-elevation-500)]">
          {search ? 'No products found matching your search.' : 'No products yet.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {products.map((product) => {
              const thumbnailUrl = product.thumbnail?.url
              return (
                <Link
                  key={product.id}
                  href={`/admin/collections/products/${product.id}`}
                  className="group relative aspect-square rounded-lg overflow-hidden no-underline border border-[var(--theme-elevation-100)] hover:border-[var(--theme-elevation-300)] transition-all"
                >
                  {thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[var(--theme-elevation-100)] flex items-center justify-center text-[var(--theme-elevation-400)]">
                      No image
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium ${
                      product.status === 'published'
                        ? 'bg-white text-black'
                        : 'bg-white/20 text-white/70 backdrop-blur-sm'
                    }`}
                  >
                    {product.status}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="w-fit p-2 rounded bg-black/30 backdrop-blur-sm text-white font-medium truncate max-w-[60%]">
                        {product.title}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="w-fit p-2 rounded bg-black/30 backdrop-blur-sm text-white/80 text-sm truncate max-w-[40%]">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                      <div className="flex gap-2">
                        <span className="w-fit p-2 rounded bg-black/30 backdrop-blur-sm text-white/80 text-sm">
                          {product.inventory ?? 0} in stock
                        </span>
                        <span className="w-fit p-2 rounded bg-black/30 backdrop-blur-sm text-white font-semibold text-sm">
                          €{product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-md bg-[var(--theme-elevation-100)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--theme-elevation-150)] transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-[var(--theme-elevation-600)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-md bg-[var(--theme-elevation-100)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--theme-elevation-150)] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Gutter>
  )
}
