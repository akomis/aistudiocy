import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country_code')?.toLowerCase()

    const options = await payload.find({
      collection: 'shipping',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })

    // Filter by country if specified
    let filteredOptions = options.docs
    if (countryCode) {
      filteredOptions = options.docs.filter((option: any) =>
        option.countries?.some((c: string) => c.toLowerCase() === countryCode),
      )
    }

    return NextResponse.json({ shipping_options: filteredOptions })
  } catch (error) {
    console.error('Error fetching shipping options:', error)
    return NextResponse.json({ error: 'Failed to fetch shipping options' }, { status: 500 })
  }
}
