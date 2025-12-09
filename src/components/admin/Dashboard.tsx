import { getPayloadClient } from '@/lib/payload'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'

export default async function Dashboard() {
  const payload = await getPayloadClient()

  const [orders, unfulfilledOrders, products] = await Promise.all([
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
  ])

  const allOrders = await payload.find({
    collection: 'orders',
    limit: 1000,
    where: {
      status: { not_equals: 'cancelled' },
    },
  })

  const totalRevenue = allOrders.docs.reduce((sum, order) => sum + (order.total || 0), 0)

  const stats = [
    {
      label: 'Total Orders',
      value: orders.totalDocs,
      href: '/admin/collections/orders',
    },
    {
      label: 'Total Revenue',
      value: `€${totalRevenue.toFixed(2)}`,
      href: '/admin/collections/orders',
    },
    {
      label: 'Unfulfilled',
      value: unfulfilledOrders.totalDocs,
      href: '/admin/collections/orders?where[fulfillmentStatus][not_equals]=fulfilled',
      highlight: unfulfilledOrders.totalDocs > 0,
    },
    {
      label: 'Products',
      value: products.totalDocs,
      href: '/admin/collections/products',
    },
  ]

  return (
    <Gutter>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: stat.highlight ? 'var(--theme-error-100)' : 'var(--theme-elevation-50)',
              border: stat.highlight
                ? '1px solid var(--theme-error-400)'
                : '1px solid var(--theme-elevation-100)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                fontSize: '0.875rem',
                color: 'var(--theme-elevation-500)',
                marginBottom: '0.5rem',
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 600,
                color: stat.highlight ? 'var(--theme-error-500)' : 'var(--theme-elevation-800)',
              }}
            >
              {stat.value}
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 500 }}>
        Quick Actions
      </h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/admin/collections/orders"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-elevation-100)',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 500,
          }}
        >
          View Orders
        </Link>
        <Link
          href="/admin/collections/products"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-elevation-100)',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 500,
          }}
        >
          View Products
        </Link>
        <Link
          href="/admin/collections/products/create"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-elevation-100)',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 500,
          }}
        >
          Add Product
        </Link>
      </div>
    </Gutter>
  )
}
