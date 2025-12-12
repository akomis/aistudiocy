import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const { productId, quantity = 1 } = await request.json()

    // Get current cart
    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 0,
    })

    // Get product
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const inventory = product.inventory ?? 1
    if (inventory === 0) {
      return NextResponse.json({ error: 'Product is no longer available' }, { status: 400 })
    }

    // Check if item already exists in cart
    const items = cart.items || []
    const existingItemIndex = items.findIndex((item: any) => {
      const itemProductId =
        typeof item.product === 'string' || typeof item.product === 'number'
          ? String(item.product)
          : item.product?.id
      return itemProductId === productId
    })

    let updatedItems
    if (existingItemIndex >= 0) {
      updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      }
    } else {
      updatedItems = [
        ...items,
        {
          product: productId,
          quantity,
          unitPrice: product.price,
        },
      ]
    }

    const updatedCart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: { items: updatedItems },
      depth: 2,
    })

    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('Error adding line item:', error)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}
