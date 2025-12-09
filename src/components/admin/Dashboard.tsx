import { getPayloadClient } from '@/lib/payload'
import { Gutter } from '@payloadcms/ui'
import {
  AlertCircle,
  ClipboardList,
  Euro,
  Package,
  Plus,
  ShoppingCart,
  User,
  UserX,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export default async function Dashboard() {
  const payload = await getPayloadClient()

  const [orders, unfulfilledOrders, products, customerCarts, guestCarts] = await Promise.all([
    payload.find({
      collection: 'orders',
      limit: 0,
      where: {
        status: { not_equals: 'cancelled' },
      },
    }),
    payload.find({
      collection: 'orders',
      limit: 0,
      where: {
        and: [
          { fulfillmentStatus: { not_equals: 'fulfilled' } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
    }),
    payload.find({
      collection: 'products',
      limit: 0,
    }),
    payload.find({
      collection: 'carts',
      limit: 0,
      where: {
        email: { exists: true },
      },
    }),
    payload.find({
      collection: 'carts',
      limit: 0,
      where: {
        email: { exists: false },
      },
    }),
  ])

  const allOrders = await payload.find({
    collection: 'orders',
    limit: 1000,
    where: {
      status: { not_equals: 'cancelled' },
    },
  })

  const totalRevenue = allOrders.docs.reduce((sum, order) => sum + (order.total || 0), 0)

  const stats: { label: string; value: string | number; href: string; icon: LucideIcon; highlight?: boolean }[] = [
    {
      label: 'Total Revenue',
      value: `€${totalRevenue.toFixed(2)}`,
      href: '/admin/collections/orders',
      icon: Euro,
    },
    {
      label: 'Total Orders',
      value: orders.totalDocs,
      href: '/admin/collections/orders',
      icon: ShoppingCart,
    },
    {
      label: 'Unfulfilled',
      value: unfulfilledOrders.totalDocs,
      href: '/admin/collections/orders?where[fulfillmentStatus][not_equals]=fulfilled',
      icon: AlertCircle,
      highlight: unfulfilledOrders.totalDocs > 0,
    },
    {
      label: 'Products',
      value: products.totalDocs,
      href: '/admin/collections/products',
      icon: Package,
    },
    {
      label: 'Customers',
      value: customerCarts.totalDocs,
      href: '/admin/collections/carts',
      icon: User,
    },
    {
      label: 'Guests',
      value: guestCarts.totalDocs,
      href: '/admin/collections/carts',
      icon: UserX,
    },
  ]

  return (
    <Gutter>
      <div className="mb-8">
        <Image src="/logo.png" alt="φως" width={80} height={80} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`p-6 rounded-lg no-underline transition-all duration-200 ${
              stat.highlight
                ? 'bg-[var(--theme-error-100)] border border-[var(--theme-error-400)]'
                : 'bg-[var(--theme-elevation-50)] border border-[var(--theme-elevation-100)]'
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-[var(--theme-elevation-500)] mb-2">
              <stat.icon size={16} />
              {stat.label}
            </div>
            <div
              className={`text-3xl font-semibold ${
                stat.highlight ? 'text-[var(--theme-error-500)]' : 'text-[var(--theme-elevation-800)]'
              }`}
            >
              {stat.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link
          href="/admin/collections/orders"
          className="flex items-center gap-2 py-3 px-6 rounded-md bg-[var(--theme-elevation-100)] no-underline font-medium"
        >
          <ClipboardList size={18} />
          View Orders
        </Link>
        <Link
          href="/admin/collections/products"
          className="flex items-center gap-2 py-3 px-6 rounded-md bg-[var(--theme-elevation-100)] no-underline font-medium"
        >
          <Package size={18} />
          View Products
        </Link>
        <Link
          href="/admin/collections/products/create"
          className="flex items-center gap-2 py-3 px-6 rounded-md bg-[var(--theme-elevation-100)] no-underline font-medium"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>
    </Gutter>
  )
}
