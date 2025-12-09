import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    const landingPage = await payload.findGlobal({
      slug: 'landing-page',
      depth: 2,
    })

    return NextResponse.json({ landingPage })
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 })
  }
}
