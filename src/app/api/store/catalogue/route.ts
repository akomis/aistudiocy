import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    const catalogue = await payload.findGlobal({
      slug: 'catalogue',
      depth: 2,
    })

    return NextResponse.json({ catalogue })
  } catch (error) {
    console.error('Error fetching catalogue:', error)
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 })
  }
}
