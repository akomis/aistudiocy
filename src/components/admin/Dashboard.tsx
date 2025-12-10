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
import { OrdersChart } from './OrdersChart'
import { FulfillmentButton } from './FulfillmentButton'

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
      limit: 10,
      sort: '-createdAt',
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

  // Aggregate orders by day for chart
  const ordersByDay = allOrders.docs.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt)
      const dayKey = `${date.getDate()}/${date.getMonth() + 1}`
      const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      if (!acc[dayKey]) {
        acc[dayKey] = { date: dayKey, total: 0, timestamp }
      }
      acc[dayKey].total += order.total || 0
      return acc
    },
    {} as Record<string, { date: string; total: number; timestamp: number }>
  )

  const chartData = Object.values(ordersByDay)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ date, total }) => ({ date, total: Math.round(total * 100) / 100 }))

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
      <div className="flex items-center justify-between mb-8">
        <Image src="/logo.png" alt="φως" width={80} height={80} />
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

      <div className="mb-8 p-6 rounded-lg bg-[var(--theme-elevation-50)] border border-[var(--theme-elevation-100)]">
        <h2 className="text-lg font-semibold text-[var(--theme-elevation-800)] mb-4">Total Sales</h2>
        <OrdersChart data={chartData} />
      </div>

      {unfulfilledOrders.docs.length > 0 && (
        <div className="p-6 rounded-lg bg-[var(--theme-elevation-50)] border border-[var(--theme-elevation-100)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--theme-elevation-800)]">Unfulfilled Orders</h2>
            <Link
              href="/admin/collections/orders?where[fulfillmentStatus][not_equals]=fulfilled"
              className="text-sm text-[var(--theme-elevation-500)] no-underline hover:underline"
            >
              View all ({unfulfilledOrders.totalDocs})
            </Link>
          </div>
          <div className="space-y-2">
            {unfulfilledOrders.docs.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-md bg-[var(--theme-elevation-100)]"
              >
                <Link
                  href={`/admin/collections/orders/${order.id}`}
                  className="flex items-center gap-4 no-underline hover:underline"
                >
                  <span className="font-mono font-medium text-[var(--theme-elevation-800)]">
                    {order.displayId}
                  </span>
                  <span className="text-sm text-[var(--theme-elevation-500)]">{order.email}</span>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--theme-elevation-500)]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-[var(--theme-elevation-800)]">
                    €{order.total?.toFixed(2)}
                  </span>
                  <FulfillmentButton orderId={String(order.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Gutter>
  )
}
